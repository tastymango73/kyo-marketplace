import { Inject, Injectable } from '@nestjs/common'

import { ProviderOptionsSymbol } from './oauth.constants'
import { Options } from './types'

@Injectable()
export class OAuthService {
  constructor(@Inject(ProviderOptionsSymbol) private readonly options: Options) {}

  onModuleInit() {
    for (const provider of this.options.services) {
      provider.baseUrl = this.options.baseUrl
    }
  }

  findByService(service: string) {
    return this.options.services.find(provider => provider.name === service)
  }
}
