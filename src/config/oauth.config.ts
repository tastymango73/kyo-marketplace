import { ConfigService } from '@nestjs/config'

import { GoogleProvider } from '@/modules/auth/oauth/providers/google.provider'
import { YandexProvider } from '@/modules/auth/oauth/providers/yandex.provider'
import { Options } from '@/modules/auth/oauth/types'

export const getOAuthConfig = async (configService: ConfigService): Promise<Options> => ({
  baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
  services: [
    new GoogleProvider({
      client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      scopes: ['email', 'profile'],
    }),
    new YandexProvider({
      client_id: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
      scopes: ['login:email', 'login:avatar', 'login:info'],
    }),
  ],
})
