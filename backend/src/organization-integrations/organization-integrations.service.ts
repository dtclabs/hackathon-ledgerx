import { AccountToken } from '@mergeapi/merge-hris-node'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ChartOfAccountsService } from '../chart-of-accounts/chart-of-accounts.service'
import {
  ChangeFiatCurrencyForOrganizationEventParams,
  FinancialTransformationsEventType
} from '../domain/financial-transformations/events/events'
import { DtcpayService } from '../domain/integrations/dtcpay/dtcpay.service'
import { CurrencyCategory, LoginResponse, Module, ResponseCode } from '../domain/integrations/dtcpay/interfaces'
import { GetAccessTokenFromCodeResponse } from '../domain/integrations/request-finance/interfaces'
import { RequestFinanceService } from '../domain/integrations/request-finance/request-finance.service'
import { SettingsDto } from '../setting/interfaces'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { COASource, COASourceStatus } from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { IntegrationWhitelistRequestStatus } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-requests.entity'
import { IntegrationWhitelistRequestEntityService } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-requests.entity-service'
import { IntegrationName, IntegrationStatus } from '../shared/entity-services/integration/integration.entity'
import { IntegrationEntityService } from '../shared/entity-services/integration/integration.entity-service'
import { OrganizationIntegrationStatus } from '../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { TimezonesEntityService } from '../shared/entity-services/timezones/timezones.entity-service'
import { WalletStatusesEnum } from '../shared/entity-services/wallets/interfaces'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import {
  accountingIntegrations,
  COADataDTO,
  CreateOrganizationIntegrationDTO,
  MigrationDataDTO,
  OrganizationIntegrationDTO,
  whitelistRequiredIntegrations
} from './interfaces'
import { AccountingService } from '../domain/integrations/accounting/accounting.service'
import { LinkToken, Platform } from '../domain/integrations/accounting/interfaces'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FeatureFlagOption } from '../shared/entity-services/feature-flags/interfaces'
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult'

@Injectable()
export class OrganizationIntegrationsService {
  constructor(
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private integrationWhiteListEntityService: IntegrationWhitelistRequestEntityService,
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private chartOfAccountsService: ChartOfAccountsService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private blockchainsEntityService: BlockchainsEntityService,
    private accountingService: AccountingService,
    private requestFinanceService: RequestFinanceService,
    private dtcpayService: DtcpayService,
    private accountsEntityService: AccountsEntityService,
    private organizationsEntityService: OrganizationsEntityService,
    private integrationEntityService: IntegrationEntityService,
    private logger: LoggerService,
    private timezonesService: TimezonesEntityService,
    private fiatCurrenciesService: FiatCurrenciesEntityService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private walletsService: WalletsEntityService,
    private eventEmitter: EventEmitter2,
    private featureFlagsEntityService: FeatureFlagsEntityService
  ) {}

  async initializeNewRequestFinanceIntegration(
    organizationId: string,
    createOrganizationIntegrationDTO: CreateOrganizationIntegrationDTO
  ): Promise<OrganizationIntegrationDTO> {
    if (!createOrganizationIntegrationDTO.code) {
      throw new BadRequestException('Missing code')
    }
    if (!createOrganizationIntegrationDTO.redirectUri) {
      throw new BadRequestException('Missing redirectUri')
    }

    try {
      const response: GetAccessTokenFromCodeResponse = await this.requestFinanceService.getAccessTokenFromCode(
        createOrganizationIntegrationDTO.code,
        createOrganizationIntegrationDTO.redirectUri
      )

      // Refresh slightly before the expiration time as we have a slight delay from the time the access token was requested
      const expiredAt = dateHelper.getUTCTimestampSecondsForward(response.expires_in - 1000)

      const organizationIntegration =
        await this.organizationIntegrationsEntityService.createOrganizationIntegrationWithAuth({
          integrationName: createOrganizationIntegrationDTO.integrationName,
          organizationId,
          auth: {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiredAt: expiredAt
          }
        })

      return OrganizationIntegrationDTO.map(organizationIntegration)
    } catch (e) {
      this.logger.error('Error with getting access token from Request Finance', { organizationId: organizationId }, e)
      throw new InternalServerErrorException(
        'There is a problem connecting to Request Finance, please contact our team if the issue persists.'
      )
    }
  }

  async initializeNewAccountingIntegration(
    organizationId: string,
    accountId: string,
    createOrganizationIntegrationDto: CreateOrganizationIntegrationDTO
  ): Promise<OrganizationIntegrationDTO> {
    const integrationWhitelistRequestResult =
      await this.integrationWhiteListEntityService.getIntegrationNameAndOrganizationId(
        createOrganizationIntegrationDto.integrationName,
        organizationId,
        IntegrationWhitelistRequestStatus.APPROVED
      )

    const integrationResult = await this.integrationEntityService.findOne({
      where: { name: createOrganizationIntegrationDto.integrationName, status: IntegrationStatus.ENABLED }
    })

    if (!integrationResult) {
      throw new NotFoundException(`Integration does not exist`)
    }

    if (
      !integrationWhitelistRequestResult &&
      whitelistRequiredIntegrations.includes(createOrganizationIntegrationDto.integrationName)
    ) {
      throw new NotFoundException(`Can not find integration whitelist request`)
    }

    let organizationName = ''
    let organizationContact = ''

    if (integrationWhitelistRequestResult) {
      organizationName = integrationWhitelistRequestResult.organizationId.name
      organizationContact = integrationWhitelistRequestResult.contactEmail
    } else {
      const account = await this.accountsEntityService.findOne({ where: { id: accountId } })
      const organization = await this.organizationsEntityService.findOne({ where: { id: organizationId } })

      organizationName = organization.name
      organizationContact = account.name
    }

    // get available platform name in case integrationName is xero or quickbooks. The platform is either merge or rootfi
    const platform = await this.accountingService.getAvailablePlatformName(
      organizationId,
      createOrganizationIntegrationDto.integrationName
    )

    let organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: createOrganizationIntegrationDto.integrationName,
        organizationId,
        statuses: [OrganizationIntegrationStatus.INITIATED],
        platform: platform
      })

    if (!organizationIntegration) {
      organizationIntegration = await this.organizationIntegrationsEntityService.create({
        status: OrganizationIntegrationStatus.INITIATED,
        integration: { name: createOrganizationIntegrationDto.integrationName },
        organization: { id: organizationId },
        platform: platform
      })
    }

    // get link token from accounting service.
    // then insert result (includes company_id) to database if organizationIntegration is not found
    const linkTokenResult = await this.getLinkToken(
      organizationId,
      organizationName,
      organizationContact,
      integrationResult.integrationId
    )

    const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
    if (!organizationIntegration.organizationIntegrationAuth && isRootfiAvailable) {
      await this.organizationIntegrationsEntityService.addRootfiOrgIdToOrganizationIntegration({
        organizationIntegrationId: organizationIntegration.id,
        orgId: linkTokenResult.company_id
      })
    }

    return OrganizationIntegrationDTO.mapWithLinkToken(organizationIntegration, linkTokenResult)
  }

  async initializeNewDtcpayIntegration(
    organizationId: string,
    createOrganizationIntegrationDTO: CreateOrganizationIntegrationDTO
  ): Promise<OrganizationIntegrationDTO> {
    const signKey = createOrganizationIntegrationDTO.metadata.signKey
    const merchantId = createOrganizationIntegrationDTO.metadata.merchantId
    const terminalId = createOrganizationIntegrationDTO.metadata.terminalId

    let response: LoginResponse

    try {
      response = await this.dtcpayService.login(signKey, merchantId, terminalId)
    } catch (e) {
      this.logger.error('Error logging in to dtcpay', { organizationId: organizationId }, e)
      throw new InternalServerErrorException(
        'Invalid login. Verify your credentials and reach out to our team if the problem continues.'
      )
    }

    if (response.header.code !== ResponseCode.SUCCESS) {
      this.logger.error('Failed to login to dtcpay', { organizationId: organizationId, response: response })
      throw new BadRequestException('Invalid login. Please verify your credentials.')
    }

    if (!response.terminalInfo?.requestCurrency) {
      this.logger.error('Missing dtcpay request currency', { organizationId: organizationId, response: response })
      throw new BadRequestException('Missing currency in dtcpay setup')
    }

    const blockchains = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
    const modules = response.channels.map((channel) => Module[channel.module]).filter((module) => module)

    if (modules.filter((module) => blockchains.includes(module.toLowerCase())).length === 0) {
      this.logger.error('No available dtcpay payment channels', { organizationId: organizationId, response: response })
      throw new BadRequestException('Missing payment methods in dtcpay setup')
    }

    const organizationIntegration =
      await this.organizationIntegrationsEntityService.createOrganizationIntegrationWithAuth({
        integrationName: createOrganizationIntegrationDTO.integrationName,
        organizationId: organizationId,
        metadata: {
          currency: response.terminalInfo.requestCurrency,
          currencyCategory: (
            CurrencyCategory[this.dtcpayService.getCurrencyCategory(response.terminalInfo.requestCurrency)] as string
          )?.toLowerCase(),
          companyName: response.merchantInfo.name,
          address: {
            country: response.merchantInfo.country,
            city: response.merchantInfo.city,
            state: response.merchantInfo.state,
            postalCode: response.merchantInfo.postalCode,
            address: response.merchantInfo.address
          },
          channels: response.channels
        },
        auth: {
          metadata: {
            signKey: signKey,
            merchantId: merchantId,
            terminalId: terminalId
          }
        }
      })
    return OrganizationIntegrationDTO.map(organizationIntegration)
  }

  async getLinkToken(
    organizationId: string,
    organizationName: string,
    organizationEmail: string,
    integration: string
  ): Promise<LinkToken> {
    return await this.accountingService.getLinkToken(organizationId, organizationName, organizationEmail, integration)
  }

  async getAccountToken(token: string): Promise<AccountToken> {
    try {
      const accountToken = await this.accountingService.getAccountToken(token)
      return accountToken
    } catch (error) {
      console.log(error)
      throw new ConflictException(error)
    }
  }

  async findCOARemoteIdAndSave(
    accountToken: string,
    remoteIdList: COADataDTO[],
    integrationName: IntegrationName,
    organizationId: string,
    accountId: string
  ) {
    const COAFromIntegration = await this.chartOfAccountsService.getCOAFromIntegration(
      organizationId,
      integrationName,
      {},
      accountToken
    )
    const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
    const sanitizeCOAFromIntegration = COAFromIntegration.filter(
      (item) =>
        this.accountingService.sanitize(item, integrationName, isRootfiAvailable) &&
        item.status !== COASourceStatus.INACTIVE
    )
    const COAListToBeSaved = []
    const COAListToBeUpdated = []

    for (let i = 0; i < remoteIdList.length; i++) {
      const incomingData = remoteIdList[i]
      for (let j = 0; j < sanitizeCOAFromIntegration.length; j++) {
        const integrationData = sanitizeCOAFromIntegration[j]
        if (incomingData.remoteId !== integrationData.id) continue

        const platformId = integrationData.remote_id
        const COAFromOrganizationIdAndPlatfromId =
          await this.chartOfAccountsService.getLatestByOrganizationIdAndPlatformId(organizationId, platformId)
        // add to update list if COAFromOrganizationIdAndPlatfromId found
        if (COAFromOrganizationIdAndPlatfromId) {
          COAListToBeUpdated.push({
            id: COAFromOrganizationIdAndPlatfromId.id,
            data: {
              deletedAt: null,
              source: COASource.INTEGRATION,
              integration: integrationName,
              ...(isRootfiAvailable ? { rootfiId: integrationData.id } : { remoteId: integrationData.id })
            }
          })
        } else {
          COAListToBeSaved.push({
            name: integrationData.name,
            description: integrationData.description,
            code: integrationData.account_number,
            type: integrationData.type,
            integration: integrationName,
            organization: organizationId,
            source: COASource.INTEGRATION,
            status: integrationData.status,
            createdBy: accountId,
            platformId,
            ...(isRootfiAvailable ? { rootfiId: integrationData.id } : { remoteId: integrationData.id })
          })
        }
      }
    }
    if (remoteIdList.length !== COAListToBeSaved.length + COAListToBeUpdated.length) {
      throw new BadRequestException('Invalid remote id does not match source')
    }
    await this.chartOfAccountsEntityService.insert(COAListToBeSaved)
    for (const COA of COAListToBeUpdated) {
      await this.chartOfAccountsEntityService.partiallyUpdate(COA.id, COA.data)
    }
    return true
  }

  async tagNewCOAtoFinancialMetaData(migration_data: MigrationDataDTO[]) {
    for (const item of migration_data) {
      const prevChartOfAccount = await this.chartOfAccountsEntityService.findByPublicId(item.previousCOAId)
      const newChartOfAccount = item.remoteId
        ? await this.chartOfAccountsEntityService.findByRemoteId(item.remoteId)
        : null
      await this.financialTransactionsEntityService.replaceMetadataCOAId(prevChartOfAccount.id, newChartOfAccount?.id)
      await this.chartOfAccountMappingsEntityService.replaceCOAId(prevChartOfAccount.id, newChartOfAccount?.id)
    }
    return true
  }

  async syncXeroSettings(params: {
    integrationName: IntegrationName
    organizationId: string
    accountId: string
    accessToken?: string
  }): Promise<SettingsDto> {
    const companyInfo = await this.accountingService.getCompanyInfo(params.organizationId, params.integrationName, true)
    const currentSettings = await this.organizationSettingsService.getByOrganizationId(params.organizationId, {
      country: true,
      fiatCurrency: true,
      timezone: true
    })

    if (companyInfo) {
      const timezone = companyInfo.timezone ? await this.timezonesService.getByXeroTimezone(companyInfo.timezone) : null
      const fiatCurrency = companyInfo.currency
        ? await this.fiatCurrenciesService.getByAlphabeticCode(companyInfo.currency)
        : null

      const newSettings = {
        fiatCurrency: fiatCurrency ?? currentSettings.fiatCurrency,
        timezone: timezone ?? currentSettings.timezone,
        country: currentSettings.country
      }

      await this.organizationSettingsService.partiallyUpdate(currentSettings.id, newSettings)

      if (newSettings.fiatCurrency.id !== currentSettings.fiatCurrency.id) {
        try {
          await this.walletsService.updateWalletsSyncStatusForOrganization(
            params.organizationId,
            WalletStatusesEnum.SYNCING
          )
        } catch (e) {
          this.logger.error('Error while syncing wallets', e, {
            organizationId: params.organizationId,
            fiatCurrencyAlphabeticCode: fiatCurrency.alphabeticCode
          })
        }

        this.eventEmitter.emit(
          FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION,
          ChangeFiatCurrencyForOrganizationEventParams.map({
            organizationId: params.organizationId,
            fiatCurrencyAlphabeticCode: fiatCurrency.alphabeticCode
          })
        )
      }

      return SettingsDto.map({ ...currentSettings, ...newSettings })
    }
  }

  // needMigratingToRootfi returns true if organization need to migrate data from merge to rootfi
  async needMigratingToRootfi(organizationId: string): Promise<boolean> {
    // check if rootfi is enabled for all or current organizationId
    let isWhitelisted = await this.featureFlagsEntityService.isFeatureEnabled(FeatureFlagOption.ENABLE_ROOTFI_SERVICE)
    if (!isWhitelisted) {
      isWhitelisted = await this.featureFlagsEntityService.isFeatureWhitelisted(
        organizationId,
        FeatureFlagOption.ENABLE_ROOTFI_SERVICE
      )
    }
    if (!isWhitelisted) {
      return false
    }

    // check if rootfi migration is enabled or not
    const isRootfiMigrationEnabled = await this.featureFlagsEntityService.isFeatureEnabled(
      FeatureFlagOption.ENABLE_ROOTFI_MIGRATION
    )
    if (!isRootfiMigrationEnabled) {
      return false
    }

    // get all integrations of an organization where integration name is quickbooks or xero regardless platform name
    const organizationIntegrations = await this.organizationIntegrationsEntityService.getByOrganization({
      organizationId,
      integrationNames: [IntegrationName.QUICKBOOKS, IntegrationName.XERO],
      statuses: [
        OrganizationIntegrationStatus.INITIATED,
        OrganizationIntegrationStatus.TOKEN_SWAPPED,
        OrganizationIntegrationStatus.COMPLETED
      ]
    })
    if (organizationIntegrations.length == 0) {
      throw new NotFoundException(`Cannot find any integrations with organizationId=${organizationId}`)
    }

    // the condition of the need migration is:
    // 1. User has merge (token_swapped or completed)
    // 2. No rootfi (or rootfi has just INITIATED)

    let isMergeQualified = false
    let isRootfiQualified = true

    for (const organizationIntegration of organizationIntegrations) {
      if (
        organizationIntegration.platform === Platform.ROOTFI &&
        organizationIntegration.status !== OrganizationIntegrationStatus.INITIATED
      ) {
        isRootfiQualified = false
      }
      if (
        organizationIntegration.platform === Platform.MERGE &&
        [OrganizationIntegrationStatus.TOKEN_SWAPPED, OrganizationIntegrationStatus.COMPLETED].includes(
          organizationIntegration.status
        )
      ) {
        isMergeQualified = true
      }
    }
    return isMergeQualified && isRootfiQualified
  }

  async recoverPreviousLinkedChartOfAccounts(
    organizationId: string,
    integrationName: IntegrationName
  ): Promise<boolean> {
    // get previous linked integration name
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getLastDeletedByIntegrationNamesAndOrganizationIdAndStatus({
        organizationId,
        integrationNames: accountingIntegrations,
        statuses: [OrganizationIntegrationStatus.COMPLETED]
      })
    if (organizationIntegration?.integration?.name !== integrationName) {
      return false
    }
    // recover COA
    const result: UpdateResult = await this.chartOfAccountsEntityService.recoverPreviousLinkedChartOfAccounts(
      organizationId,
      integrationName
    )
    if (result.affected && result.affected > 0) {
      this.logger.info('finish recovering previous linked COAs', {
        organizationId,
        integrationName,
        affected: result.affected
      })
      return true
    }
    return false
  }
}
