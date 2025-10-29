import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import type { Response } from 'express'

import { ConfirmationRequest } from './dto'
import { EmailConfirmationService } from './email-confirmation.service'

@Controller('auth/email-confirmation')
export class EmailConfirmationController {
  constructor(private readonly emailConfirmationService: EmailConfirmationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async newVerification(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ConfirmationRequest,
  ) {
    return this.emailConfirmationService.newVerification(res, dto)
  }
}
