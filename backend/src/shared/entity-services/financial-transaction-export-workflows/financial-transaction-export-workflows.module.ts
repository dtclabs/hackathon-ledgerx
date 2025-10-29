import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FinancialTransactionExportWorkflowEntityService } from './financial-transaction-export-workflows.entity-service'
import { FinancialTransactionExportWorkflow } from './financial-transaction-export-workflows.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransactionExportWorkflow])],
  controllers: [],
  providers: [FinancialTransactionExportWorkflowEntityService],
  exports: [TypeOrmModule, FinancialTransactionExportWorkflowEntityService]
})
export class FinancialTransactionExportWorkflowsEntityModule {}
