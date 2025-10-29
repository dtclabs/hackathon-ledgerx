import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEthereumAddress, IsNotEmpty, IsOptional } from 'class-validator'
import { Member } from '../shared/entity-services/members/member.entity'
import { Organization } from '../shared/entity-services/organizations/organization.entity'

export class CreateOrganizationDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsNotEmpty()
  @ApiProperty()
  type: OrganizationType

  @ApiProperty({ type: () => [OnboardingContactDto] })
  @IsOptional()
  // TODO: Enable this later
  // @IsArray()
  // @ValidateNested()
  // @ArrayMinSize(1)
  contacts?: OnboardingContactDto[]

  @ApiProperty()
  @IsOptional()
  jobTitle?: string

  members?: Member[]
}

export class ValidateAddressDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  @ApiPropertyOptional({ example: '0x0000000000000000000000000000000000000000' })
  address: string
}

export class UpdateOrganizationDto {
  @IsNotEmpty()
  @ApiProperty()
  id: string

  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsNotEmpty()
  @ApiProperty()
  type: OrganizationType
}

export class PublicOrganizationDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  publicId: string

  constructor(param: { name: string; publicId: string }) {
    this.name = param.name
    this.publicId = param.publicId
  }

  static map(param: { organization: Organization }) {
    return new PublicOrganizationDto({
      name: param.organization.name,
      publicId: param.organization.publicId
    })
  }
}

export enum OrganizationType {
  DAO = 'DAO',
  COMPANY = 'COMPANY'
}

export class OnboardingContactDto {
  @ApiProperty()
  provider: string

  @ApiProperty()
  content: string
}

export enum JobTitles {
  CFO = 'Chief Financial Officer',
  CEO = 'Chief Executive Officer',
  OPERATIONS_MANAGER = 'Operations Manager',
  FINANCE_MANAGER = 'Finance Manager',
  ACCOUNTANT = 'Accountant',
  FINANCIAL_ANALYST = 'Financial Analyst',
  OTHER = 'Other'
}

export enum OnboardingContactProvider {
  EMAIL = 'Email',
  WHATSAPP = 'WhatsApp',
  TELEGRAM = 'Telegram',
  OTHER = 'Other'
}
