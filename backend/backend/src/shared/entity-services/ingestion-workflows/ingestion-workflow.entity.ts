import { Column, Entity, OneToMany } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { TaskStatusEnum } from '../../../core/events/event-types'
import { BlockExplorersProviderEnum } from '../../../domain/block-explorers/block-explorers-provider.enum'
import { IngestionProcess } from '../ingestion-process/ingestion-process.entity'

@Entity()
export class IngestionWorkflow extends BaseEntity {
  @Column()
  address: string

  @Column({
    type: 'enum',
    enum: TaskStatusEnum,
    default: TaskStatusEnum.CREATED
  })
  status: TaskStatusEnum = TaskStatusEnum.CREATED

  // @Deprecated - will be removed in the future
  @Column({ name: 'amount_processed' })
  amountProcessed: number = 0

  @Column({ name: 'last_execution_at', nullable: true })
  lastExecutionAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  // @Deprecated - moved to IngestionProcess
  @Column({ type: 'json', nullable: true })
  metadata: IngestionTaskMetadata

  // @Deprecated - moved to IngestionProcess
  @Column({ type: 'json', nullable: true })
  error: {
    messages: any[]
    retryAt: Date
    retryCount: number
  }

  @OneToMany(() => IngestionProcess, (ingestionProcess) => ingestionProcess.ingestionWorkflow)
  ingestionProcesses: IngestionProcess[]

  constructor() {
    super()
    this.metadata = {
      //TODO: Is this being used?
      provider: BlockExplorersProviderEnum.ALCHEMY,
      nextPageId: null,
      direction: 'to',
      fromBlock: null
    }
  }

  static create(params: { blockchainId: string; address: string; fromBlock: string }): IngestionWorkflow {
    const ingestionTask = new IngestionWorkflow()
    ingestionTask.blockchainId = params.blockchainId
    ingestionTask.address = params.address
    ingestionTask.metadata.fromBlock = params.fromBlock
    return ingestionTask
  }
}

export interface IngestionTaskMetadata {
  provider: BlockExplorersProviderEnum
  nextPageId: string
  direction: 'to' | 'from'
  fromBlock: string | null
}
