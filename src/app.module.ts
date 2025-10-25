import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { InfraModule } from './infra/infra.module'
import { LibsModule } from './libs/libs.module'
import { IS_DEV_ENV } from './shared/utils'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
      expandVariables: true,
    }),
    InfraModule,
    ApiModule,
    LibsModule,
  ],
})
export class AppModule {}
