import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Recaptcha } from '@nestlab/google-recaptcha'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { LoginRequest, RegisterRequest } from './dto'
import { AuthProviderGuard } from './guards'
import { OAuthService } from './oauth/oauth.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Recaptcha()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequest) {
    return await this.authService.register(dto)
  }

  @Recaptcha()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res, dto)
  }

  @UseGuards(AuthProviderGuard)
  @Get('/oauth/callback/:provider')
  public async callback(
    @Res({ passthrough: true }) res: Response,
    @Query('code') code: string,
    @Param('provider') provider: string,
  ) {
    if (!code) {
      throw new BadRequestException('Code is required')
    }

    await this.authService.extractProfileFromCode(res, provider, code)

    return res.redirect(
      `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/dashboard/settings`,
    )
  }

  @UseGuards(AuthProviderGuard)
  @Get('oauth/connect/:provider')
  @HttpCode(HttpStatus.OK)
  async connect(@Param('provider') provider: string) {
    const instance = this.oauthService.findByService(provider)

    if (!instance) {
      throw new NotFoundException('Provider not found')
    }

    return {
      url: instance.getAuthUrl(),
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.refresh(req, res)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res)
  }
}
