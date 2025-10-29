import { Column, DeepPartial } from 'typeorm'
import { hexToNumber } from 'web3-utils'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { EvmReceiptCreateParams, EvmReceiptStatusEnum } from './interfaces'

export abstract class EvmReceipt extends BaseEntity {
  @Column({ name: 'block_hash' })
  blockHash: string

  @Column({ name: 'block_number' })
  blockNumber: number

  @Column({ name: 'block_timestamp' })
  blockTimestamp: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'transaction_hash' })
  transactionHash: string

  @Column({ name: 'from_address' })
  fromAddress: string

  @Column({ name: 'to_address', nullable: true })
  toAddress: string

  @Column({ name: 'gas_used' })
  gasUsed: string

  @Column({ name: 'gas_price' })
  gasPrice: string

  @Column()
  status: EvmReceiptStatusEnum

  @Column({ name: 'contract_address', nullable: true })
  contractAddress: string

  @Column({ name: 'transaction_index' })
  transactionIndex: string

  @Column()
  input: string

  @Column()
  type: string

  @Column()
  value: string

  @Column()
  nonce: string

  @Column({ name: 'is_error', type: 'boolean' })
  isError: boolean

  static create<T extends EvmReceipt>(params: EvmReceiptCreateParams): DeepPartial<EvmReceipt> {
    return {
      blockHash: params.blockHash.toLowerCase(),
      blockNumber: hexToNumber(params.blockNumber),
      blockTimestamp: params.blockTimestamp,
      blockchainId: params.blockchainId,
      transactionHash: params.transactionHash.toLowerCase(),
      fromAddress: params.fromAddress.toLowerCase(),
      // That is possible that toAddress is null see Polygon eth_getTransactionReceipt for hash 0x1eeb7d3da9ad9c64a1ee7b7f6e3e89f9a8a4fd125fee8b4399e7febef51682d6
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
      nonce: params.nonce
    } as DeepPartial<T>
  }
}
