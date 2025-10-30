import { AccountToken, AccountTokenApi, DeleteAccountApi, HttpBearerAuth } from '@mergeapi/merge-hris-node'
import { MergeClient } from '@mergeapi/merge-node-client'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { LinkToken } from '../interfaces'

export class MergeHrisAdapter {
  apiKey: string

  constructor(private readonly configService: ConfigService, private logger: LoggerService) {
    this.apiKey = this.configService.get('MERGE_ACCESS_TOKEN')
  }

  async getLinkToken(organizationName: string, organizationEmail: string, integration: string): Promise<LinkToken> {
    const merge = new MergeClient({
      apiKey: this.apiKey
    })
    try {
      const linkTokenResponse = await merge.ats.linkToken.create({
        endUserEmailAddress: organizationEmail, // your user's email address
        endUserOrganizationName: organizationName, // your user's organization name
        endUserOriginId: integration + '_' + organizationName, // unique entity ID
        categories: ['accounting'], // choose your category
        integration: integration,
        shouldCreateMagicLinkUrl: true
      })
      return {
        // TODO: enable this whenever we ready on frontend side
        // link_token: linkTokenResponse?.magicLinkUrl,
        link_token: linkTokenResponse?.linkToken,
        integration_name: linkTokenResponse?.integrationName ?? integration
      }
    } catch (error) {
      await this.logger.error('getLinkToken error', error)
      throw error
    }
  }

  async getAccountToken(token: string): Promise<AccountToken> {
    try {
      const auth = new HttpBearerAuth()
      auth.accessToken = this.apiKey
      const apiInstance = new AccountTokenApi()
      apiInstance.setDefaultAuthentication(auth)
      const publicToken = token
      const { body } = await apiInstance.accountTokenRetrieve(publicToken)
      return body
    } catch (error) {
      this.logger.error('getAccountToken error', error)
      throw error
    }
  }

  async deleteLinkedAccount(accountToken: string) {
    try {
      const auth = new HttpBearerAuth()
      auth.accessToken = this.apiKey
      const apiInstance = new DeleteAccountApi()
      apiInstance.setDefaultAuthentication(auth)
      await apiInstance.deleteAccountCreate(accountToken)
      return true
    } catch (error) {
      this.logger.error('deleteLinkedAccount error', error)
      throw error
    }
  }
}
