import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscriptionPlan } from './subscription-plan.entity'
import { BaseEntityService } from '../base.entity-service'

@Injectable()
export class SubscriptionPlansEntityService extends BaseEntityService<SubscriptionPlan> {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlansRepository: Repository<SubscriptionPlan>
  ) {
    super(subscriptionPlansRepository)
  }
}
