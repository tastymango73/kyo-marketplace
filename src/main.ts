import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { setupSwagger } from './common/utils'
import { getValidationPipeConfig } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  const logger = new Logger(AppModule.name)

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()))

  app.setGlobalPrefix('api/v1')

  setupSwagger(app)

  try {
    await app.listen(configService.getOrThrow<number>('APPLICATION_PORT'))

    logger.log(
      `Application is running on: ${configService.getOrThrow<string>('APPLICATION_URL')}`,
    )
  } catch (err) {
    logger.error(`Failed to start the application: ${err.message}`)
    process.exit(1)
  }
}

bootstrap()
