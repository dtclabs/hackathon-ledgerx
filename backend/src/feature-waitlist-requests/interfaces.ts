import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ToArray } from '../shared/decorators/transformers/transformers'
import {
  FeatureName,
  FeatureWaitlistRequest
} from '../shared/entity-services/feature-waitlist-requests/feature-waitlist-requests.entity'

export class FeatureWaitlistRequestDto {
  @IsNotEmpty()
  @IsEnum(FeatureName)
  @ApiProperty({
    description: 'Feature Name',
    example: 'nft'
  })
  featureName: FeatureName

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'Contact Email',
    example: 'demo@yopmail.com'
  })
  contactEmail: string

  static map(featureWaitlistRequest: FeatureWaitlistRequest): FeatureWaitlistRequestDto {
    const dto = new FeatureWaitlistRequestDto()

    dto.featureName = featureWaitlistRequest.featureName
    dto.contactEmail = featureWaitlistRequest.contactEmail
    return dto
  }
}

export class GetFeatureWaitlistRequestQueryParams {
  @IsOptional()
  @ToArray()
  @IsEnum(FeatureName, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: [FeatureName.NFT],
    description: 'Get feature waitlist request by the feature name.'
  })
  featureNames: FeatureName[]
}
