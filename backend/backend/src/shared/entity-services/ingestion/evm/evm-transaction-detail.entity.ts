import { Column, DeepPartial } from 'typeorm'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { EvmTransactionDetailCreateParams } from './interfaces'

export abstract class EvmTransactionDetail extends BaseEntity {
  @Column()
  hash: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'method_id', nullable: true })
  methodId: string

  @Column({ name: 'function_name', nullable: true })
  functionName: string

  @Column({ name: 'error_description', nullable: true })
  errorDescription: string

  static create<T extends EvmTransactionDetail>(params: EvmTransactionDetailCreateParams): DeepPartial<T> {
    return {
      hash: params.hash.toLowerCase(),
      blockchainId: params.blockchainId,
      methodId: params.methodId,
      functionName: params.functionName,
      errorDescription: params.errorDescription
    } as DeepPartial<T>
  }
}
