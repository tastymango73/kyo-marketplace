import { BaseOAuthService } from './base-oauth.service'
import { GoogleProfile, ProviderOptions, UserInfo } from './types'

export class GoogleProvider extends BaseOAuthService {
  constructor(options: ProviderOptions) {
    super({
      name: 'google',
      authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      access_url: 'https://oauth2.googleapis.com/token',
      profile_url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    })
  }

  async extractUserInfo(data: GoogleProfile): Promise<UserInfo> {
    return super.extractUserInfo({
      email: data.email,
      name: data.name,
      picture: data.picture,
    })
  }
}
