import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { SubscriptionRelatedRequest } from './subscription-related-request.entity'

@Injectable()
export class SubscriptionRelatedRequestsEntityService extends BaseEntityService<SubscriptionRelatedRequest> {
  constructor(
    @InjectRepository(SubscriptionRelatedRequest)
    private subscriptionRelatedRequestsRepository: Repository<SubscriptionRelatedRequest>
  ) {
    super(subscriptionRelatedRequestsRepository)
  }
}
