import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BankFeedExportWorkflow } from './bank-feed-export-workflows.entity'
import { BankFeedExportWorkflowEntityService } from './bank-feed-export-workflows.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([BankFeedExportWorkflow])],
  controllers: [],
  providers: [BankFeedExportWorkflowEntityService],
  exports: [TypeOrmModule, BankFeedExportWorkflowEntityService]
})
export class BankFeedExportWorkflowsEntityModule {}
