import { Injectable } from '@nestjs/common'
import { FinancialTransactionPreprocess } from '../../../../shared/entity-services/financial-transactions/financial-transaction-preprocess.entity'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { LoggerService } from '../../../../shared/logger/logger.service'

@Injectable()
export class CreateOrMigratePreprocessCommand {
  constructor(
    private readonly financialTransactionsService: FinancialTransactionsEntityService,
    private readonly logger: LoggerService
  ) {}

  async execute(hash: string, preprocessDtos: CreateFinancialTransactionPreprocessDto[]): Promise<void> {
    if (preprocessDtos.length) {
      const existingPreprocessTransactions = await this.financialTransactionsService.getPreprocessTransactionsByHash(
        hash,
        FinancialTransactionPreprocessStatus.COMPLETED
      )

      const preprocessTransactionsGroupedByCryptocurrency: {
        [cryptocurrencyId: string]: FinancialTransactionPreprocess[]
      } = {}
      for (const txn of existingPreprocessTransactions) {
        if (!preprocessTransactionsGroupedByCryptocurrency[txn.cryptocurrency.id]) {
          preprocessTransactionsGroupedByCryptocurrency[txn.cryptocurrency.id] = []
        }
        preprocessTransactionsGroupedByCryptocurrency[txn.cryptocurrency.id].push(txn)
      }

      const preprocessDtosGroupedByCryptocurrency: {
        [cryptocurrencyId: string]: CreateFinancialTransactionPreprocessDto[]
      } = {}
      for (const dto of preprocessDtos) {
        if (!preprocessDtosGroupedByCryptocurrency[dto.cryptocurrency.id]) {
          preprocessDtosGroupedByCryptocurrency[dto.cryptocurrency.id] = []
        }
        preprocessDtosGroupedByCryptocurrency[dto.cryptocurrency.id].push(dto)
      }

      // If dtos has all the previous existing transactions and only result in increase of entries, do not need to delete the previous entries.
      // The increase of entries should maintain the initial ordering as well. If the ordering is off then recreate because downstream require fixed ordering.
      for (const [cryptocurrencyId, preprocessTransactionsPerCryptocurrency] of Object.entries(
        preprocessTransactionsGroupedByCryptocurrency
      )) {
        // Check if the result of preprocess is exactly the same as before or not.
        // If not then delete all the previous entries and create new ones.
        let isDifferentFromBefore = false
        const preprocessDtosPerCryptocurrency = preprocessDtosGroupedByCryptocurrency[cryptocurrencyId]

        for (const [index, preprocessTransaction] of preprocessTransactionsPerCryptocurrency.entries()) {
          if (!preprocessDtosPerCryptocurrency?.at(index)) {
            isDifferentFromBefore = true
            break
          }

          const dto = preprocessDtosPerCryptocurrency.at(index)

          const hasExistingWithCorrectOrder =
            preprocessTransaction.cryptocurrency.id === dto.cryptocurrency.id &&
            preprocessTransaction.cryptocurrencyAmount === dto.cryptocurrencyAmount &&
            preprocessTransaction.uniqueId ===
              FinancialTransactionPreprocess.generateUniqueId(dto.forPublicIdGeneration, dto.valueTimestamp) &&
            preprocessTransaction.fromAddress === dto.fromAddress &&
            preprocessTransaction.toAddress === dto.toAddress

          if (!hasExistingWithCorrectOrder) {
            isDifferentFromBefore = true
            break
          }
        }

        if (isDifferentFromBefore) {
          await this.financialTransactionsService.softDeleteFinancialTransactionPreprocesses(
            preprocessTransactionsPerCryptocurrency
          )
        }
      }

      for (const dto of preprocessDtos) {
        await this.financialTransactionsService.upsertPreprocess(dto)
      }
    }
  }
}
