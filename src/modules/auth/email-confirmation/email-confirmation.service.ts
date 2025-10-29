import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { TokenType } from 'prisma/generated/client'
import { User } from 'prisma/generated/client'
import { v4 as uuidv4 } from 'uuid'

import { toMs } from '@/common/utils'
import { MailService } from '@/infra/mail/mail.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { UserService } from '@/modules/user/user.service'

import { AuthService } from '../auth.service'

import { ConfirmationRequest } from './dto'

@Injectable()
export class EmailConfirmationService {
  private readonly EMAIL_CONFIRMATION_TOKEN_TTL: string

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    this.EMAIL_CONFIRMATION_TOKEN_TTL = configService.getOrThrow<string>(
      'EMAIL_CONFIRMATION_TOKEN_TTL',
    )
  }
  async newVerification(res: Response, dto: ConfirmationRequest) {
    const token = await this.prismaService.token.findFirst({
      where: {
        token: dto.token,
        type: TokenType.VERIFICATION,
      },
    })

    if (!token) {
      throw new NotFoundException('Token not found')
    }

    const hasExpired = new Date(token.expiresIn) < new Date()

    if (hasExpired) {
      throw new BadRequestException('Token expired')
    }

    const user = await this.userService.findByEmail(token.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.userService.update(user.id, { isVerified: true })

    await this.prismaService.token.delete({
      where: { id: token.id, type: TokenType.VERIFICATION },
    })

    return this.authService.auth(res, user.id)
  }

  async sendVerificationToken(email: string) {
    const verificationToken = await this.generateVerificationToken(email)

    await this.mailService.sendConfirmationEmail(email, verificationToken.token)

    return true
  }

  private async generateVerificationToken(email: string) {
    const token = uuidv4()
    const expiresIn = new Date(Date.now() + toMs(this.EMAIL_CONFIRMATION_TOKEN_TTL))

    const exists = await this.prismaService.token.findFirst({
      where: {
        email,
        type: TokenType.VERIFICATION,
      },
    })

    if (exists) {
      await this.prismaService.token.delete({ where: { id: exists.id } })
    }

    const verificationToken = await this.prismaService.token.create({
      data: {
        email,
        token,
        type: TokenType.VERIFICATION,
        expiresIn,
      },
    })

    return verificationToken
  }
}
