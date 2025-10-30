import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IngestionWorkflow } from './ingestion-workflow.entity'
import { IngestionWorkflowsEntityService } from './ingestion-workflows.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([IngestionWorkflow])],
  controllers: [],
  providers: [IngestionWorkflowsEntityService],
  exports: [TypeOrmModule, IngestionWorkflowsEntityService]
})
export class IngestionWorkflowsEntityModule {}
