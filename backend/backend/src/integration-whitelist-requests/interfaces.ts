import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import {
  IntegrationWhitelistRequest,
  IntegrationWhitelistRequestStatus
} from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-requests.entity'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'

export class IntegrationWhitelistDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Integration Name',
    example: 'xero'
  })
  integrationName: IntegrationName

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'Contact Email',
    example: 'demo@yopmail.com'
  })
  contactEmail: string

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Integration Whitelist Request possible status',
    enum: IntegrationWhitelistRequestStatus,
    example: IntegrationWhitelistRequestStatus.REQUESTED,
    type: IntegrationWhitelistRequestStatus
  })
  status?: IntegrationWhitelistRequestStatus

  @IsOptional()
  @ApiPropertyOptional({ example: '2023-02-28T07:58:47.000Z' })
  createdAt?: Date

  static map(integrationWhitelistRequest: IntegrationWhitelistRequest): IntegrationWhitelistDTO {
    const dto = new IntegrationWhitelistDTO()

    dto.integrationName = integrationWhitelistRequest.integrationName.name
    dto.contactEmail = integrationWhitelistRequest.contactEmail
    dto.status = integrationWhitelistRequest.status
    dto.createdAt = integrationWhitelistRequest.createdAt
    return dto
  }
}
