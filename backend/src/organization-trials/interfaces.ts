import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import {
  OrganizationTrial,
  OrganizationTrialStatus
} from '../shared/entity-services/organization-trials/organization-trial.entity'

export class OrganizationTrialDto {
  @ApiProperty({ enum: OrganizationTrialStatus, nullable: false })
  status: OrganizationTrialStatus

  @ApiProperty({ example: '2023-02-28T07:58:47.000Z', nullable: false })
  @IsNotEmpty()
  expiredAt: Date

  public static map(organizationTrial: OrganizationTrial): OrganizationTrialDto {
    const dto = new OrganizationTrialDto()
    dto.status = organizationTrial.status
    dto.expiredAt = organizationTrial.expiredAt
    return dto
  }
}
