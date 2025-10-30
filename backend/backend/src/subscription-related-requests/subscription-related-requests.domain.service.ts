import { Injectable } from '@nestjs/common'
import { CreateSubscriptionRelatedRequestDto, SubscriptionRelatedRequestDto } from './interfaces'
import { SubscriptionRelatedRequestsEntityService } from '../shared/entity-services/subscription-related-requests/subscription-related-requests.entity-service'

@Injectable()
export class SubscriptionRelatedRequestsDomainService {
  constructor(private subscriptionRelatedRequestsEntityService: SubscriptionRelatedRequestsEntityService) {}

  async create(organizationId: string, createSubscriptionRelatedRequestDto: CreateSubscriptionRelatedRequestDto) {
    const subscriptionRelatedRequest = await this.subscriptionRelatedRequestsEntityService.create({
      organizationId: organizationId,
      requestType: createSubscriptionRelatedRequestDto.requestType,
      contactDetails: createSubscriptionRelatedRequestDto.contactDetails,
      requestDetails: createSubscriptionRelatedRequestDto.requestDetails
    })

    return SubscriptionRelatedRequestDto.map(subscriptionRelatedRequest)
  }
}
