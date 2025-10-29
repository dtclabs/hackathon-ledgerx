import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FinancialTransactionChildAnnotation } from './financial-transaction-child-annotations.entity'
import { ResourceAnnotationsEntityServiceBase } from './resource-annotations.entity-service.base'

export class FinancialTransactionChildAnnotationEntityService extends ResourceAnnotationsEntityServiceBase<FinancialTransactionChildAnnotation> {
  protected entity: new () => FinancialTransactionChildAnnotation = FinancialTransactionChildAnnotation

  constructor(
    @InjectRepository(FinancialTransactionChildAnnotation)
    private resourceAnnotationRepository: Repository<FinancialTransactionChildAnnotation>
  ) {
    super(resourceAnnotationRepository)
  }
}
