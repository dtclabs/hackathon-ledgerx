/* eslint-disable class-methods-use-this */
// SentryService.ts
import * as Sentry from '@sentry/nextjs'
import { Integrations } from '@sentry/tracing'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
const shouldSendToSentry = ['staging', 'production'].includes(process.env.NEXT_PUBLIC_ENVIRONMENT)

interface ICaptureMessage {
  message: string
  level: ErrorLevels
  extra: any
}

interface ISetBaseContext {
  userId: string
  userLoginCredential?: string // Use username property
  organizationId: string
}

interface IAddBreadcrumb {
  type?: string
  category?: string
  message: string
  level: ErrorLevels
  data?: any
}

type ErrorLevels = 'critical' | 'error' | 'warning' | 'info' | 'debug' | 'fatal' | 'log'

class SentryService {
  private static instance: SentryService | null = null

  private constructor() {
    if (!SentryService.instance) {
      Sentry.init({
        dsn: SENTRY_DSN || 'https://e21a7ccc5ddd4261b0faccf57b93ad6c@o1214724.ingest.sentry.io/6360447',
        attachStacktrace: true,
        tracesSampleRate: 1.0,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
        // enabled: shouldSendToSentry,
        integrations: [
          new Integrations.BrowserTracing({
            tracingOrigins: ['localhost', 'your.domain.com']
          })
        ]
      })

      SentryService.instance = this
    }
  }

  public static getInstance(): SentryService {
    if (!SentryService.instance) {
      SentryService.instance = new SentryService()
    }
    return SentryService.instance
  }

  public captureMessage({ message, extra, level }: ICaptureMessage): void {
    Sentry.captureMessage(message, {
      level: level as Sentry.Severity,
      ...(extra && { extra })
      //   ...(extra && { extra })
    })
  }

  public setBaseContext({ userId, userLoginCredential, organizationId }: ISetBaseContext): void {
    Sentry.setUser({ id: userId, username: userLoginCredential })
    Sentry.setExtra('organizationId', organizationId)
  }

  public clearBaseContext({ userId }: ISetBaseContext): void {
    Sentry.setUser(null)
  }

  public captureException(exception: any): void {
    Sentry.captureException(exception)
  }

  public addBreadcrumb({ category, message, level, data, type }: IAddBreadcrumb): void {
    // Sentry uses breadcrumbs to create a trail of events that happened prior to an issue
    // You can manually add breadcrumbs whenever something interesting happens.
    Sentry.addBreadcrumb({
      type,
      category,
      message,
      data,
      level: level as Sentry.Severity
    })
  }

  public captureErrorType(errorType: string, message: string, data?: any): void {
    Sentry.captureEvent({
      message,
      exception: {
        values: [
          {
            type: errorType,
            value: message
          }
        ]
      },
      extra: data || {}
    })
  }

  // You can add more methods as needed
}

export default SentryService
