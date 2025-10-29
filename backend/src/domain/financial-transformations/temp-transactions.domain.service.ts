import { Injectable } from '@nestjs/common'
import { Category } from '../../categories/category.entity'
import { FilesService } from '../../files/files.service'
import { ChartOfAccount } from '../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionFile } from '../../shared/entity-services/financial-transactions/financial-transaction-files.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { Organization } from '../../shared/entity-services/organizations/organization.entity'
import { OrganizationsEntityService } from '../../shared/entity-services/organizations/organizations.entity-service'
import { TempTransactionsEntity } from '../../shared/entity-services/temp-transactions/temp-transactions.entity'
import { TempTransactionsEntityService } from '../../shared/entity-services/temp-transactions/temp-transactions.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { GnosisProviderService } from '../block-explorers/gnosis/gnosis-provider.service'

@Injectable()
export class TempTransactionsDomainService {
  constructor(
    private readonly filesService: FilesService,
    private readonly financialTransactionsEntityService: FinancialTransactionsEntityService,
    private readonly tempTransactionsService: TempTransactionsEntityService,
    private readonly organizationsService: OrganizationsEntityService,
    private readonly logger: LoggerService,
    private readonly gnosisProviderService: GnosisProviderService
  ) {}

  async migrateLegacyDataByTransaction(transaction: TempTransactionsEntity, organization: Organization) {
    const hash = await this.getTransactionHash(transaction)

    if (!hash) {
      return false
    }

    const finTxChildren = await this.financialTransactionsEntityService.getChildByHashAndOrganization(
      hash,
      organization.id
    )

    if (!finTxChildren?.length) {
      return false
    }
    await this.migrateFiles({
      txHash: hash,
      organization: organization,
      financialTransactionChildren: finTxChildren,
      files: transaction.files
    })
    // Deprecated
    await this.migrateCategories({
      txHash: hash,
      organization: organization,
      financialTransactionChildren: finTxChildren,
      categories: [transaction.category]
    })
    await this.migrateCorrespondingChartOfAccount({
      txHash: hash,
      organization: organization,
      financialTransactionChildren: finTxChildren,
      correspondingChartOfAccounts: [transaction.correspondingChartOfAccount]
    })
    await this.migrateNotes({
      txHash: hash,
      organization: organization,
      financialTransactionChildren: finTxChildren,
      comment: transaction.comment
    })

    return true
  }

  private async getTransactionHash(transaction: TempTransactionsEntity) {
    const hash = transaction.hash ?? transaction.safeTransaction?.transactionHash
    if (hash) {
      return hash
    }
    const safeHash = transaction.safeHash
    if (!safeHash) {
      return null
    }

    const multisigTransaction = await this.gnosisProviderService.getMultisigTransaction({
      safeHash,
      blockchainId: transaction.blockchainId
    })

    const updatedHash = multisigTransaction?.transactionHash

    if (updatedHash) {
      await this.tempTransactionsService.updateSafeTransactionAndHash(
        transaction.id,
        multisigTransaction,
        multisigTransaction?.transactionHash
      )
    }

    return updatedHash ?? null
  }

  async migrateFiles(params: {
    financialTransactionChildren: FinancialTransactionChild[]
    organization: Organization
    files: string[]
    txHash: string
  }) {
    try {
      if (!params.files?.length) {
        return
      }

      if (params.financialTransactionChildren?.length) {
        for (const fileKey of params.files) {
          try {
            const firstChild = params.financialTransactionChildren[0]

            const existingFilesForFinTx =
              await this.financialTransactionsEntityService.getFilesByOrganizationIdAndChildPublicId({
                organizationId: firstChild.organizationId,
                childPublicId: firstChild.publicId
              })

            if (existingFilesForFinTx.find((f) => f.name === fileKey)) {
              continue
            }

            const { filePath, key, bucket, contentLength, contentType } =
              await this.filesService.copyFromPublicBucketToTransactionAttachment(
                params.organization,
                firstChild,
                fileKey
              )

            for (const child of params.financialTransactionChildren) {
              const attachment = FinancialTransactionFile.create({
                filePath,
                file: {
                  originalname: fileKey,
                  mimetype: contentType,
                  size: contentLength
                },
                key,
                bucket,
                financialTransactionChildId: child.id,
                organizationId: child.organizationId
              })
              await this.financialTransactionsEntityService.saveFile(attachment)
            }
          } catch (e) {
            this.logger.error(`Cannot migrate file ${fileKey}: ${e.message}`, {
              e
            })
          }
        }
      } else {
        this.logger.info(
          `Wallet wasn't synced yet for transaction ${params.txHash} for organization ${params.organization.id}`
        )
      }
    } catch (e) {
      this.logger.error(`Can not migrate files: ${e.message}`, {
        e
      })
    }
  }

  async migrateCategories(params: {
    financialTransactionChildren: FinancialTransactionChild[]
    txHash: string
    organization: Organization
    categories: Category[]
  }) {
    if (!params.categories?.length) {
      return
    }
    try {
      if (!params.txHash) {
        return
      }

      if (params.financialTransactionChildren?.length) {
        // always is one category
        const category = params.categories[0]

        for (const child of params.financialTransactionChildren) {
          if (child.financialTransactionChildMetadata.category) {
            continue
          }
          await this.financialTransactionsEntityService.updateChildMetadata(
            child.financialTransactionChildMetadata.id,
            {
              category: category
            }
          )
        }
      } else {
        this.logger.info(
          `Wallet wasn't synced yet for transaction ${params.txHash} for organization ${params.organization.id}`
        )
      }
    } catch (e) {
      this.logger.error(`Can not migrate Categories: ${e.message}`, {
        e
      })
    }
  }

  async migrateCorrespondingChartOfAccount(params: {
    financialTransactionChildren: FinancialTransactionChild[]
    txHash: string
    organization: Organization
    correspondingChartOfAccounts: ChartOfAccount[]
  }) {
    if (!params.correspondingChartOfAccounts?.length) {
      return
    }
    try {
      if (!params.txHash) {
        return
      }

      if (params.financialTransactionChildren?.length) {
        // always is one category
        const correspondingChartOfAccount = params.correspondingChartOfAccounts[0]

        for (const child of params.financialTransactionChildren) {
          if (child.financialTransactionChildMetadata.correspondingChartOfAccount) {
            continue
          }
          await this.financialTransactionsEntityService.updateChildMetadata(
            child.financialTransactionChildMetadata.id,
            {
              correspondingChartOfAccount: correspondingChartOfAccount
            }
          )
        }
      } else {
        this.logger.info(
          `Wallet wasn't synced yet for transaction ${params.txHash} for organization ${params.organization.id}`
        )
      }
    } catch (e) {
      this.logger.error(`Can not migrate Corresponding Chart of Account: ${e.message}`, {
        e
      })
    }
  }

  async migrateNotes(params: {
    financialTransactionChildren: FinancialTransactionChild[]
    txHash: string
    organization: Organization
    comment: string
  }) {
    if (!params.comment) {
      return
    }
    try {
      if (!params.txHash) {
        return
      }

      if (params.financialTransactionChildren?.length) {
        for (const child of params.financialTransactionChildren) {
          if (child.financialTransactionChildMetadata.note !== null) {
            continue
          }
          await this.financialTransactionsEntityService.updateChildMetadata(
            child.financialTransactionChildMetadata.id,
            {
              note: params.comment
            }
          )
        }
      } else {
        this.logger.info(
          `Wallet wasn't synced yet for transaction ${params.txHash} for organization ${params.organization.id}`
        )
      }
    } catch (e) {
      this.logger.error(`Can not migrate Note for transaction hash ${params.txHash} ${e.message}`, { e })
    }
  }

  async migrateForAllNonMigratedTempTransaction() {
    const tempTransactions = await this.tempTransactionsService.getAllNonMigrated()
    for (const tempTransaction of tempTransactions) {
      await this.migrateTempTransaction(tempTransaction)
    }
  }

  private async migrateTempTransaction(tempTransaction: TempTransactionsEntity) {
    const organization = await this.organizationsService.get(tempTransaction.organizationId)
    const result = await this.migrateLegacyDataByTransaction(tempTransaction, organization)
    if (result) {
      await this.tempTransactionsService.markAsMigrated(tempTransaction.id)
    }
  }

  async migrateForWalletAddress(params: { address: string; blockchainId: string; organizationId: string }) {
    const tempTransactions = await this.tempTransactionsService.getAllNonMigratedByAddress(params)
    for (const tempTransaction of tempTransactions) {
      await this.migrateTempTransaction(tempTransaction)
    }
  }
}
