import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { BillingHistory } from './billing-history.entity'

@Injectable()
export class BillingHistoriesEntityService extends BaseEntityService<BillingHistory> {
  constructor(
    @InjectRepository(BillingHistory)
    private billingHistoriesRepository: Repository<BillingHistory>
  ) {
    super(billingHistoriesRepository)
  }
}
