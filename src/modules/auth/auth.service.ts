import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import type { Request, Response } from 'express'
import { AuthMethod } from 'prisma/generated/client'

import { isDev, toMs } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'

import { UserService } from '../user/user.service'

import { LoginRequest, RegisterRequest } from './dto'
import { OAuthService } from './oauth/oauth.service'
import { JwtPayload } from './types'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string
  private readonly JWT_REFRESH_TOKEN_TTL: string

  private readonly COOKIE_DOMAIN: string

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly oauthService: OAuthService,
    private readonly prismaService: PrismaService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL')
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL')

    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN')
  }

  async register(dto: RegisterRequest) {
    const exists = await this.userService.findByEmail(dto.email)

    if (exists) {
      throw new ConflictException('User already exists')
    }

    await this.userService.create({
      ...dto,
      method: AuthMethod.CREDENTIALS,
      isVerified: false,
    })

    return { message: 'User registered successfully' }
  }

  async login(res: Response, dto: LoginRequest) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user || !user.password) {
      throw new NotFoundException('User not found')
    }

    const isPasswordValid = await verify(user.password, dto.password)

    if (!isPasswordValid) {
      throw new NotFoundException('User not found')
    }

    return this.auth(res, user.id)
  }

  async extractProfileFromCode(res: Response, provider: string, code: string) {
    const instance = this.oauthService.findByService(provider)

    if (!instance) {
      throw new NotFoundException('Provider not found')
    }

    const profile = await instance.findUserByCode(code)

    const account = await this.prismaService.account.findFirst({
      where: {
        id: profile.id,
        provider: profile.provider,
      },
    })

    let user = account?.userId ? await this.userService.findOne(account.userId) : null

    if (user) {
      return this.auth(res, user.id)
    }

    user = await this.userService.create({
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      method: AuthMethod[profile.provider.toUpperCase() as keyof typeof AuthMethod],
      isVerified: true,
    })

    if (!account) {
      await this.prismaService.account.create({
        data: {
          id: profile.id,
          provider: profile.provider,
          method: AuthMethod[profile.provider.toUpperCase() as keyof typeof AuthMethod],
          userId: user.id,
          refreshToken: profile.refresh_token,
          accessToken: profile.access_token,
          expiresAt: profile.expires_at,
        },
      })
    }

    return this.auth(res, user.id)
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken)

    if (!payload?.id) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const user = await this.userService.findOne(payload.id)

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    return this.auth(res, user.id)
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0))

    return { message: 'User logged out successfully' }
  }

  async validate(id: string) {
    const user = await this.userService.findOne(id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id)

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + toMs(this.JWT_REFRESH_TOKEN_TTL)),
    )

    return { accessToken }
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL as any,
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL as any,
    })

    return { accessToken, refreshToken }
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    })
  }
}
