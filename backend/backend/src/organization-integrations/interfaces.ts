import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import { OrganizationIntegration } from '../shared/entity-services/organization-integrations/organization-integration.entity'
import {
  OrganizationIntegrationMetadata,
  OrganizationIntegrationStatus
} from '../shared/entity-services/organization-integrations/interfaces'
import {
  CompanyInfo,
  ConnectionStatus,
  LinkToken,
  Platform,
  SyncStatus
} from '../domain/integrations/accounting/interfaces'

export class OrganizationIntegrationQueryParams {
  @IsOptional()
  @IsEnum(IntegrationName)
  @ApiPropertyOptional({
    description: 'Integration Name',
    enum: IntegrationName
  })
  integrationName: IntegrationName

  @IsOptional()
  @IsEnum(Platform)
  @ApiPropertyOptional({
    description: 'Platform name',
    enum: Platform
  })
  platform: Platform
}

export class CreateDtcpayIntegrationMetadataDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signKey?: string

  @ApiProperty()
  @IsNotEmpty()
  terminalId?: number

  @ApiProperty()
  @IsNotEmpty()
  merchantId?: number
}

export class CreateOrganizationIntegrationDTO {
  @IsNotEmpty()
  @IsString()
  @IsEnum(IntegrationName)
  @ApiProperty({
    description: 'Integration Name',
    enum: IntegrationName
  })
  integrationName: IntegrationName

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Authorization code from normal oauth flow',
    nullable: true
  })
  code?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Redirect Uri for oauth flow',
    nullable: true
  })
  redirectUri?: string

  @ValidateIf((obj) => obj.integrationName === IntegrationName.DTCPAY)
  @IsNotEmpty()
  @ApiProperty()
  @ValidateNested()
  @Type((obj) => {
    switch (obj.object.integrationName) {
      case IntegrationName.DTCPAY:
        return CreateDtcpayIntegrationMetadataDTO
      default:
        return undefined
    }
  })
  metadata?: CreateDtcpayIntegrationMetadataDTO
}

export class OrganizationIntegrationDTO {
  @IsNotEmpty()
  @IsString()
  @IsEnum(IntegrationName)
  @ApiProperty({
    description: 'Integration Name',
    enum: IntegrationName
  })
  integrationName: IntegrationName

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Merge temp token with short expiry',
    nullable: true
  })
  linkToken?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Integration Whiltelist Request possible status',
    enum: OrganizationIntegrationStatus,
    example: OrganizationIntegrationStatus.INITIATED
  })
  status?: OrganizationIntegrationStatus

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Integration Metadata'
  })
  metadata?: OrganizationIntegrationMetadata

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Platform name'
  })
  platform?: Platform

  static map(organisationIntegration: OrganizationIntegration): OrganizationIntegrationDTO {
    const result = new OrganizationIntegrationDTO()
    result.integrationName = organisationIntegration.integration.name
    result.status = organisationIntegration.status
    if (organisationIntegration.integration.name !== IntegrationName.TRIPLE_A) {
      result.metadata = organisationIntegration.metadata
    }
    if (organisationIntegration.platform) {
      result.platform = organisationIntegration.platform
    }
    return result
  }

  static mapWithLinkToken(
    organisationIntegration: OrganizationIntegration,
    linkToken: LinkToken
  ): OrganizationIntegrationDTO {
    const result = new OrganizationIntegrationDTO()
    result.integrationName = linkToken.integration_name as IntegrationName
    result.linkToken = linkToken.link_token
    result.status = organisationIntegration.status
    result.metadata = organisationIntegration.metadata
    return result
  }
}

export class SwapTokenDTO {
  @IsString()
  @ApiProperty({
    description: 'The account token for merge',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  token: string
}

export class COADataDTO {
  @IsNotEmpty()
  @ApiProperty({
    description: 'remote id of selected COA',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  remoteId: string
}

export class MigrationDataDTO {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'Category id for which we are replacing it with selected COA',
    example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4'
  })
  previousCOAId: string

  @IsOptional()
  @ApiProperty({ description: 'remote id of selected COA', example: 'ecbe05ac-62a3-46c5-ab31-4b478b37d1b4' })
  remoteId: string
}

export class SubmitDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => COADataDTO)
  @ApiProperty({
    description: 'Remote ids of COAs',
    example: '[{"remoteId": "ecbe05ac-62a3-46c5-ab31-4b478b37d1b4"}]',
    isArray: true,
    type: COADataDTO
  })
  COAData: COADataDTO[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MigrationDataDTO)
  @ApiPropertyOptional({
    description: 'Migration data array',
    example:
      '[{"previousCOAId": "ecbe05ac-62a3-46c5-ab31-4b478b37d1b4","remoteId": "680e946e-67d9-4c5d-a4ac-a70a0d3cef78"}]',
    isArray: true,
    type: MigrationDataDTO
  })
  migrationData: MigrationDataDTO[]
}

export class IntegrationMetadataDTO {
  @IsString()
  @ApiProperty({
    description: 'company name',
    example: ''
  })
  companyName: string

  @IsString()
  @ApiProperty({
    description: 'timezone',
    example: ''
  })
  timezone: string

  @IsString()
  @ApiProperty({
    description: 'currency',
    example: ''
  })
  currency: string

  @IsString()
  @ApiProperty({
    description: 'connection status',
    example: ''
  })
  connectionStatus: ConnectionStatus

  @IsString()
  @ApiProperty({
    description: 'sync status',
    example: ''
  })
  syncStatus: SyncStatus

  static map(companyInfo: CompanyInfo): IntegrationMetadataDTO {
    return {
      companyName: companyInfo.name || '',
      timezone: companyInfo.timezone || '',
      connectionStatus: companyInfo.connection_status || null,
      currency: companyInfo.currency || '',
      syncStatus: companyInfo.sync_status || null
    }
  }
}

export const accountingIntegrations = [IntegrationName.XERO, IntegrationName.QUICKBOOKS]

export const whitelistRequiredIntegrations = [IntegrationName.XERO]
