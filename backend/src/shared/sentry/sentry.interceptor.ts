import {ExecutionContext, Injectable, NestInterceptor, CallHandler, HttpException} from '@nestjs/common'
import { Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { SentryService } from './sentry.service'
import * as Sentry from '@sentry/node'

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

export interface SentryEntry {
  body: any
  origin: string
  action: string
}

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const { method, body, url } = request
    const entry: SentryEntry = {
      action: method,
      origin: url,
      body: body
    }
    const sentryTraceHeader = request.headers['sentry-trace']
    const baggageHeader = request.headers['baggage']

    return Sentry.continueTrace({ sentryTrace: sentryTraceHeader, baggage: baggageHeader }, () => {
      return Sentry.startSpan(
        {
          op: 'http',
          name: `${method} ${url}`,
          onlyIfParent: true
        },
        () => {
          return next.handle().pipe(
            catchError((err) => {
              let severity: Sentry.SeverityLevel = 'error'
              if (err instanceof HttpException) {
                const statusCode = err.getStatus()
                if (statusCode >= 400 && statusCode < 500) {
                  severity = 'warning'
                }
              }

              this.sentryService.addLog(severity, entry, err)
              throw err
            })
          )
        }
      )
    })
  }
}
