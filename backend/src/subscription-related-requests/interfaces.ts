import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { RequestType } from '../shared/entity-services/subscription-related-requests/interfaces'
import { SubscriptionRelatedRequest } from '../shared/entity-services/subscription-related-requests/subscription-related-request.entity'

export class CreateSubscriptionRelatedRequestDto {
  @IsEnum(RequestType)
  @ApiProperty({ enum: RequestType, example: RequestType.INTEREST })
  requestType: RequestType

  @ApiProperty({ example: { email: 'sample@LedgerX' } })
  contactDetails: any

  @ApiProperty({ example: { feedback: 'Some feedback' } })
  requestDetails: any
}

export class SubscriptionRelatedRequestDto {
  @IsEnum(RequestType)
  @ApiProperty({ enum: RequestType, example: RequestType.INTEREST })
  requestType: RequestType

  @ApiProperty({ example: { email: 'sample@LedgerX' } })
  contactDetails: any

  @ApiProperty({ example: { feedback: 'Some feedback' } })
  requestDetails: any

  static map(subscriptionRelatedRequest: SubscriptionRelatedRequest): SubscriptionRelatedRequestDto {
    const result = new SubscriptionRelatedRequestDto()
    result.requestType = subscriptionRelatedRequest.requestType
    result.contactDetails = subscriptionRelatedRequest.contactDetails
    result.requestDetails = subscriptionRelatedRequest.requestDetails

    return result
  }
}
