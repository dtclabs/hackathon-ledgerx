import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Sentry from '@sentry/node'
import { SeverityLevel } from '@sentry/node'
import { ClsService } from 'nestjs-cls'
import { OrganizationsEntityService } from '../entity-services/organizations/organizations.entity-service'
import { SubscriptionPlanName } from '../entity-services/subscriptions/interface'
import { SubscriptionsDomainService } from '../../domain/subscriptions/subscriptions.domain.service'

//Ensure the below is matching with SeverityLevel from @sentry/node
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

@Injectable()
export class LoggerService {
  private LOGGABLE_TAGS: string[]
  private MINIMUM_CONSOLE_LOG_LEVEL_INDEX
  private MINIMUM_SENTRY_LOG_LEVEL_INDEX
  private LOG_LEVEL_VALUES
  private shouldLogToSentry: boolean

  constructor(
    private configService: ConfigService,
    private clsService: ClsService,
    private organizationsEntityService: OrganizationsEntityService,
    private subscriptionsDomainService: SubscriptionsDomainService
  ) {
    const env = configService.get('DEPLOYMENT_ENV')
    this.LOGGABLE_TAGS = ['organizationId', 'walletId']
    this.LOG_LEVEL_VALUES = Object.values(LogLevel)

    this.MINIMUM_CONSOLE_LOG_LEVEL_INDEX = this.LOG_LEVEL_VALUES.indexOf(
      ['staging', 'production'].includes(env) ? LogLevel.INFO : LogLevel.DEBUG
    )

    this.MINIMUM_SENTRY_LOG_LEVEL_INDEX = this.LOG_LEVEL_VALUES.indexOf(LogLevel.WARNING)
    this.shouldLogToSentry = ['staging', 'production'].includes(env)
  }

  private async log(logLevel: LogLevel, message: string, ...optionalParams: any[]): Promise<void> {
    // Force log level to critical if organization is on paid plans
    if ([LogLevel.WARNING, LogLevel.ERROR].includes(logLevel)) {
      // Best effort, does not handle cases where params include multiple organizations
      const param = optionalParams?.find((optionalParam) => optionalParam.hasOwnProperty('organizationId'))

      // Identify organization in optional parameters first
      // Organization in local storage may not be accurate (i.e., cases where scheduler runs during API request)
      let organizationId = await this.getOrganizationIdFromContext(param)

      if (organizationId) {
        const isOrganizationUnderPlan = await this.subscriptionsDomainService.hasActive(organizationId, [
          SubscriptionPlanName.BUSINESS,
          SubscriptionPlanName.STARTER
        ])

        if (isOrganizationUnderPlan) {
          logLevel = LogLevel.CRITICAL
        }
      }
    }

    message = `[${logLevel.toUpperCase()}] ` + message

    const currentLogLevelIndex = this.LOG_LEVEL_VALUES.indexOf(logLevel)

    if (currentLogLevelIndex >= this.MINIMUM_CONSOLE_LOG_LEVEL_INDEX) {
      if ([LogLevel.ERROR, LogLevel.CRITICAL].includes(logLevel)) {
        console.error(message, optionalParams)
      } else {
        console.log(message, optionalParams)
      }
    }

    if (currentLogLevelIndex >= this.MINIMUM_SENTRY_LOG_LEVEL_INDEX) {
      if (this.shouldLogToSentry) {
        Sentry.withScope((sentryScope) => {
          for (const optionalParam of optionalParams) {
            for (const loggableTag of this.LOGGABLE_TAGS) {
              if (optionalParam.hasOwnProperty(loggableTag)) {
                sentryScope.setTag(loggableTag, optionalParam[loggableTag])
              }
            }
          }

          for (const optionalParam of optionalParams) {
            sentryScope.setExtras(optionalParam)
          }

          sentryScope.setLevel(logLevel as SeverityLevel)
          Sentry.captureMessage(message, sentryScope)
        })
      }
    }
  }

  private async getOrganizationIdFromContext(params: { [key: string]: string }) {
    let organizationId: string
    if (params) {
      organizationId = params['organizationId']
    } else if (this.clsService.get('organizationId')) {
      try {
        const organization = await this.organizationsEntityService.findOneByPublicId(
          this.clsService.get('organizationId')
        )
        if (organization) {
          organizationId = organization.id
        }
      } catch (error) {
        console.error(
          `[LoggerService]: Can not find organization with public id ${this.clsService.get('organizationId')}`,
          error
        )
      }
    }
    return organizationId
  }

  // Errors are self-contained to avoid disrupting application logic
  async debug(message: string, ...optionalParams: any[]): Promise<void> {
    try {
      await this.log(LogLevel.DEBUG, message, ...optionalParams)
    } catch (error) {
      console.error(message, optionalParams)
    }
  }

  async info(message: string, ...optionalParams: any[]): Promise<void> {
    try {
      await this.log(LogLevel.INFO, message, ...optionalParams)
    } catch (error) {
      console.error(message, optionalParams)
    }
  }

  async warning(message: string, ...optionalParams: any[]): Promise<void> {
    try {
      await this.log(LogLevel.WARNING, message, ...optionalParams)
    } catch (error) {
      console.error(message, optionalParams)
    }
  }

  async error(message: string, ...optionalParams: any[]): Promise<void> {
    try {
      await this.log(LogLevel.ERROR, message, ...optionalParams)
    } catch (error) {
      console.error(message, optionalParams)
    }
  }

  async critical(message: string, ...optionalParams: any[]): Promise<void> {
    try {
      await this.log(LogLevel.CRITICAL, message, ...optionalParams)
    } catch (error) {
      console.error(message, optionalParams)
    }
  }
}
