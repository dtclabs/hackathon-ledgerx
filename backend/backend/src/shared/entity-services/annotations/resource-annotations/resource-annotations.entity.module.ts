import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FinancialTransactionChildAnnotation } from './financial-transaction-child-annotations.entity'
import { FinancialTransactionChildAnnotationEntityService } from './financial-transaction-child-annotations.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransactionChildAnnotation])],
  controllers: [],
  providers: [FinancialTransactionChildAnnotationEntityService],
  exports: [TypeOrmModule, FinancialTransactionChildAnnotationEntityService]
})
export class ResourceAnnotationsEntityModule {}
