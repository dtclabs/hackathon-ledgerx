// Import Sentry Instrument with SDK as the first module, All Sentry config should be included in this import
import './instrument'

import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import Decimal from 'decimal.js'
import * as requestIp from 'request-ip'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api/v1')
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableCors()
  app.use(requestIp.mw())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const configService = app.get(ConfigService)
  // Decimal library setup
  // https://stackoverflow.com/questions/72813558/storing-up-to-78-digits-in-a-relational-database
  Decimal.set({ precision: 78 })
  Decimal.set({ toExpPos: 78 })
  Decimal.set({ toExpNeg: -78 })

  // Swagger doc setup
  const config = new DocumentBuilder()
    .setTitle('LedgerX API')
    .setDescription('LedgerX API Specification')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  // We had 503 error in AWS API Gateway, so we added headers to fix it
  // see https://stackoverflow.com/questions/68107664/aws-http-api-gateway-503-service-unavailable
  const server = app.getHttpServer()
  server.keepAliveTimeout = 35000

  await app.listen(configService.get<number>('PORT') || 3001)
}
bootstrap()
