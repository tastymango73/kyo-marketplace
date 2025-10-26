import { BadRequestException, Injectable } from '@nestjs/common'

import { BaseProviderOptions, UserInfo } from './types'

@Injectable()
export class BaseOAuthService {
  private BASE_URL: string

  constructor(private readonly options: BaseProviderOptions) {}

  protected async extractUserInfo(data: any): Promise<UserInfo> {
    return {
      ...data,
      provider: this.options.name,
    }
  }

  getAuthUrl() {
    const query = new URLSearchParams({
      client_id: this.options.client_id,
      redirect_uri: this.getRedirectUrl(),
      scope: (this.options.scopes ?? []).join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'select_account',
    })
    return `${this.options.authorize_url}?${query.toString()}`
  }

  async findUserByCode(code: string): Promise<UserInfo> {
    const client_id = this.options.client_id
    const client_secret = this.options.client_secret

    const tokenQuery = new URLSearchParams({
      client_id,
      client_secret,
      code,
      redirect_uri: this.getRedirectUrl(),
      grant_type: 'authorization_code',
    })

    const tokenRequest = await fetch(this.options.access_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenQuery,
    })

    if (!tokenRequest.ok) {
      throw new BadRequestException(`Failed to get user from ${this.options.profile_url}`)
    }

    const tokens = await tokenRequest.json()

    if (!tokens.access_token) {
      throw new BadRequestException(
        `Failed to get access token from ${this.options.access_url}`,
      )
    }

    const userRequest = await fetch(this.options.profile_url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userRequest.ok) {
      throw new BadRequestException(`Failed to get user from ${this.options.profile_url}`)
    }

    const user = await userRequest.json()
    const userData = await this.extractUserInfo(user)

    return {
      ...userData,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at || tokens.expires_in,
      provider: this.options.name,
    }
  }

  getRedirectUrl() {
    return `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`
  }

  set baseUrl(val: string) {
    this.BASE_URL = val
  }

  get name() {
    return this.options.name
  }

  get access_url() {
    return this.options.access_url
  }

  get profile_url() {
    return this.options.profile_url
  }

  get scopes() {
    return this.options.scopes
  }
}
