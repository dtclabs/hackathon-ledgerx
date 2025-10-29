import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'
import { BlockExplorersProviderEnum } from '../../../domain/block-explorers/block-explorers-provider.enum'
import { isEthereumBlockchain } from '../../utils/utils'
import { ContractConfiguration } from '../contract-configurations/contract-configuration.entity'
import { IngestionWorkflow } from '../ingestion-workflows/ingestion-workflow.entity'
import {
  AlchemyIngestionTaskMetadata,
  EtherscanIngestionTaskMetadata,
  EvmBlockRewardMetadata,
  EvmLogIngestionTaskMetadata,
  EvmNativeIngestionTaskMetadata,
  IngestionProcessMetadata,
  IngestionProcessTypeEnum
} from './interfaces'

@Entity()
export class IngestionProcess extends BaseEntity {
  @ManyToOne(() => IngestionWorkflow, (ingestionWorkflow) => ingestionWorkflow.ingestionProcesses)
  @JoinColumn({ name: 'ingestion_workflow_id' })
  ingestionWorkflow: IngestionWorkflow

  @ManyToOne(() => ContractConfiguration)
  @JoinColumn({ name: 'contract_configuration_id' })
  contractConfiguration: ContractConfiguration

  @Column()
  type: IngestionProcessTypeEnum

  @Column({
    type: 'enum',
    enum: TaskStatusEnum,
    default: TaskStatusEnum.CREATED
  })
  status: TaskStatusEnum = TaskStatusEnum.CREATED

  @Column({ name: 'last_execution_at', nullable: true })
  lastExecutionAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ type: 'json', nullable: true })
  metadata: IngestionProcessMetadata

  @Column({ type: 'json', nullable: true })
  error: {
    messages: any[]
    retryAt: Date
    retryCount: number
  }

  @Column({ name: 'provider' })
  provider: BlockExplorersProviderEnum

  @Column({ name: 'sync_type', nullable: true })
  syncType: TaskSyncType

  //TODO: What is this horrible method
  static create(params: {
    ingestionWorkflow: IngestionWorkflow
    contractConfiguration: ContractConfiguration
    syncType: TaskSyncType
    type: IngestionProcessTypeEnum
    fromBlock?: string | number
  }): IngestionProcess {
    const ingestionProcess = new IngestionProcess()
    ingestionProcess.ingestionWorkflow = params.ingestionWorkflow
    ingestionProcess.contractConfiguration = params.contractConfiguration
    ingestionProcess.syncType = params.syncType
    ingestionProcess.type = params.type
    if (isEthereumBlockchain(params.ingestionWorkflow.blockchainId)) {
      if (params.type === IngestionProcessTypeEnum.ALL_TRANSFERS) {
        ingestionProcess.provider = BlockExplorersProviderEnum.ALCHEMY
        ingestionProcess.metadata = {
          nextPageId: null,
          direction: 'to',
          fromBlock: params.fromBlock ?? null
        } as AlchemyIngestionTaskMetadata
      } else if (params.type === IngestionProcessTypeEnum.CONTRACT_CONFIGURATION) {
        ingestionProcess.provider = BlockExplorersProviderEnum.ETHERSCAN
        ingestionProcess.metadata = {
          fromBlock: params.fromBlock ?? null,
          page: 1,
          pageSize: 1000
        } as EtherscanIngestionTaskMetadata
      }
    } else {
      ingestionProcess.provider = BlockExplorersProviderEnum.ETHERSCAN

      if (params.type === IngestionProcessTypeEnum.NATIVE_TRANSFERS) {
        ingestionProcess.metadata = {
          fromBlock: params.fromBlock ?? null,
          page: 1, //it starts from 1 because 0 and 1 are the same page
          pageSize: 1000,
          external: false,
          traces: false,
          saving: false
        } as EvmNativeIngestionTaskMetadata
      } else if (params.type === IngestionProcessTypeEnum.CONTRACT_CONFIGURATION) {
        ingestionProcess.metadata = {
          fromBlock: params.fromBlock ?? null,
          page: 1, //it starts from 1 because 0 and 1 are the same page
          pageSize: 1000,
          logsFrom: false,
          logsTo: false,
          saving: false
        } as EvmLogIngestionTaskMetadata
      } else if (params.type === IngestionProcessTypeEnum.BLOCK_REWARDS) {
        ingestionProcess.metadata = {
          lastBlock: params.fromBlock ?? null,
          page: 1, //it starts from 1 because 0 and 1 are the same page
          pageSize: 10000
        } as EvmBlockRewardMetadata
      }
    }

    return ingestionProcess
  }
}
