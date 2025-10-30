import { Column } from 'typeorm'
import { DeepPartial } from 'typeorm/common/DeepPartial'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { RawTransactionTaskStatusEnum } from '../../raw-transactions/interfaces'
import { EvmAddressTransactionCreateParams } from './interfaces'

export abstract class EvmAddressTransaction extends BaseEntity {
  @Column()
  hash: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'block_number' })
  blockNumber: number

  @Column()
  address: string

  @Column()
  status: RawTransactionTaskStatusEnum

  @Column({ name: 'contract_configuration_id', type: 'bigint', nullable: true })
  contractConfigurationId: string

  static create<T extends EvmAddressTransaction>(params: EvmAddressTransactionCreateParams): DeepPartial<T> {
    return {
      hash: params.transactionHash.toLowerCase(),
      blockchainId: params.blockchainId,
      blockNumber: params.blockNumber,
      address: params.address.toLowerCase(),
      status: RawTransactionTaskStatusEnum.RUNNING,
      contractConfigurationId: params.contractConfigurationId
    } as DeepPartial<T>
  }
}
