import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { TaskStatusEnum, TaskSyncType } from '../../../core/events/event-types'

@Entity()
export class PreprocessRawTask extends BaseEntity {
  @Column()
  address: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({
    type: 'enum',
    enum: TaskStatusEnum
  })
  status: TaskStatusEnum = TaskStatusEnum.CREATED

  @Column({ name: 'sync_type', nullable: true })
  syncType: TaskSyncType

  @Column({ name: 'first_executed_at', nullable: true })
  firstExecutedAt: Date

  @Column({ name: 'last_executed_at', nullable: true })
  lastExecutedAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ type: 'json', nullable: true })
  metadata: PreprocessRawTaskMetadata

  @Column({ type: 'json', nullable: true })
  error: any

  static create(params: {
    address: string
    blockchainId: string
    syncType: TaskSyncType
    ingestionWorkflowId: string | null
    lastCompletedRawTransactionId: string | null
    lastCompletedBlockNumber: number | null
    lastCompletedValidatedBlockNumber: number | null
  }): PreprocessRawTask {
    const preprocessTask = new PreprocessRawTask()
    preprocessTask.address = params.address
    preprocessTask.blockchainId = params.blockchainId
    preprocessTask.syncType = params.syncType
    preprocessTask.metadata = {
      ingestionWorkflowId: params.ingestionWorkflowId ?? null,
      lastCompletedRawTransactionId: params.lastCompletedRawTransactionId ?? null,
      lastCompletedBlockNumber: params.lastCompletedBlockNumber ?? null,
      lastCompletedValidatedBlockNumber: params.lastCompletedValidatedBlockNumber ?? null
    }

    return preprocessTask
  }
}

export interface PreprocessRawTaskMetadata {
  ingestionWorkflowId: string | null
  lastCompletedRawTransactionId: string | null
  lastCompletedBlockNumber: number | null
  lastCompletedValidatedBlockNumber: number | null
}
