import { Injectable } from '@nestjs/common'
import { String } from 'aws-sdk/clients/appstream'
import { groupBy } from 'lodash'
import { TaskStatusEnum } from '../../core/events/event-types'
import { PricesService } from '../../prices/prices.service'
import { AdditionalTransformationPerWalletTask } from '../../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-task.entity'
import { AdditionalTransformationPerWalletTasksEntityService } from '../../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-tasks.entity-service'
import {
  FinancialTransactionChildGnosisMetadata,
  FinancialTransactionChildMetadata,
  FinancialTransactionGnosisConfirmation
} from '../../shared/entity-services/financial-transactions/financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataStatus,
  FinancialTransactionChildMetadataSubstatus,
  GainLossInclusionStatus
} from '../../shared/entity-services/financial-transactions/interfaces'
import { OrganizationSettingsEntityService } from '../../shared/entity-services/organization-settings/organization-settings.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { GnosisProviderService } from '../block-explorers/gnosis/gnosis-provider.service'
import { GnosisMultisigTransaction } from '../block-explorers/gnosis/interfaces'
import { TempTransactionsDomainService } from './temp-transactions.domain.service'

@Injectable()
export class AdditionalTransformationsPerWalletDomainService {
  readonly BATCH_SIZE: number = 500

  constructor(
    private additionalTransformationPerWalletTasksService: AdditionalTransformationPerWalletTasksEntityService,
    private financialTransactionsService: FinancialTransactionsEntityService,
    private pricesService: PricesService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private readonly gnosisProviderService: GnosisProviderService,
    private readonly logger: LoggerService,
    private readonly legacyMigrationDomainService: TempTransactionsDomainService
  ) {}

  async executeWorkflow(task: AdditionalTransformationPerWalletTask) {
    await this.additionalTransformationPerWalletTasksService.updateFirstExecutedAt(task)

    if (task.metadata?.fillMissingFiatPriceWorkflowStatus != TaskStatusEnum.COMPLETED) {
      await this.executeFillMissingFiatPriceWorkflow({
        taskId: task.id,
        organizationId: task.organizationId,
        address: task.address,
        blockchainId: task.blockchainId
      })
      task.metadata.fillMissingFiatPriceWorkflowStatus = TaskStatusEnum.COMPLETED
      await this.additionalTransformationPerWalletTasksService.updateMetadata(task.id, task.metadata)
    }

    if (task.metadata?.gnosisWorkflowStatus != TaskStatusEnum.COMPLETED) {
      await this.syncGnosisData(task)
      task.metadata.gnosisWorkflowStatus = TaskStatusEnum.COMPLETED
      await this.additionalTransformationPerWalletTasksService.updateMetadata(task.id, task.metadata)
    }

    await this.syncPendingTransactions(task)
    await this.additionalTransformationPerWalletTasksService.changeStatus(task.id, TaskStatusEnum.COMPLETED)
  }

  async executeFillMissingFiatPriceWorkflow(params: {
    taskId: string
    address: string
    organizationId: string
    blockchainId: String
  }) {
    let skip = 0
    let children: FinancialTransactionChild[] = []

    do {
      children = await this.financialTransactionsService.getAllChildrenFromAddressWithMissingPrice({
        ...params,
        skip,
        take: this.BATCH_SIZE
      })

      const organizationSetting = await this.organizationSettingsService.getByOrganizationId(params.organizationId, {
        fiatCurrency: true
      })
      const updatedBy = 'service_fill_missing_fiat_price_workflow'

      for (const child of children) {
        if (!child.financialTransactionChildMetadata.fiatAmountPerUnit) {
          const price = await this.pricesService.getFiatPriceByCryptocurrency(
            child.cryptocurrency,
            organizationSetting.fiatCurrency.alphabeticCode,
            child.valueTimestamp
          )
          let updatedMetadata: Partial<FinancialTransactionChildMetadata> = {}

          if (price) {
            updatedMetadata = await this.financialTransactionsService.generatePartialChildMetadataForPriceUpdate({
              cryptocurrencyAmount: child.cryptocurrencyAmount,
              pricePerUnit: price,
              fiatCurrency: organizationSetting.fiatCurrency.alphabeticCode,
              updatedBy
            })
            this.financialTransactionsService.removeSubstatusFromChildMetadata(
              FinancialTransactionChildMetadataSubstatus.MISSING_PRICE,
              updatedMetadata
            )
          } else {
            this.financialTransactionsService.addSubstatusToChildMetadata(
              FinancialTransactionChildMetadataSubstatus.MISSING_PRICE,
              updatedMetadata
            )
          }

          // Need to find a better place to update this
          if (child.financialTransactionChildMetadata.gainLossInclusionStatus === GainLossInclusionStatus.NONE) {
            updatedMetadata.status = FinancialTransactionChildMetadataStatus.SYNCED
          }

          await this.financialTransactionsService.updateChildMetadata(
            child.financialTransactionChildMetadata.id,
            updatedMetadata
          )

          await this.additionalTransformationPerWalletTasksService.updateLastExecutedAt(params.taskId)
        }
      }
    } while (children.length === this.BATCH_SIZE)
  }

  private async syncGnosisData(task: AdditionalTransformationPerWalletTask) {
    const isGnosisSafe = await this.gnosisProviderService.isGnosisSafe({
      address: task.address,
      blockchainId: task.blockchainId
    })

    if (!isGnosisSafe) {
      return
    }

    const financialTransactionChildren = await this.financialTransactionsService.getAllUnpopulatedGnosisChild({
      address: task.address,
      organizationId: task.organizationId,
      blockchainId: task.blockchainId
    })
    const groupedByHash = groupBy(financialTransactionChildren, 'hash')
    for (const hash in groupedByHash) {
      try {
        const gnosisTx = await this.gnosisProviderService.getExecutedMultisigTransaction({
          blockchainId: task.blockchainId,
          address: task.address,
          hash
        })
        if (!gnosisTx) {
          continue
        }
        const metadata = this.convertGnosisSafeTxToChildTransactionMetadata(gnosisTx)
        const financialTransactionChildren = groupedByHash[hash]
        for (const financialTransactionChild of financialTransactionChildren) {
          await this.financialTransactionsService.updateGnosisChildMetadata(
            financialTransactionChild.financialTransactionChildMetadata.id,
            metadata
          )
        }
      } catch (e) {
        this.logger.error(`Error while syncing Gnosis data for ${hash}`, e, {
          address: task.address,
          organizationId: task.organizationId,
          blockchainId: task.blockchainId
        })
      }

      await this.additionalTransformationPerWalletTasksService.updateLastExecutedAt(task.id)
    }
  }

  convertGnosisSafeTxToChildTransactionMetadata(
    gnosisTx: GnosisMultisigTransaction
  ): FinancialTransactionChildGnosisMetadata {
    const confirmations: FinancialTransactionGnosisConfirmation[] = gnosisTx.confirmations.map((confirmation) => ({
      owner: confirmation.owner,
      signatureType: confirmation.signatureType,
      transactionHash: confirmation.transactionHash,
      submissionDate: confirmation.submissionDate
    }))
    return {
      safeTxHash: gnosisTx.safeTxHash,
      confirmations: confirmations,
      confirmationsRequired: gnosisTx.confirmationsRequired,
      executionDate: gnosisTx.executionDate,
      modified: gnosisTx.modified,
      submissionDate: gnosisTx.submissionDate
    }
  }

  private async syncPendingTransactions(task: AdditionalTransformationPerWalletTask) {
    try {
      await this.legacyMigrationDomainService.migrateForWalletAddress({
        address: task.address,
        blockchainId: task.blockchainId,
        organizationId: task.organizationId
      })
    } catch (e) {
      this.logger.error(`Error while syncing pending transactions for ${task.address}`, e, {
        taskId: task.id,
        address: task.address,
        organizationId: task.organizationId,
        blockchainId: task.blockchainId
      })
    }
  }
}
