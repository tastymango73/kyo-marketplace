import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { LoginRequest, RegisterRequest } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequest) {
    return await this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res, dto)
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
