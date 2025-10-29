import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import { FinancialTransactionChild } from '../../financial-transactions/financial-transaction-child.entity'
import { ResourceAnnotationBase } from './resource-annotation.entity.base'

@Entity()
export class FinancialTransactionChildAnnotation extends ResourceAnnotationBase<FinancialTransactionChild> {
  @ManyToOne(() => FinancialTransactionChild)
  @JoinColumn({ name: 'financial_transaction_child_id' })
  resource: FinancialTransactionChild
}
