import { Injectable } from '@nestjs/common'
import * as Sentry from '@sentry/node'
import { SentryEntry } from './sentry.interceptor'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SentryService {
  constructor(private configService: ConfigService) {}

  addLog(severity: Sentry.SeverityLevel, entry: SentryEntry, err: Error | string) {
    Sentry.withScope((scope) => {
      scope.setExtra('body', entry.body)
      scope.setExtra('origin', entry.origin)
      scope.setExtra('action', entry.action)
      scope.setLevel(severity)

      typeof err === 'string' ? Sentry.captureMessage(err) : Sentry.captureException(err)
    })
  }
}
