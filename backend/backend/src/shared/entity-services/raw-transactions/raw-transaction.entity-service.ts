import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AssetTransfersWithMetadataResult } from 'alchemy-sdk/dist/src/types/types'
import { FindOptionsWhere, MoreThan, MoreThanOrEqual, Repository } from 'typeorm'
import { hexToNumber } from 'web3-utils'
import { LoggerService } from '../../logger/logger.service'
import { BaseEntityService } from '../base.entity-service'
import { RawTransactionTaskStatusEnum } from './interfaces'
import { RawTransaction } from './raw-transaction.entity'
import { TransactionResponseExtended } from '../../../domain/block-explorers/interfaces'
import { AssetTransfersCategory } from 'alchemy-sdk'

@Injectable()
export class RawTransactionEntityService extends BaseEntityService<RawTransaction> {
  constructor(
    @InjectRepository(RawTransaction)
    private rawTransactionRepository: Repository<RawTransaction>,
    private readonly logger: LoggerService
  ) {
    super(rawTransactionRepository)
  }

  async saveOrUpdate(
    transactions: TransactionResponseExtended[],
    params: {
      address: string
      blockchainId: string
      direction: 'to' | 'from'
      ingestionTaskId: string
      ingestionProcessId: string
    }
  ) {
    for (const transaction of transactions) {
      try {
        const rawTransaction = await this.getByAddressAndHash({
          address: params.address,
          hash: transaction.hash,
          blockchainId: params.blockchainId
        })
        if (rawTransaction) {
          if (rawTransaction.status === RawTransactionTaskStatusEnum.COMPLETED) {
            // Skip if already completed. This can happen for every transaction from the last processing block.
            //A new query for the latest fromBlock include all the transactions processed previously for this block
            this.logger.debug(`Transaction ${transaction.hash} already completed. Skipping...`)
            continue
          }

          let to: AssetTransfersWithMetadataResult[] = undefined
          let from: AssetTransfersWithMetadataResult[] = undefined

          if (params.direction === 'to') {
            const missingTo = transaction.transfers.filter(
              (transfer) => !this.isTransferExists(rawTransaction.to, transfer)
            )
            to = [...(rawTransaction.to ?? []), ...missingTo]
          }

          if (params.direction === 'from') {
            const missingFrom = transaction.transfers.filter(
              (transfer) => !this.isTransferExists(rawTransaction.from, transfer)
            )
            from = [...(rawTransaction.from ?? []), ...missingFrom]
          }

          await this.update({
            ...rawTransaction,
            receipt: rawTransaction.receipt ?? transaction.receipt ?? null,
            internal: rawTransaction.internal ?? transaction.internal ?? null,
            to: to as any,
            from: from as any
          })
        } else {
          const additionalFrom = this.getAdditionalFromIfNeeded(transaction)

          const newRawTransaction = RawTransaction.create({
            hash: transaction.hash,
            address: params.address,
            blockchainId: params.blockchainId,
            receipt: transaction.receipt ?? null,
            to: params.direction === 'to' ? transaction.transfers : null,
            from:
              params.direction === 'from'
                ? [...additionalFrom, ...transaction.transfers]
                : additionalFrom.length
                ? additionalFrom
                : null,
            internal: transaction.internal ?? null,
            ingestionTaskId: params.ingestionTaskId,
            ingestionProcessId: params.ingestionProcessId,
            blockNumber: transaction.blockNumber,
            blockTimestamp: transaction.blockTimestamp,
            transactionStatus: transaction.transactionStatus,
            transactionStatusReason: transaction.transactionStatusReason
          })
          await this.create(newRawTransaction)
        }
      } catch (e) {
        this.logger.error(
          `Could not save transaction ${transaction.hash} for address ${params.address} on chain ${params.blockchainId}`,
          e,
          {
            transaction,
            ingestionProcessId: params.ingestionProcessId
          }
        )
        throw e
      }
    }
  }

  // Transaction can be null in case when there is already external transfer for this wallet address
  // That is for optimizing amount of total calls
  // We need this transfer for solving issue with internal wallets
  // see https://app.clickup.com/t/86794rtq3
  private getAdditionalFromIfNeeded(transaction: TransactionResponseExtended) {
    if (!transaction?.external) {
      return []
    }

    const externalTransfer = transaction.transfers.find(
      (transfer) => transfer.category === AssetTransfersCategory.EXTERNAL
    )
    const additionalFrom: AssetTransfersWithMetadataResult[] = []
    if (!externalTransfer && transaction.external.value > 0) {
      additionalFrom.push(transaction.external)
    }
    return additionalFrom
  }

  getByAddressAndHash(params: { address: string; hash: string; blockchainId: string }) {
    return this.rawTransactionRepository.findOne({
      where: {
        address: params.address.toLowerCase(),
        hash: params.hash,
        blockchainId: params.blockchainId
      }
    })
  }

  private isTransferExists(transfers: AssetTransfersWithMetadataResult[], transfer: AssetTransfersWithMetadataResult) {
    return transfers?.find((t) => t.uniqueId === transfer.uniqueId)
  }

  async getLatestBlock(params: { address: string; blockchainId: string }) {
    //find the latest fully synchronized entry for the address and chainId based on blockNumber
    const transaction = await this.rawTransactionRepository.findOne({
      where: {
        address: params.address,
        blockchainId: params.blockchainId,
        status: RawTransactionTaskStatusEnum.COMPLETED
      },
      order: {
        blockNumberInt: 'DESC'
      }
    })

    return transaction?.blockNumber
  }

  async markAsCompletedForNewerThanBlockNumber(
    params: {
      address: string
      blockchainId: string
      blockNumber: string
    },
    options: { includes: boolean }
  ) {
    const blockNumberInt = params.blockNumber ? Number(hexToNumber(params.blockNumber)) : 0

    await this.rawTransactionRepository.update(
      {
        address: params.address.toLowerCase(),
        blockchainId: params.blockchainId,
        blockNumberInt: options.includes ? MoreThanOrEqual(blockNumberInt) : MoreThan(blockNumberInt)
      },
      {
        status: RawTransactionTaskStatusEnum.COMPLETED
      }
    )
  }

  async getTransactionsByAddressAndBlockchainAndStatus(params: {
    address: string
    blockchainId: string
    status: RawTransactionTaskStatusEnum
    startingId: string | null
    skip: number
    take: number
  }): Promise<RawTransaction[]> {
    const findOptionsWhere: FindOptionsWhere<RawTransaction> = {
      address: params.address.toLowerCase(),
      status: params.status,
      blockchainId: params.blockchainId
    }

    if (params.startingId) {
      findOptionsWhere.id = MoreThan(params.startingId)
    }

    return await this.rawTransactionRepository.find({
      where: findOptionsWhere,
      skip: params.skip,
      take: params.take,
      order: {
        id: 'ASC'
      }
    })
  }
}
