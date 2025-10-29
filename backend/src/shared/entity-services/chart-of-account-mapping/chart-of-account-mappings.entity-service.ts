import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { LoggerService } from '../../logger/logger.service'
import { BaseEntityService } from '../base.entity-service'
import { FinancialTransactionChildMetadataDirection } from '../financial-transactions/interfaces'
import { ChartOfAccountMapping } from './chart-of-account-mapping.entity'
import { ChartOfAccountMappingType } from './interfaces'

@Injectable()
export class ChartOfAccountMappingsEntityService extends BaseEntityService<ChartOfAccountMapping> {
  constructor(
    @InjectRepository(ChartOfAccountMapping)
    private chartOfAccountMappingsRepository: Repository<ChartOfAccountMapping>,
    private logger: LoggerService
  ) {
    super(chartOfAccountMappingsRepository)
  }

  async createDefaultMappingsForOrganization(organizationId: string) {
    const defaultMappings: DeepPartial<ChartOfAccountMapping>[] = [
      {
        type: ChartOfAccountMappingType.FEE
      },
      {
        type: ChartOfAccountMappingType.GAIN
      },
      {
        type: ChartOfAccountMappingType.LOSS
      },
      {
        type: ChartOfAccountMappingType.ROUNDING
      }
    ]

    defaultMappings.forEach((mapping) => {
      mapping.organization = { id: organizationId }
    })

    await this.chartOfAccountMappingsRepository.save(defaultMappings)
  }

  async createByWalletAndOrganization(walletId: string, organizationId: string) {
    const whereConditions: FindOptionsWhere<ChartOfAccountMapping> = {
      type: ChartOfAccountMappingType.WALLET,
      wallet: { id: walletId },
      organization: { id: organizationId }
    }

    const exist = await this.chartOfAccountMappingsRepository.find({ where: whereConditions })

    if (!exist?.length) {
      const defaultMapping: DeepPartial<ChartOfAccountMapping> = {
        type: ChartOfAccountMappingType.WALLET,
        wallet: { id: walletId },
        organization: { id: organizationId }
      }

      await this.chartOfAccountMappingsRepository.save(defaultMapping)
    }
  }

  async createByRecipientAndOrganization(recipientId: string, organizationId: string) {
    const whereConditions: FindOptionsWhere<ChartOfAccountMapping> = {
      type: ChartOfAccountMappingType.RECIPIENT,
      recipient: { id: recipientId },
      organization: { id: organizationId }
    }

    const exist = await this.chartOfAccountMappingsRepository.find({ where: whereConditions })

    if (!exist?.length) {
      const defaultMappings: DeepPartial<ChartOfAccountMapping>[] = [
        {
          type: ChartOfAccountMappingType.RECIPIENT,
          recipient: { id: recipientId },
          organization: { id: organizationId },
          direction: FinancialTransactionChildMetadataDirection.INCOMING
        },
        {
          type: ChartOfAccountMappingType.RECIPIENT,
          recipient: { id: recipientId },
          organization: { id: organizationId },
          direction: FinancialTransactionChildMetadataDirection.OUTGOING
        }
      ]

      await this.chartOfAccountMappingsRepository.save(defaultMappings)
    }
  }

  softDeleteByWalletAndOrganization(walletId: string, organizationId: string) {
    const whereConditions: FindOptionsWhere<ChartOfAccountMapping> = {
      type: ChartOfAccountMappingType.WALLET,
      wallet: { id: walletId },
      organization: { id: organizationId }
    }

    return this.chartOfAccountMappingsRepository.softDelete(whereConditions)
  }

  getByRecipientAndOrganization(recipientId: string, organizationId: string) {
    return this.chartOfAccountMappingsRepository.find({
      where: {
        type: ChartOfAccountMappingType.RECIPIENT,
        recipient: { id: recipientId },
        organization: { id: organizationId }
      }
    })
  }

  async isDefaultMappingFullySetupForOrganization(organizationId: string) {
    const organizationMappings = await this.chartOfAccountMappingsRepository.find({
      where: { organization: { id: organizationId } },
      relations: { chartOfAccount: true, cryptocurrency: true }
    })

    const incompleteCoaMappings = organizationMappings.filter(
      (mapping) =>
        mapping.type !== ChartOfAccountMappingType.RECIPIENT &&
        mapping.cryptocurrency === null &&
        mapping.chartOfAccount === null
    )

    if (incompleteCoaMappings.length) {
      return false
    }
    return true
  }

  getByPublicIdAndOrganizationId(
    publicId: string,
    organizationId: string,
    relations: FindOptionsRelations<ChartOfAccountMapping> = { chartOfAccount: true }
  ) {
    return this.chartOfAccountMappingsRepository.findOne({
      where: { organization: { id: organizationId }, publicId: publicId },
      relations
    })
  }

  async getChartOfAccountMappingsByOrganization(params: {
    organizationId: string
    type?: ChartOfAccountMappingType
    walletIds?: string[]
    chartOfAccountIds?: string[]
    recipientIds?: string[]
    direction?: FinancialTransactionChildMetadataDirection
    isNullChartOfAccount?: boolean
    relations?: FindOptionsRelations<ChartOfAccountMapping>
  }): Promise<ChartOfAccountMapping[]> {
    const whereConditions: FindOptionsWhere<ChartOfAccountMapping> = { organization: { id: params.organizationId } }

    if (params.type) {
      whereConditions.type = params.type
    }

    if (params.walletIds?.length) {
      whereConditions.wallet = { id: In(params.walletIds) }
    }

    if (params.recipientIds?.length) {
      whereConditions.recipient = { id: In(params.recipientIds) }
    }

    if (params.direction) {
      whereConditions.direction = params.direction
    }

    if (params.isNullChartOfAccount) {
      const coaMappings = await this.chartOfAccountMappingsRepository.find({
        where: whereConditions,
        relations: params.relations
      })

      return coaMappings.filter(
        (mapping) => mapping.chartOfAccount === null || params.chartOfAccountIds?.includes(mapping.chartOfAccount.id)
      )
    } else if (params.chartOfAccountIds?.length) {
      whereConditions.chartOfAccount = { id: In(params.chartOfAccountIds) }
    }

    return this.chartOfAccountMappingsRepository.find({ where: whereConditions, relations: params.relations })
  }

  updateById(id: string, chartOfAccountMapping: QueryDeepPartialEntity<ChartOfAccountMapping>) {
    return this.chartOfAccountMappingsRepository.update(id, chartOfAccountMapping)
  }

  deleteChartOfAccountMappingById(id: string) {
    return this.chartOfAccountMappingsRepository.softDelete(id)
  }

  getChartOfAccountFromMappingForWallet(
    coaMappingList: ChartOfAccountMapping[],
    walletId: string,
    cryptocurrencyId?: string
  ): ChartOfAccountMapping {
    let coaMapping = null
    if (cryptocurrencyId) {
      coaMapping = coaMappingList.find(
        (mapping) =>
          mapping.cryptocurrency && mapping.cryptocurrency.id === cryptocurrencyId && mapping.wallet?.id === walletId
      )
    }

    if (!coaMapping) {
      coaMapping = coaMappingList.find((mapping) => mapping.cryptocurrency === null && mapping.wallet?.id === walletId)
    }

    if (!coaMapping) {
      const message = `Wallet ${walletId} does not have Chart of Account Mapping`
      this.logger.error(message, walletId, cryptocurrencyId)
      throw Error(message)
    }

    return coaMapping
  }

  replaceCOAId(prevCOAId: string, newCOAId: string) {
    const newCOAMapping: QueryDeepPartialEntity<ChartOfAccountMapping> = {}
    newCOAMapping.chartOfAccount = newCOAId ? { id: newCOAId } : null

    return this.chartOfAccountMappingsRepository.update({ chartOfAccount: { id: prevCOAId } }, newCOAMapping)
  }
}
