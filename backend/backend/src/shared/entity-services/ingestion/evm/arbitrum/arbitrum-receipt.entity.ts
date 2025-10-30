import { Column, DeepPartial, Entity, Unique } from 'typeorm'
import { hexToNumber } from 'web3-utils'
import { EvmReceipt } from '../evm-receipt.entity'
import { EvmReceiptCreateParams, EvmReceiptStatusEnum } from '../interfaces'

@Entity()
@Unique(`UQ_arbitrum_receipt_transaction_hash_blockchain`, [`transactionHash`, `blockchainId`])
export class ArbitrumReceipt extends EvmReceipt {
  @Column({ name: 'fee_stats', type: 'jsonb', nullable: true })
  feeStats: FeeStats

  static create(params: EvmReceiptCreateParams): DeepPartial<ArbitrumReceipt> {
    return {
      blockHash: params.blockHash.toLowerCase(),
      blockNumber: hexToNumber(params.blockNumber),
      blockTimestamp: params.blockTimestamp,
      blockchainId: params.blockchainId,
      transactionHash: params.transactionHash.toLowerCase(),
      fromAddress: params.fromAddress.toLowerCase(),
      toAddress: params.toAddress?.toLowerCase() || null,
      gasUsed: params.gasUsed,
      gasPrice: params.gasPrice,
      status: params.status as EvmReceiptStatusEnum,
      isError: params.status === '0x0',
      contractAddress: params.contractAddress,
      transactionIndex: params.transactionIndex,
      input: params.input,
      type: params.type,
      value: params.value,
      nonce: params.nonce,
      feeStats: params.feeStats ?? null
    } as DeepPartial<ArbitrumReceipt>
  }
}

export interface FeeStats {
  paid: {
    l1Calldata: string
    l1Transaction: string
    l2Computation: string
    l2Storage: string
  }
  prices: {
    l1Calldata: string
    l1Transaction: string
    l2Computation: string
    l2Storage: string
  }
  unitsUsed: {
    l1Calldata: string
    l1Transaction: string
    l2Computation: string
    l2Storage: string
  }
}
