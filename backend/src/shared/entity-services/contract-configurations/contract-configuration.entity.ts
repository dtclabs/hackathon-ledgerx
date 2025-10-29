import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { ContractConfigurationMetadata, ContractConfigurationPlaceholderEnum } from './interfaces'

@Entity()
export class ContractConfiguration extends BaseEntity {
  @Column()
  name: string

  @Column({ name: 'contract_address', nullable: true })
  contractAddress: string | null

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'topic0' })
  topic0: string

  @Column({ name: 'topic1', nullable: true })
  topic1: string | ContractConfigurationPlaceholderEnum

  @Column({ name: 'topic2', nullable: true })
  topic2: string | ContractConfigurationPlaceholderEnum

  @Column({ name: 'topic3', nullable: true })
  topic3: string | ContractConfigurationPlaceholderEnum

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: ContractConfigurationMetadata | null

  static create(params: {
    name: string
    contractAddress: string | null
    blockchainId: string
    topic0: string
    topic1: string | ContractConfigurationPlaceholderEnum
    topic2: string | ContractConfigurationPlaceholderEnum
    topic3: string | ContractConfigurationPlaceholderEnum
    metadata: ContractConfigurationMetadata | null
  }): ContractConfiguration {
    const contractConfiguration = new ContractConfiguration()
    contractConfiguration.name = params.name
    contractConfiguration.contractAddress = params.contractAddress
    contractConfiguration.blockchainId = params.blockchainId
    contractConfiguration.topic0 = params.topic0
    contractConfiguration.topic1 = params.topic1
    contractConfiguration.topic2 = params.topic2
    contractConfiguration.topic3 = params.topic3
    contractConfiguration.metadata = params.metadata
    return contractConfiguration
  }
}
