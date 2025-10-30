import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { FindOptionsRelations } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { ChartOfAccountRulesDomainService } from '../domain/chart-of-account-rules/chart-of-account-rules.domain.service'
import { NULL_API_STRING } from '../shared/constants'
import { ChartOfAccountMapping } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mapping.entity'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { ChartOfAccountMappingType } from '../shared/entity-services/chart-of-account-mapping/interfaces'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { Recipient } from '../shared/entity-services/contacts/recipient.entity'
import { RecipientsEntityService } from '../shared/entity-services/contacts/recipients.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import { ChartOfAccountMappingDto } from './interfaces'

@Injectable()
export class ChartOfAccountMappingsDomainService {
  COA_MAPPING_DEFAULT_RELATIONS: FindOptionsRelations<ChartOfAccountMapping> = {
    organization: true,
    chartOfAccount: true,
    wallet: true,
    cryptocurrency: true,
    recipient: true
  }

  constructor(
    private logger: LoggerService,
    private chartOfAccountsService: ChartOfAccountsEntityService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private walletsService: WalletsEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private recipientsEntityService: RecipientsEntityService,
    private chartOfAccountRulesDomainService: ChartOfAccountRulesDomainService
  ) {}

  async getChartOfAccountMappingsForOrganization(params: {
    organizationId: string
    type?: ChartOfAccountMappingType
    walletPublicIds?: string[]
    chartOfAccountPublicIds?: string[]
  }): Promise<ChartOfAccountMappingDto[]> {
    let walletIds = null
    let chartOfAccountIds = null

    if (params.walletPublicIds?.length > 0) {
      const wallets = await this.walletsService.getByOrganizationAndPublicIds(
        params.organizationId,
        params.walletPublicIds
      )
      if (wallets?.length > 0) {
        walletIds = wallets.map((item) => item.id)
      } else {
        throw new BadRequestException('walletPublicIds do not match to any wallet in the organization')
      }
    }

    let isNullChartOfAccount = params.chartOfAccountPublicIds?.includes(NULL_API_STRING)
    params.chartOfAccountPublicIds = params.chartOfAccountPublicIds?.filter((coa) => coa !== NULL_API_STRING)

    if (params.chartOfAccountPublicIds?.length) {
      const chartOfAccounts = await this.chartOfAccountsService.getByOrganizationIdAndPublicIds(
        params.organizationId,
        params.chartOfAccountPublicIds.filter((coa) => coa !== NULL_API_STRING)
      )
      if (chartOfAccounts?.length) {
        chartOfAccountIds = chartOfAccounts.map((item) => item.id)
      } else {
        throw new BadRequestException('chartOfAccountPublicIds do not match to any wallet in the organization')
      }
    }

    const chartOfAccountMappings =
      await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
        organizationId: params.organizationId,
        type: params.type,
        walletIds,
        chartOfAccountIds,
        isNullChartOfAccount,
        relations: { ...this.COA_MAPPING_DEFAULT_RELATIONS, organization: true }
      })

    return chartOfAccountMappings?.map((mapping) => ChartOfAccountMappingDto.map(mapping))
  }

  async createWalletChartOfAccountMapping(params: {
    organizationId: string
    chartOfAccountPublicId: string
    type: ChartOfAccountMappingType
    walletPublicId: string
    cryptocurrencyPublicId: string
  }): Promise<ChartOfAccountMappingDto> {
    const wallets = await this.walletsService.getByOrganizationAndPublicIds(params.organizationId, [
      params.walletPublicId
    ])
    if (!wallets?.length) {
      throw new BadRequestException('walletId does not match to any wallet in the organization')
    }

    const wallet = wallets.at(0)

    const cryptocurrency = await this.cryptocurrenciesService.getByPublicId(params.cryptocurrencyPublicId)
    if (!cryptocurrency) {
      throw new BadRequestException('cryptocurrencyId does not match to any cryptocurrency')
    }

    const chartOfAccount = await this.chartOfAccountsService.getByOrganizationIdAndPublicId(
      params.organizationId,
      params.chartOfAccountPublicId
    )

    if (!chartOfAccount) {
      throw new BadRequestException('Chart Of Account does not exist in the organization')
    }

    const existingMappings = await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
      organizationId: params.organizationId
    })

    for (const existingMapping of existingMappings) {
      if (existingMapping.wallet?.id !== wallet.id && existingMapping.chartOfAccount?.id === chartOfAccount.id) {
        throw new BadRequestException('Chart of Account is used for other default mapping')
      }
    }

    try {
      const chartOfAccountMapping = await this.chartOfAccountMappingsEntityService.create({
        chartOfAccount: { id: chartOfAccount.id },
        type: params.type,
        organization: { id: params.organizationId },
        wallet: { id: wallet.id },
        cryptocurrency: { id: cryptocurrency.id }
      })

      return ChartOfAccountMappingDto.map(chartOfAccountMapping)
    } catch (error) {
      const message = 'There is an issue in saving chartOfAccountMapping'
      this.logger.error(message, params.organizationId, error, chartOfAccount, params.type, wallet, cryptocurrency)
      throw new InternalServerErrorException(message)
    }
  }

  async createRecipientChartOfAccountMapping(params: {
    organizationId: string
    chartOfAccountPublicId: string
    type: ChartOfAccountMappingType
    recipientPublicId: string
  }): Promise<ChartOfAccountMappingDto> {
    const recipient = await this.recipientsEntityService.getByOrganizationAndPublicId(
      params.organizationId,
      params.recipientPublicId
    )

    if (!recipient) {
      throw new BadRequestException('Recipient does not match to anyone in the organization.')
    }

    const chartOfAccount = await this.chartOfAccountsService.getByOrganizationIdAndPublicId(
      params.organizationId,
      params.chartOfAccountPublicId
    )

    if (!chartOfAccount) {
      throw new BadRequestException('Chart Of Account does not exist in the organization')
    }

    const existingMappings = await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
      organizationId: params.organizationId
    })

    for (const existingMapping of existingMappings) {
      if (existingMapping.chartOfAccount?.id === chartOfAccount.id) {
        throw new BadRequestException('Chart of Account is used for other default mapping')
      }
    }

    try {
      const chartOfAccountMapping = await this.chartOfAccountMappingsEntityService.create({
        chartOfAccount: { id: chartOfAccount.id },
        type: params.type,
        organization: { id: params.organizationId },
        recipient: { id: recipient.id }
      })

      return ChartOfAccountMappingDto.map(chartOfAccountMapping)
    } catch (error) {
      const message = 'There is an issue in saving chartOfAccountMapping'
      this.logger.error(message, params.organizationId, error, chartOfAccount, params.type, recipient)
      throw new InternalServerErrorException(message)
    }
  }

  async updateChartOfAccountMapping(params: {
    organizationId: string
    chartOfAccountMappingPublicId: string
    newChartOfAccountPublicId: string
    toOverwriteManualData: boolean
  }): Promise<ChartOfAccountMappingDto> {
    const currentMapping = await this.chartOfAccountMappingsEntityService.getByPublicIdAndOrganizationId(
      params.chartOfAccountMappingPublicId,
      params.organizationId,
      { ...this.COA_MAPPING_DEFAULT_RELATIONS, recipient: { recipientAddresses: true } }
    )

    if (!currentMapping) {
      throw new NotFoundException('Chart Of Account Mapping does not exist in the organization')
    }

    const updateData: QueryDeepPartialEntity<ChartOfAccountMapping> = {}

    const existingMappings = await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
      organizationId: params.organizationId,
      relations: this.COA_MAPPING_DEFAULT_RELATIONS
    })

    if (params.newChartOfAccountPublicId === NULL_API_STRING) {
      updateData.chartOfAccount = null
      currentMapping.chartOfAccount = null

      if (currentMapping.type === ChartOfAccountMappingType.WALLET && currentMapping.cryptocurrency === null) {
        const cryptocurrencySetMapping = existingMappings.find(
          (existingMapping) =>
            existingMapping.wallet?.id === currentMapping.wallet.id && !!existingMapping.cryptocurrency
        )

        if (!!cryptocurrencySetMapping) {
          throw new BadRequestException('Unable to remove when custom mapping(s) for the wallet is set')
        }
      }
    } else {
      const newChartOfAccount = await this.chartOfAccountsService.getByOrganizationIdAndPublicId(
        params.organizationId,
        params.newChartOfAccountPublicId
      )

      if (!newChartOfAccount) {
        throw new BadRequestException('Chart Of Account does not exist in the organization')
      }

      for (const existingMapping of existingMappings) {
        if (existingMapping.id === currentMapping.id) {
          continue
        }

        if (existingMapping.chartOfAccount?.id === newChartOfAccount.id) {
          if (
            (currentMapping.type === ChartOfAccountMappingType.GAIN &&
              existingMapping.type === ChartOfAccountMappingType.LOSS) ||
            (currentMapping.type === ChartOfAccountMappingType.LOSS &&
              existingMapping.type === ChartOfAccountMappingType.GAIN)
          ) {
            break
          }

          if (
            currentMapping.type === ChartOfAccountMappingType.WALLET &&
            existingMapping.type === ChartOfAccountMappingType.WALLET &&
            existingMapping.wallet.id === currentMapping.wallet.id
          ) {
            break
          }

          if (
            currentMapping.type === ChartOfAccountMappingType.RECIPIENT &&
            existingMapping.type === ChartOfAccountMappingType.RECIPIENT
          ) {
            break
          }

          throw new BadRequestException('Chart of Account is used for other default mapping')
        }
      }

      updateData.chartOfAccount = { id: newChartOfAccount.id }
      currentMapping.chartOfAccount = newChartOfAccount
    }

    await this.chartOfAccountMappingsEntityService.updateById(currentMapping.id, updateData)

    const updatedMapping = await this.chartOfAccountMappingsEntityService.getByPublicIdAndOrganizationId(
      params.chartOfAccountMappingPublicId,
      params.organizationId,
      { ...this.COA_MAPPING_DEFAULT_RELATIONS, recipient: { recipientAddresses: true } }
    )

    // Once the mapping is updated, update the financial transactions impacted
    // Only the mappings which will change the corresponding flow should be included
    await this.chartOfAccountRulesDomainService.reapplyChartOfAccountMapping(
      updatedMapping,
      params.toOverwriteManualData
    )

    return ChartOfAccountMappingDto.map(updatedMapping)
  }

  async deleteChartOfAccountMapping(params: { organizationId: string; chartOfAccountMappingPublicId: string }) {
    const currentMapping = await this.chartOfAccountMappingsEntityService.getByPublicIdAndOrganizationId(
      params.chartOfAccountMappingPublicId,
      params.organizationId
    )

    if (!currentMapping) {
      throw new NotFoundException('Chart Of Account Mapping does not exist in the organization.')
    }

    if (currentMapping.type !== ChartOfAccountMappingType.WALLET || currentMapping.cryptocurrency === null) {
      throw new BadRequestException('Only able to delete wallet and cryptocurrency mapping combination for now.')
    }

    await this.chartOfAccountRulesDomainService.deleteChartOfAccountMappingById(currentMapping.id)
  }

  async getDefaultCOAMappingForChild(
    organizationId: string,
    child: FinancialTransactionChild
  ): Promise<ChartOfAccountMappingDto> {
    const chartOfAccountMappings =
      await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
        organizationId: organizationId,
        relations: { chartOfAccount: true, wallet: true, cryptocurrency: true, recipient: true }
      })

    const recipientMap: { [address: string]: Recipient } =
      await this.recipientsEntityService.getRecipientsGroupedByAddressesByOrganization(organizationId)

    const chartOfAccountMapping = this.chartOfAccountRulesDomainService.getCOAMappingFromListAndChild({
      chartOfAccountMappings,
      recipientMap,
      child
    })

    return chartOfAccountMapping ? ChartOfAccountMappingDto.map(chartOfAccountMapping) : null
  }

  async getCOAMappingCountThatWasOverriddenByUserOnFinancialTransaction(params: {
    organizationId: string
    chartOfAccountMappingPublicId: string
  }): Promise<number> {
    const chartOfAccountMapping = await this.chartOfAccountMappingsEntityService.getByPublicIdAndOrganizationId(
      params.chartOfAccountMappingPublicId,
      params.organizationId,
      { ...this.COA_MAPPING_DEFAULT_RELATIONS, recipient: { recipientAddresses: true } }
    )

    if (!chartOfAccountMapping) {
      throw new BadRequestException('Chart of Account Mapping does not exist')
    }

    return await this.chartOfAccountRulesDomainService.getCOARulesCountThatWasOverriddenByUserOnFinancialTransaction(
      chartOfAccountMapping
    )
  }
}
