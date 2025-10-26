import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Request } from 'express'

import { OAuthService } from '../oauth/oauth.service'

@Injectable()
export class AuthProviderGuard implements CanActivate {
  public constructor(private readonly oauthService: OAuthService) {}

  public canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()

    const provider = request.params.provider

    const instance = this.oauthService.findByService(provider)

    if (!instance) {
      throw new NotFoundException('Provider not found')
    }

    return true
  }
}
