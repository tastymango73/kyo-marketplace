import { DynamicModule, Module } from '@nestjs/common'

import { ProviderOptionsSymbol } from './oauth.constants'
import { OAuthService } from './oauth.service'
import { AsyncOptions, Options } from './types'

@Module({
  providers: [OAuthService],
})
export class OAuthModule {
  static register(options: Options): DynamicModule {
    return {
      module: OAuthModule,
      providers: [
        {
          provide: ProviderOptionsSymbol,
          useValue: options.services,
        },
        OAuthService,
      ],
      exports: [OAuthService],
    }
  }

  static registerAsync(options: AsyncOptions): DynamicModule {
    return {
      module: OAuthModule,
      imports: options.imports,
      providers: [
        {
          provide: ProviderOptionsSymbol,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [OAuthService],
    }
  }
}
