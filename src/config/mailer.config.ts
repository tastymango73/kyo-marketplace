import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

import { isDev } from '@/common/utils/is-dev.util'

export const getMailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.getOrThrow<string>('EMAIL_HOST'),
    port: configService.getOrThrow<number>('EMAIL_PORT'),
    secure: !isDev(configService),
    auth: {
      user: configService.getOrThrow<string>('EMAIL_LOGIN'),
      pass: configService.getOrThrow<string>('EMAIL_PASSWORD'),
    },
  },
  defaults: {
    from: `"Kyo Team" ${configService.getOrThrow<string>('EMAIL_LOGIN')}`,
  },
})
