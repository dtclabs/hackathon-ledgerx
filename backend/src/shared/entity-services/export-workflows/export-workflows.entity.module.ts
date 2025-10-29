import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ExportWorkflowsEntityService } from './export-workflows.entity.service'
import { ExportWorkflow } from './export-workflow.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ExportWorkflow])],
  controllers: [],
  providers: [ExportWorkflowsEntityService],
  exports: [TypeOrmModule, ExportWorkflowsEntityService]
})
export class ExportWorkflowsEntityModule {}
