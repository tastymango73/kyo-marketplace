import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { IS_DEV_ENV } from './common/utils'
import { MailModule } from './infra/mail/mail.module'
import { PrismaModule } from './infra/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
      expandVariables: true,
    }),

    // Infra
    PrismaModule,
    MailModule,

    // Modules
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
