import { forwardRef, Module } from '@nestjs/common'

import { MailModule } from '@/infra/mail/mail.module'
import { MailService } from '@/infra/mail/mail.service'
import { UserService } from '@/modules/user/user.service'

import { AuthModule } from '../auth.module'

import { EmailConfirmationController } from './email-confirmation.controller'
import { EmailConfirmationService } from './email-confirmation.service'

@Module({
  imports: [MailModule, forwardRef(() => AuthModule)],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService, UserService, MailService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
