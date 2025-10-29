import { BadRequestException, Injectable } from '@nestjs/common'
import { PayoutsEntityService } from '../shared/entity-services/payouts/payouts.entity-service'
import { CreatePayoutDto, PayoutDto } from './interfaces'
import { Payout } from '../shared/entity-services/payouts/payout.entity'
import { LineItem, PayoutStatus, PayoutType } from '../shared/entity-services/payouts/interfaces'
import { dateHelper } from '../shared/helpers/date.helper'
import { GnosisProviderService } from '../domain/block-explorers/gnosis/gnosis-provider.service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { FilesService } from '../files/files.service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { FinancialTransactionFile } from '../shared/entity-services/financial-transactions/financial-transaction-files.entity'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { Organization } from '../shared/entity-services/organizations/organization.entity'
import { LoggerService } from '../shared/logger/logger.service'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { ChartOfAccount } from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { Readable } from 'stream'
import { FinancialTransactionChildMetadataDirection } from '../shared/entity-services/financial-transactions/interfaces'

@Injectable()
export class PayoutsDomainService {
  constructor(
    private readonly payoutsEntityService: PayoutsEntityService,
    private readonly walletsEntityService: WalletsEntityService,
    private readonly gnosisProviderService: GnosisProviderService,
    private readonly financialTransactionsEntityService: FinancialTransactionsEntityService,
    private readonly chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private readonly filesService: FilesService,
    private readonly loggerService: LoggerService
  ) {}

  async getFile(
    publicOrganizationId: string,
    publicPayoutId: string,
    filename: string
  ): Promise<{ filename: string; mimeType: string; fileStream: Readable }> {
    return await this.filesService.getPayoutObject({
      publicOrganizationId: publicOrganizationId,
      publicPayoutId: publicPayoutId,
      filename: filename
    })
  }

  async syncPayouts(sourceWalletId: string, blockchainId: string) {
    const sourceWallet = await this.walletsEntityService.getByWalletId(sourceWalletId, { organization: true })
    const organization = sourceWallet.organization
    const payouts = await this.getSynchronizablePayouts(sourceWallet, blockchainId)

    for (const payout of payouts) {
      const financialTransactionParent = await this.financialTransactionsEntityService.getParentByHashAndOrganization(
        payout.hash,
        organization.id
      )

      if (!financialTransactionParent) {
        continue
      }

      if (payout.notes && !financialTransactionParent.remark) {
        financialTransactionParent.remark = payout.notes
        await this.financialTransactionsEntityService.update(financialTransactionParent)
      }

      const lineItems: { [key: string]: LineItem[] } = {}
      for (const key of Object.values(FinancialTransactionChildMetadataDirection)) {
        // Create copies to avoid modifying entity
        lineItems[key] = payout.lineItems.map((lineItem) => lineItem)
      }

      for (const financialTransactionChild of financialTransactionParent.financialTransactionChild) {
        const direction = financialTransactionChild.financialTransactionChildMetadata.direction
        const index = lineItems[direction].findIndex(
          (lineItem) =>
            lineItem.address === financialTransactionChild.toAddress &&
            lineItem.cryptocurrencyId === financialTransactionChild.cryptocurrency.publicId &&
            lineItem.amount === financialTransactionChild.cryptocurrencyAmount
        )

        if (index < 0) {
          continue
        }

        const lineItem = lineItems[direction].splice(index, 1)[0]

        // Migrate files
        if (lineItem.files && lineItem.files.length > 0) {
          await this.syncFiles(organization, payout, lineItem, financialTransactionChild)
        }

        // Migrate COA and notes
        if (lineItem.notes || lineItem.chartOfAccountId) {
          await this.syncMetadata(organization, financialTransactionChild, lineItem)
        }
      }

      payout.status = PayoutStatus.SYNCED
      payout.syncedAt = dateHelper.getUTCTimestamp()

      await this.payoutsEntityService.update(payout)
    }
  }

  private async syncFiles(
    organization: Organization,
    payout: Payout,
    lineItem: LineItem,
    financialTransactionChild: FinancialTransactionChild
  ): Promise<void> {
    const financialTransactionFiles =
      await this.financialTransactionsEntityService.getFilesByOrganizationIdAndChildPublicId({
        organizationId: financialTransactionChild.organizationId,
        childPublicId: financialTransactionChild.publicId
      })
    const financialTransactionFileNames = financialTransactionFiles.map(
      (financialTransactionFile) => financialTransactionFile.name
    )
    const filenames = lineItem.files.filter((filename) => !financialTransactionFileNames.includes(filename))

    for (const filename of filenames) {
      try {
        const { filePath, key, bucket, contentLength, contentType } =
          await this.filesService.copyFromPayoutToTransactionAttachment(
            payout,
            organization,
            financialTransactionChild,
            filename
          )

        await this.financialTransactionsEntityService.saveFile(
          FinancialTransactionFile.create({
            filePath: filePath,
            file: {
              originalname: filename,
              mimetype: contentType,
              size: contentLength
            },
            key: key,
            bucket: bucket,
            financialTransactionChildId: financialTransactionChild.id,
            organizationId: financialTransactionChild.organizationId
          })
        )
      } catch (e) {
        this.loggerService.error(
          `Failed to sync file (${filename}) for financial transaction child ${financialTransactionChild.id} ${e.message}`,
          {
            organizationId: organization.id,
            e
          }
        )
      }
    }
  }

  private async syncMetadata(
    organization: Organization,
    financialTransactionChild: FinancialTransactionChild,
    lineItem: LineItem
  ): Promise<void> {
    try {
      const metadata: { correspondingChartOfAccount?: ChartOfAccount; note?: string } = {}
      if (!financialTransactionChild.financialTransactionChildMetadata.correspondingChartOfAccount) {
        metadata.correspondingChartOfAccount = await this.chartOfAccountsEntityService.getByOrganizationIdAndPublicId(
          organization.id,
          lineItem.chartOfAccountId
        )
      }
      if (!financialTransactionChild.financialTransactionChildMetadata.note) {
        metadata.note = lineItem.notes
      }
      await this.financialTransactionsEntityService.updateChildMetadata(
        financialTransactionChild.financialTransactionChildMetadata.id,
        metadata
      )
    } catch (e) {
      this.loggerService.error(
        `Failed to sync metadata for financial transaction child ${financialTransactionChild.id} ${e.message}`,
        {
          organizationId: organization.id,
          e
        }
      )
    }
  }

  private async getSynchronizablePayouts(sourceWallet: Wallet, blockchainId: string): Promise<Payout[]> {
    const payouts = await this.payoutsEntityService.findBySourceWallet(sourceWallet, {
      blockchainId: blockchainId,
      statuses: [PayoutStatus.EXECUTED]
    })

    // Get hash for Safe transactions
    for (const payout of payouts) {
      if (payout.hash) continue
      if (payout.type !== PayoutType.SAFE) continue
      if (!payout.safeHash) continue

      try {
        const multisigTransaction = await this.gnosisProviderService.getMultisigTransaction({
          safeHash: payout.safeHash,
          blockchainId: payout.blockchainId
        })

        if (multisigTransaction?.transactionHash) {
          payout.hash = multisigTransaction.transactionHash
          payout.metadata = payout.metadata ?? {}
          payout.metadata.safeTransaction = multisigTransaction
          await this.payoutsEntityService.update(payout)
        }
      } catch (e) {
        this.loggerService.error(
          `Failed to fetch safe transaction with hash ${payout.safeHash} for wallet (${sourceWallet.id}) on ${blockchainId}`,
          {
            walletId: sourceWallet.id,
            e
          }
        )
      }
    }

    // Return only payouts with hash
    return payouts.filter((payout) => !!payout.hash)
  }
}
