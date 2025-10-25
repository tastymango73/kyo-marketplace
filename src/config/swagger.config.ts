import { DocumentBuilder } from '@nestjs/swagger'

export const getSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Kyo Marketplace API')
    .setDescription('API for Kyo Marketplace')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
}
