import { Column, DeepPartial } from 'typeorm'
import { hexToNumber } from 'web3-utils'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { EvmTraceCreateParams, EvmTraceStatusEnum } from './interfaces'

export abstract class EvmTrace extends BaseEntity {
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

  @Column({ name: 'to_address' })
  toAddress: string

  @Column()
  value: string

  @Column({ name: 'call_type' })
  callType: string

  @Column({ name: 'is_error', type: 'boolean' })
  isError: boolean

  @Column({ name: 'error_code' })
  errorCode: string

  @Column()
  gas: string

  @Column()
  gasUsed: string

  @Column()
  input: string

  @Column()
  status: EvmTraceStatusEnum

  @Column({ name: 'trace_id', nullable: true })
  traceId: string

  @Column({ name: 'trace_index' })
  traceIndex: number

  static create<T extends EvmTrace>(params: EvmTraceCreateParams): DeepPartial<T> {
    return {
      blockNumber: hexToNumber(params.blockNumber),
      blockTimestamp: params.blockTimestamp,
      blockchainId: params.blockchainId,
      transactionHash: params.transactionHash.toLowerCase(),
      fromAddress: params.fromAddress.toLowerCase(),
      toAddress: params.toAddress.toLowerCase(),
      value: params.value,
      callType: params.callType,
      isError: params.status === '1',
      status: params.status as EvmTraceStatusEnum,
      errorCode: params.errorCode,
      gas: params.gas,
      gasUsed: params.gasUsed,
      input: params.input,
      traceId: params.traceId,
      traceIndex: params.traceIndex
    } as DeepPartial<T>
  }
}
