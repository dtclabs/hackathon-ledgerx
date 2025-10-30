import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { LoggerService } from '../../shared/logger/logger.service'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log(`Request: ${context.switchToHttp().getRequest().url}`)

    const now = Date.now()

    return next.handle().pipe(
      tap(() => this.logger.log(`Response ${context.switchToHttp().getRequest().url}: ${Date.now() - now}ms`)),
      catchError((error) => {
        const payload = {
          url: context.switchToHttp().getRequest().url,
          timestamp: new Date().toISOString(),
          error,
          responseTime: `${Date.now() - now}ms`
        }

        if (error instanceof HttpException) {
          const statusCode = error.getStatus()
          if (statusCode >= 400 && statusCode < 500) {
            // Capture 4XX errors as infos
            // Log levels from warning and above will be logged to sentry for paying organizations
            this.loggerService.info(error.message, error, payload)
          } else if (statusCode >= 500 && statusCode < 600) {
            // Capture 5XX errors as errors
            this.loggerService.error(`${statusCode}: ${error.message}`, error, payload)
          }
        } else {
          // Capture other types of errors as errors
          this.loggerService.error(error.message, error, payload)
        }

        throw error
      })
    )
  }
}
