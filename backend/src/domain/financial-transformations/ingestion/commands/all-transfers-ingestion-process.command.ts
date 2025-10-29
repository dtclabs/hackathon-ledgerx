import { Injectable } from '@nestjs/common'
import { IngestionProcess } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity'
import { AlchemyIngestionTaskMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { BlockExplorersProviderEnum } from '../../../block-explorers/block-explorers-provider.enum'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { RawTransactionEntityService } from '../../../../shared/entity-services/raw-transactions/raw-transaction.entity-service'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionProcessCommand } from './ingestion-process.command'
import { TransactionResponse, TransactionResponseExtended } from '../../../block-explorers/interfaces'
import { TransactionStatus } from '../../../../shared/entity-services/raw-transactions/interfaces'

@Injectable()
export class AllTransfersIngestionProcessCommand extends IngestionProcessCommand<AlchemyIngestionTaskMetadata> {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    protected readonly rawTransactionService: RawTransactionEntityService,
    protected readonly ingestionProcessEntityService: IngestionProcessEntityService,
    protected readonly logger: LoggerService
  ) {
    super(eventEmitter, ingestionProcessEntityService, logger)
  }

  async pullAndSaveData(params: {
    ingestionProcess: IngestionProcess
    blockchainId: string
    address: string
    metadata: AlchemyIngestionTaskMetadata
  }): Promise<void> {
    const { ingestionProcess, blockchainId, address, metadata } = params
    const ingestionWorkflow = ingestionProcess.ingestionWorkflow

    const adapter = this.blockExplorerAdapterFactory.getBlockExplorerAdapter(
      BlockExplorersProviderEnum.ALCHEMY,
      blockchainId
    )

    const validatorFn = async (hash: string) => {
      const transaction = await this.rawTransactionService.getByAddressAndHash({
        address: address,
        hash: hash,
        blockchainId: address
      })
      return {
        loadInternal: !transaction?.internal,
        loadReceipt: !transaction?.receipt
      }
    }

    const adapterTransactionsPaginated = await adapter.getTransactionsByAddress(
      address,
      {
        nextPageId: metadata.nextPageId,
        direction: metadata.direction,
        fromBlock: metadata.fromBlock
      },
      validatorFn
    )

    const adapterTransactionsWrapped = await this.getExtendedTransactions(
      adapterTransactionsPaginated.response,
      blockchainId
    )

    this.logger.debug(`Got ${adapterTransactionsPaginated.response.length} transactions for address ${address}`, {
      ingestionProcessId: ingestionProcess.id,
      metadata: metadata,
      rawTransactions: {
        nextPageId: adapterTransactionsPaginated.nextPageId,
        order: adapterTransactionsPaginated.order,
        direction: adapterTransactionsPaginated.direction,
        lastBlock: adapterTransactionsPaginated.lastBlock,
        firstBlock: adapterTransactionsPaginated.firstBlock
      }
    })

    await this.rawTransactionService.saveOrUpdate(adapterTransactionsWrapped, {
      ingestionProcessId: ingestionProcess.id,
      ingestionTaskId: ingestionWorkflow.id,
      address: address,
      blockchainId: blockchainId,
      direction: metadata.direction
    })

    this.logger.debug(`Saved ${adapterTransactionsPaginated.response.length} transactions for address ${address}`, {
      ingestionProcessId: ingestionProcess.id,
      metadata: metadata,
      nextPageId: adapterTransactionsPaginated.nextPageId
    })

    if (adapterTransactionsPaginated.nextPageId) {
      await this.next(ingestionProcess, {
        ...metadata,
        nextPageId: adapterTransactionsPaginated.nextPageId
      })

      //Updating all raw transactions earlier than before last block (to make sure that we will not miss any events from next page)
      //direction 'from' is important here, because direction 'to' goes first, and we have all entries from that.
      //So we need to update status for all entries only based on block number
      if (metadata.direction === 'from') {
        this.logger.info(
          `Marking as completed all transactions earlier than ${adapterTransactionsPaginated.firstBlock} for address ${address}`,
          {
            address: address,
            blockchainId: blockchainId,
            blockNumber: adapterTransactionsPaginated.firstBlock,
            blockNumberInt: adapterTransactionsPaginated.firstBlock
          }
        )
        await this.rawTransactionService.markAsCompletedForNewerThanBlockNumber(
          {
            address: address,
            blockchainId: blockchainId,
            blockNumber: adapterTransactionsPaginated.firstBlock
          },
          { includes: false }
        )
      }
    } else if (metadata.direction === 'to') {
      //TODO: that is temporal solution, need to be refactored. 'to' direction is default direction and here
      // we are switching to 'from' direction
      this.logger.debug(`Switching direction to 'from' for address ${address}`, {
        ingestionProcessId: ingestionProcess.id,
        metadata: metadata
      })
      await this.next(ingestionProcess, {
        ...metadata,
        nextPageId: null,
        direction: 'from'
      })
    } else {
      await this.rawTransactionService.markAsCompletedForNewerThanBlockNumber(
        {
          address: address,
          blockchainId: blockchainId,
          blockNumber: metadata.fromBlock
        },
        { includes: true }
      )
      await this.complete(ingestionProcess)
    }
  }

  private async getExtendedTransactions(adapterTransactions: TransactionResponse[], blockchainId: string) {
    const adapterTransactionsWrapped: TransactionResponseExtended[] = []
    for (const adapterTransaction of adapterTransactions) {
      let transactionStatus = null
      let transactionStatusReason = null
      if (adapterTransaction.receipt) {
        if (adapterTransaction.receipt?.status) {
          transactionStatus =
            adapterTransaction.receipt.status === 1 ? TransactionStatus.SUCCESS : TransactionStatus.FAILED
        } else {
          const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)
          const txStatus = await etherscanAdapter.getTransactionStatus(adapterTransaction.hash)
          transactionStatus = txStatus.isError === '0' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED
          transactionStatusReason = txStatus.errDescription === '' ? null : txStatus.errDescription
        }
      }
      adapterTransactionsWrapped.push({ ...adapterTransaction, transactionStatus, transactionStatusReason })
    }
    return adapterTransactionsWrapped
  }

  protected getNewMetadataForNewProcess(terminatedProcess: IngestionProcess): AlchemyIngestionTaskMetadata {
    const metadata = terminatedProcess.metadata as AlchemyIngestionTaskMetadata
    return {
      nextPageId: null,
      direction: metadata.direction,
      fromBlock: metadata.fromBlock
    }
  }
}
