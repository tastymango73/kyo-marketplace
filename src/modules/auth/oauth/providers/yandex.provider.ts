import { BaseOAuthService } from './base-oauth.service'
import { ProviderOptions, UserInfo } from './types'
import { YandexProfile } from './types/yandex-profile.type'

export class YandexProvider extends BaseOAuthService {
  constructor(options: ProviderOptions) {
    super({
      name: 'yandex',
      authorize_url: 'https://oauth.yandex.ru/authorize',
      access_url: 'https://oauth.yandex.ru/token',
      profile_url: 'https://login.yandex.ru/info?format=json',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    })
  }

  async extractUserInfo(data: YandexProfile): Promise<UserInfo> {
    return super.extractUserInfo({
      email: data.emails?.[0],
      name: data.display_name,
      picture: data.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
        : undefined,
    })
  }
}
