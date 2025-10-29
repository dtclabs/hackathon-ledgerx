import { Module } from '@nestjs/common'
import { SentryInterceptor } from './sentry.interceptor'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { SentryService } from './sentry.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [
    SentryService,
    {
      // This makes the interceptor global
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    }
  ],
  controllers: [],
  exports: [SentryService]
})
export class SentryModule {}
