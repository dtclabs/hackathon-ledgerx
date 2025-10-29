import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PaginationParams } from '../core/interfaces'
import { TripleABankResponse } from '../domain/integrations/triple-a/interfaces'
import { camelCase } from 'lodash'

export class BanksQuery extends PaginationParams {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  countryCode: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string
}

export class BankDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  countryCode: string

  @ApiProperty()
  currency: string

  static map(bankResponse: TripleABankResponse): BankDto {
    const dto = new BankDto()
    dto.id = bankResponse.id
    dto.name = bankResponse.name
    dto.countryCode = bankResponse.country_code
    dto.currency = bankResponse.currency
    return dto
  }
}

export class RequiredFieldsQuery {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  countryCode: string
}

export class RequiredFieldDto {
  @ApiProperty()
  required: boolean

  @ApiPropertyOptional()
  options?: string[]

  static map(required: boolean, options?: string[]): RequiredFieldDto {
    const dto = new RequiredFieldDto()
    dto.required = required
    if (options) dto.options = options
    return dto
  }
}

// Fields excluded: externalId, role
export class IndividualFieldsDto {
  @ApiProperty()
  lastName: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  firstName: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  gender: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  email: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  provinceState: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  city: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  address: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  countryCode: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  zipCode: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  dateOfBirth: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  mobileNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  identificationType: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  identificationNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  identificationIssuer: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  identificationIssueDate: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  identificationExpiryDate: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  nationality: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  occupation: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  remarks: RequiredFieldDto = RequiredFieldDto.map(false)

  static map(elements: { field: string; options?: string[] }[]): IndividualFieldsDto {
    const dto = new IndividualFieldsDto()
    for (const element of elements) {
      if (dto.hasOwnProperty(element.field)) {
        dto[element.field] = RequiredFieldDto.map(true, element.options)
      }
    }
    return dto
  }
}

// Fields excluded: externalId, role
export class CompanyFieldsDto {
  @ApiProperty()
  registeredName: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  tradingName: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  registrationType: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  registrationNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  registrationDate: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  registrationExpiryDate: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  registrationCountry: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  email: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  phoneNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  address: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  countryCode: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  zipCode: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  city: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  provinceState: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  mobileNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  remarks: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  businessNature: RequiredFieldDto = RequiredFieldDto.map(false)

  static map(elements: { field: string; options?: string[] }[]): CompanyFieldsDto {
    const dto = new CompanyFieldsDto()
    for (const element of elements) {
      if (dto.hasOwnProperty(element.field)) {
        dto[element.field] = RequiredFieldDto.map(true, element.options)
      }
    }
    return dto
  }
}

// Fields excluded:
// - type
// - ownerId
// - externalId
export class DestinationAccountFieldsDto {
  @ApiProperty()
  bankId: RequiredFieldDto = RequiredFieldDto.map(true)

  @ApiProperty()
  bankName: RequiredFieldDto = RequiredFieldDto.map(true)

  @ApiProperty()
  currency: RequiredFieldDto = RequiredFieldDto.map(true)

  @ApiProperty()
  countryCode: RequiredFieldDto = RequiredFieldDto.map(true)

  @ApiProperty()
  alias: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  cashpoint: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  mobileNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  accountName: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  accountNumber: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  accountType: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  bankAccountType: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  routingType: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  routingCode: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  branchCode: RequiredFieldDto = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientName = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientIdentificationType = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientIdentificationNumber = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientNationality = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientAddress = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientProvinceState = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientCity = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientEmail = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientDateOfBirth = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientIdentificationIssuer = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientIdentificationIssueDate = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientIdentificationExpiryDate = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientGender = RequiredFieldDto.map(false)

  @ApiProperty()
  recipientZipCode = RequiredFieldDto.map(false)

  static map(elements: { field: string; options?: string[] }[]): DestinationAccountFieldsDto {
    const dto = new DestinationAccountFieldsDto()
    for (const element of elements) {
      if (dto.hasOwnProperty(element.field)) {
        dto[element.field] = RequiredFieldDto.map(true, element.options)
      }
    }
    return dto
  }
}

export class RequiredFieldsDto {
  @ApiProperty()
  individual: IndividualFieldsDto

  @ApiProperty()
  company: CompanyFieldsDto

  @ApiProperty()
  destinationAccount: DestinationAccountFieldsDto

  static map(params: {
    individual_recipient: { field: string; accepted_values?: string[] }[]
    company_recipient: { field: string; accepted_values?: string[] }[]
    destination_account: { field: string; accepted_values?: string[] }[]
  }): RequiredFieldsDto {
    const dto = new RequiredFieldsDto()
    dto.individual = IndividualFieldsDto.map(
      params.individual_recipient.map((element) => {
        return { field: camelCase(element.field), options: element.accepted_values }
      })
    )
    dto.company = CompanyFieldsDto.map(
      params.company_recipient.map((element) => {
        return { field: camelCase(element.field), options: element.accepted_values }
      })
    )
    dto.destinationAccount = DestinationAccountFieldsDto.map(
      params.destination_account.map((element) => {
        return { field: camelCase(element.field.replace(/^account\./, '')), options: element.accepted_values }
      })
    )
    return dto
  }
}
