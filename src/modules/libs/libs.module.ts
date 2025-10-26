import { Module } from '@nestjs/common'

import { MailModule } from '../../infra/mail/mail.module'

@Module({
  imports: [MailModule],
})
export class LibsModule {}
