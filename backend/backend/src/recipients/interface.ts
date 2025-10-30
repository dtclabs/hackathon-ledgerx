import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { PaginationParams } from '../core/interfaces'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { RecipientContact } from '../shared/entity-services/contacts/contacts/recipient-contact.entity'
import { RecipientAddress } from '../shared/entity-services/contacts/recipient-address.entity'

export enum ERecipientType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization'
}

export class RecipientQuery extends PaginationParams {
  @ApiPropertyOptional({ enum: ERecipientType })
  @IsOptional()
  @IsString()
  type: ERecipientType
}

export class UpdateRecipientDto {
  @ApiProperty()
  @ValidateIf((o) => o.type === ERecipientType.ORGANIZATION)
  @IsNotEmpty()
  organizationName: string

  @ApiProperty()
  @ValidateIf((o) => o.type === ERecipientType.ORGANIZATION)
  @IsNotEmpty()
  organizationAddress: string

  @ApiProperty()
  @ValidateIf((o) => o.type === ERecipientType.INDIVIDUAL)
  @IsNotEmpty()
  contactName: string

  @ApiProperty({ type: () => [RecipientAddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientAddressDto)
  wallets: RecipientAddressDto[]

  @ApiProperty({ type: () => [RecipientContactDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientContactDto)
  contacts: RecipientContactDto[]
}

export class CreateRecipientDto extends UpdateRecipientDto {
  @ApiProperty({ enum: ERecipientType })
  @IsNotEmpty()
  type: ERecipientType
}

export class RecipientAddressDto {
  @ApiProperty()
  @IsEnum(SupportedBlockchains)
  blockchainId: string

  @IsOptional()
  @ApiProperty({ example: 'USDT' })
  cryptocurrencySymbol: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string

  static map(recipientAddress: RecipientAddress) {
    const dto = new RecipientAddressDto()
    dto.blockchainId = recipientAddress.blockchainId
    dto.cryptocurrencySymbol = recipientAddress.cryptocurrency?.symbol
    dto.address = recipientAddress.address
    return dto
  }
}

export class RecipientContactDto {
  @ApiProperty({ required: true })
  @IsNumberString()
  providerId: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  content: string

  static map(recipientContact: RecipientContact) {
    const dto = new RecipientContactDto()
    dto.providerId = recipientContact.contactProvider.id
    dto.content = recipientContact.content
    return dto
  }
}
