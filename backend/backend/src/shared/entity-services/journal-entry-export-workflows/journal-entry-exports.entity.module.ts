import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { JournalEntryExportWorkflow } from './journal-entry-export-workflow.entity'
import { JournalEntryExportWorkflowEntityService } from './journal-entry-export-workflows.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntryExportWorkflow])],
  controllers: [],
  providers: [JournalEntryExportWorkflowEntityService],
  exports: [TypeOrmModule, JournalEntryExportWorkflowEntityService]
})
export class JournalEntryExportWorkflowsEntityModule {}
