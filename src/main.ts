import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { getValidationPipeConfig } from './config'
import { setupSwagger } from './shared/utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()))

  app.setGlobalPrefix('api')

  setupSwagger(app)

  await app.listen(configService.getOrThrow<number>('APPLICATION_PORT'))
}

bootstrap()
