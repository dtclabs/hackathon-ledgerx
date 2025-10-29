import { Injectable } from '@nestjs/common'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { ChartOfAccountMapping } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mapping.entity'
import { ChartOfAccountMappingsEntityService } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import {
  ChartOfAccountMappingType,
  ChartOfAccountMappingTypeGroups
} from '../../shared/entity-services/chart-of-account-mapping/interfaces'
import { Recipient } from '../../shared/entity-services/contacts/recipient.entity'
import { RecipientsEntityService } from '../../shared/entity-services/contacts/recipients.entity-service'
import { FinancialTransactionChildMetadata } from '../../shared/entity-services/financial-transactions/financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataType,
  FinancialTransactionParentActivity,
  GainLossInclusionStatus
} from '../../shared/entity-services/financial-transactions/interfaces'
import { LoggerService } from '../../shared/logger/logger.service'
import { SwapActivitiesGroup } from '../financial-transformations/interface'

@Injectable()
export class ChartOfAccountRulesDomainService {
  constructor(
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private recipientsEntityService: RecipientsEntityService,
    private logger: LoggerService
  ) {}

  generateUpdatedBy(chartOfAccountMappingId: string) {
    return `service_chart_of_account_mapping_${chartOfAccountMappingId}`
  }

  async syncUnmappedFinancialTransactionsByOrganization(organizationId: string): Promise<void> {
    const chartOfAccountMappings =
      await this.chartOfAccountMappingsEntityService.getChartOfAccountMappingsByOrganization({
        organizationId: organizationId,
        relations: { chartOfAccount: true, wallet: true, cryptocurrency: true, recipient: true }
      })

    const unmappedFinancialTransactions = await this.financialTransactionsEntityService.getChildrenByNullChartOfAccount(
      organizationId
    )

    if (unmappedFinancialTransactions?.length) {
      const recipientMap: { [address: string]: Recipient } =
        await this.recipientsEntityService.getRecipientsGroupedByAddressesByOrganization(organizationId)

      for (const child of unmappedFinancialTransactions) {
        const metadata = child.financialTransactionChildMetadata

        const coaMapping = this.getCOAMappingFromListAndChild({ chartOfAccountMappings, recipientMap, child })

        if (coaMapping?.chartOfAccount) {
          await this.financialTransactionsEntityService.updateChildMetadata(metadata.id, {
            correspondingChartOfAccount: coaMapping.chartOfAccount,
            correspondingChartOfAccountUpdatedBy: this.generateUpdatedBy(coaMapping.id)
          })
        }
      }
    }
  }

  getCOAMappingFromListAndChild(params: {
    chartOfAccountMappings: ChartOfAccountMapping[]
    recipientMap: { [address: string]: Recipient }
    child: FinancialTransactionChild
  }): ChartOfAccountMapping {
    try {
      const metadata = params.child.financialTransactionChildMetadata

      if (metadata.type === FinancialTransactionChildMetadataType.FEE) {
        return params.chartOfAccountMappings.find((mapping) => mapping.type === ChartOfAccountMappingType.FEE)
      } else if (
        metadata.gainLossInclusionStatus !== GainLossInclusionStatus.INTERNAL &&
        !SwapActivitiesGroup.includes(params.child.financialTransactionParent.activity)
      ) {
        const correspondingAddress =
          metadata.direction === FinancialTransactionChildMetadataDirection.OUTGOING
            ? params.child.toAddress
            : params.child.fromAddress

        if (params.recipientMap[correspondingAddress]) {
          return params.chartOfAccountMappings.find(
            (mapping) =>
              mapping.type === ChartOfAccountMappingType.RECIPIENT &&
              mapping.direction === metadata.direction &&
              mapping.recipient?.id === params.recipientMap[correspondingAddress].id
          )
        }
      }

      return null
    } catch (e) {
      this.logger.error(`Can not get COA Mapping for child`, e, {
        childId: params?.child?.id || null,
        params
      })
      throw e
    }
  }

  async reapplyChartOfAccountMapping(currentMapping: ChartOfAccountMapping, toOverwriteManualData: boolean) {
    if (ChartOfAccountMappingTypeGroups.CHANGE_CORRESPONDING_COA.includes(currentMapping.type)) {
      const partialData: QueryDeepPartialEntity<FinancialTransactionChildMetadata> = {
        correspondingChartOfAccount: currentMapping.chartOfAccount,
        correspondingChartOfAccountUpdatedBy: this.generateUpdatedBy(currentMapping.id)
      }
      if (!currentMapping.chartOfAccount) {
        partialData.correspondingChartOfAccountUpdatedBy = null
      }
      await this.financialTransactionsEntityService.updateChildMetadataByCorrespondingCOAUpdatedById(
        this.generateUpdatedBy(currentMapping.id),
        partialData
      )

      if (toOverwriteManualData) {
        switch (currentMapping.type) {
          case ChartOfAccountMappingType.FEE:
            await this.financialTransactionsEntityService.updateChildMetadataByOrganizationAndType(
              currentMapping.organization.id,
              FinancialTransactionChildMetadataType.FEE,
              partialData
            )

            break
          case ChartOfAccountMappingType.RECIPIENT:
            const addresses = currentMapping.recipient.recipientAddresses.map(
              (recipientAddress) => recipientAddress.address
            )
            await this.financialTransactionsEntityService.updateChildMetadataByCounterpartyFromOrToAddresses({
              organizationId: currentMapping.organization.id,
              addresses,
              updateData: partialData
            })
            break
          default:
            this.logger.error(
              `updateChartOfAccountMapping overwrite automation doesnt recognise the type ${currentMapping.type}`
            )
            break
        }
      }
    }

    // This is for when mapping was null previously and it get filled in now.
    // If scaling becomes an issue, need to just sync the mapping instead of the whole org.
    await this.syncUnmappedFinancialTransactionsByOrganization(currentMapping.organization.id)
  }

  doesFinancialTransactionChildNeedCorrespondingCOA(params: {
    activity: FinancialTransactionParentActivity
    type: FinancialTransactionChildMetadataType
    gainLossInclusionStatus: GainLossInclusionStatus
  }) {
    if (params.gainLossInclusionStatus === GainLossInclusionStatus.INTERNAL) {
      return false
    }

    if (SwapActivitiesGroup.includes(params.activity) && params.type !== FinancialTransactionChildMetadataType.FEE) {
      return false
    }

    return true
  }

  async getCOARulesCountThatWasOverriddenByUserOnFinancialTransaction(chartOfAccountMapping: ChartOfAccountMapping) {
    if (ChartOfAccountMappingTypeGroups.CHANGE_CORRESPONDING_COA.includes(chartOfAccountMapping.type)) {
      switch (chartOfAccountMapping.type) {
        case ChartOfAccountMappingType.FEE:
          return await this.financialTransactionsEntityService.getChildMetadataCountByTypeUpdatedByUser(
            chartOfAccountMapping.organization.id,
            FinancialTransactionChildMetadataType.FEE
          )

        case ChartOfAccountMappingType.RECIPIENT:
          const addresses = chartOfAccountMapping.recipient.recipientAddresses.map(
            (recipientAddress) => recipientAddress.address
          )
          return await this.financialTransactionsEntityService.getChildMetadataCountByCounterpartyFromOrToAddressesUpdatedByUser(
            {
              organizationId: chartOfAccountMapping.organization.id,
              addresses,
              direction: chartOfAccountMapping.direction
            }
          )
        default:
          this.logger.error(
            `getCOAMappingCountThatWasOverriddenByUserOnFinancialTransaction doesnt recognise the type ${chartOfAccountMapping.type}`
          )
          break
      }
    }
    return 0
  }

  async deleteChartOfAccountMappingById(chartOfAccountMappingId: string) {
    const partialData: QueryDeepPartialEntity<FinancialTransactionChildMetadata> = {
      correspondingChartOfAccount: null,
      correspondingChartOfAccountUpdatedBy: null
    }

    await this.financialTransactionsEntityService.updateChildMetadataByCorrespondingCOAUpdatedById(
      this.generateUpdatedBy(chartOfAccountMappingId),
      partialData
    )

    await this.chartOfAccountMappingsEntityService.deleteChartOfAccountMappingById(chartOfAccountMappingId)
  }
}
