import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger'
import { PaginationParams } from '../core/interfaces'
import { RecipientBankAccount } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-account.entity'
import { FiatCurrencyDetailedDto } from '../fiat-currencies/interfaces'
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import {
  TripleAAccountType,
  TripleABankAccountType,
  TripleABusinessNature,
  TripleACompanyResponse,
  TripleADestinationAccountResponse,
  TripleAGender,
  TripleAIdentificationType,
  TripleAIndividualResponse,
  TripleAOccupation,
  TripleARecipientType,
  TripleARoutingType
} from '../domain/integrations/triple-a/interfaces'

export class RecipientBankAccountsQueryParams extends PaginationParams {}

export class IndividualDto {
  @ApiProperty()
  lastName: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  @IsEnum(TripleAGender)
  gender: TripleAGender

  @ApiProperty()
  email: string

  @ApiProperty()
  provinceState: string

  @ApiProperty()
  city: string

  @ApiProperty()
  address: string

  @ApiProperty()
  countryCode: string

  @ApiProperty()
  zipCode: string

  @ApiProperty()
  dateOfBirth: string

  @ApiProperty()
  mobileNumber: string

  @ApiProperty()
  @IsEnum(TripleAIdentificationType)
  identificationType: TripleAIdentificationType

  @ApiProperty()
  identificationNumber: string

  @ApiProperty()
  identificationIssuer: string

  @ApiProperty()
  identificationIssueDate: string

  @ApiProperty()
  identificationExpiryDate: string

  @ApiProperty()
  nationality: string

  @ApiProperty()
  @IsEnum(TripleAOccupation)
  occupation: TripleAOccupation

  @ApiProperty()
  remarks: string

  static map(individual: TripleAIndividualResponse): IndividualDto {
    const dto = new IndividualDto()
    dto.lastName = individual.last_name
    dto.firstName = individual.first_name
    dto.gender = individual.gender
    dto.email = individual.email
    dto.provinceState = individual.province_state
    dto.city = individual.city
    dto.address = individual.address
    dto.countryCode = individual.country_code
    dto.zipCode = individual.zip_code
    dto.dateOfBirth = individual.date_of_birth
    dto.mobileNumber = individual.mobile_number
    dto.identificationType = individual.identification_type
    dto.identificationNumber = individual.identification_number
    dto.nationality = individual.nationality
    dto.remarks = individual.remarks
    return dto
  }
}

export class CompanyDto {
  @ApiProperty()
  registeredName: string

  @ApiProperty()
  tradingName: string

  @ApiProperty()
  registrationType: string

  @ApiProperty()
  registrationNumber: string

  @ApiProperty()
  registrationDate: string

  @ApiProperty()
  registrationExpiryDate: string

  @ApiProperty()
  registrationCountry: string

  @ApiProperty()
  email: string

  @ApiProperty()
  phoneNumber: string

  @ApiProperty()
  address: string

  @ApiProperty()
  countryCode: string

  @ApiProperty()
  zipCode: string

  @ApiProperty()
  city: string

  @ApiProperty()
  provinceState: string

  @ApiProperty()
  mobileNumber: string

  @ApiProperty()
  remarks: string

  @ApiProperty()
  @IsEnum(TripleABusinessNature)
  businessNature: TripleABusinessNature

  static map(company: TripleACompanyResponse): CompanyDto {
    const dto = new CompanyDto()
    dto.registeredName = company.registered_name
    dto.tradingName = company.trading_name
    dto.registrationType = company.registration_type
    dto.registrationNumber = company.registration_number
    dto.registrationDate = company.registration_date
    dto.registrationExpiryDate = company.registration_expiry_date
    dto.registrationCountry = company.registration_country
    dto.email = company.email
    dto.phoneNumber = company.phone_number
    dto.address = company.address
    dto.countryCode = company.country_code
    dto.zipCode = company.zip_code
    dto.city = company.city
    dto.provinceState = company.province_state
    dto.mobileNumber = company.mobile_number
    dto.remarks = company.remarks
    dto.businessNature = company.business_nature
    return dto
  }
}

export class DestinationAccountDto {
  @ApiProperty()
  bankId: string

  @ApiProperty()
  bankName: string

  @ApiProperty()
  currency: string

  @ApiProperty()
  countryCode: string

  @ApiProperty()
  alias: string

  @ApiProperty()
  cashpoint: string

  @ApiProperty()
  mobileNumber: string

  @ApiProperty()
  accountName: string

  @ApiProperty()
  accountNumber: string

  @ApiProperty()
  @IsEnum(TripleAAccountType)
  accountType: TripleAAccountType

  @ApiProperty()
  @IsEnum(TripleABankAccountType)
  bankAccountType: TripleABankAccountType

  @ApiProperty()
  routingType: TripleARoutingType

  @ApiProperty()
  routingCode: string

  @ApiProperty()
  branchCode: string

  @ApiProperty()
  recipientName: string

  @ApiProperty()
  @IsEnum(TripleAIdentificationType)
  recipientIdentificationType: TripleAIdentificationType

  @ApiProperty()
  recipientIdentificationNumber: string

  @ApiProperty()
  recipientNationality: string

  @ApiProperty()
  recipientAddress: string

  @ApiProperty()
  recipientProvinceState: string

  @ApiProperty()
  recipientCity: string

  @ApiProperty()
  recipientEmail: string

  @ApiProperty()
  recipientDateOfBirth: string

  @ApiProperty()
  recipientIdentificationIssuer: string

  @ApiProperty()
  recipientIdentificationIssueDate: string

  @ApiProperty()
  recipientIdentificationExpiryDate: string

  @ApiProperty()
  @IsEnum(TripleAGender)
  recipientGender: TripleAGender

  @ApiProperty()
  recipientZipCode: string

  static map(destinationAccount: TripleADestinationAccountResponse): DestinationAccountDto {
    const dto = new DestinationAccountDto()
    dto.countryCode = destinationAccount.country_code
    dto.alias = destinationAccount.alias
    dto.cashpoint = destinationAccount.account.cashpoint
    dto.mobileNumber = destinationAccount.account.mobile_number
    dto.accountName = destinationAccount.account.account_name
    dto.accountNumber = destinationAccount.account.account_number
    dto.accountType = destinationAccount.account.account_type
    dto.bankAccountType = destinationAccount.account.bank_account_type
    dto.routingType = destinationAccount.account.routing_type
    dto.routingCode = destinationAccount.account.routing_code
    dto.branchCode = destinationAccount.account.branch_code
    dto.recipientName = destinationAccount.account.recipient_name
    dto.recipientIdentificationType = destinationAccount.account.recipient_identification_type
    dto.recipientIdentificationNumber = destinationAccount.account.recipient_identification_number
    dto.recipientNationality = destinationAccount.account.recipient_nationality
    dto.recipientAddress = destinationAccount.account.recipient_address
    dto.recipientProvinceState = destinationAccount.account.recipient_province_state
    dto.recipientCity = destinationAccount.account.recipient_city
    dto.recipientEmail = destinationAccount.account.recipient_email
    dto.recipientDateOfBirth = destinationAccount.account.recipient_date_of_birth
    dto.recipientIdentificationIssuer = destinationAccount.account.recipient_identification_issuer
    dto.recipientIdentificationIssueDate = destinationAccount.account.recipient_identification_issue_date
    dto.recipientIdentificationExpiryDate = destinationAccount.account.recipient_identification_expiry_date
    dto.recipientGender = destinationAccount.account.recipient_gender
    dto.recipientZipCode = destinationAccount.account.recipient_zip_code
    return dto
  }
}

export class RecipientBankAccountDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  bankName: string

  @ApiProperty()
  accountNumberLast4: string

  @ApiProperty()
  fiatCurrency: FiatCurrencyDetailedDto

  @ApiProperty()
  destinationAccount: DestinationAccountDto

  @ApiProperty()
  @IsEnum(TripleARecipientType)
  recipientType: TripleARecipientType

  @ApiProperty({
    type: () => Object,
    oneOf: [{ $ref: getSchemaPath(IndividualDto) }, { $ref: getSchemaPath(CompanyDto) }]
  })
  recipient: IndividualDto | CompanyDto

  static map(
    recipientBankAccount: RecipientBankAccount,
    destinationAccount?: TripleADestinationAccountResponse,
    recipient?: {
      type: TripleARecipientType
      response: TripleAIndividualResponse | TripleACompanyResponse
    }
  ): RecipientBankAccountDto {
    const dto = new RecipientBankAccountDto()
    dto.id = recipientBankAccount.publicId
    dto.bankName = recipientBankAccount.bankName
    dto.accountNumberLast4 = recipientBankAccount.accountNumberLast4
    dto.fiatCurrency = FiatCurrencyDetailedDto.map(recipientBankAccount.fiatCurrency)

    if (destinationAccount) {
      dto.destinationAccount = DestinationAccountDto.map(destinationAccount)
    }

    if (recipient) {
      dto.recipientType = recipient.type
      switch (dto.recipientType) {
        case TripleARecipientType.INDIVIDUAL:
          dto.recipient = IndividualDto.map(recipient.response as TripleAIndividualResponse)
          break
        case TripleARecipientType.COMPANY:
          dto.recipient = CompanyDto.map(recipient.response as TripleACompanyResponse)
          break
      }
    }

    return dto
  }
}

export class CreateIndividualDto {
  @ApiPropertyOptional()
  lastName: string

  @ApiPropertyOptional()
  firstName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleAGender)
  gender: TripleAGender

  @ApiPropertyOptional()
  email: string

  @ApiPropertyOptional()
  provinceState: string

  @ApiPropertyOptional()
  city: string

  @ApiPropertyOptional()
  address: string

  @ApiPropertyOptional()
  countryCode: string

  @ApiPropertyOptional()
  zipCode: string

  @ApiPropertyOptional()
  dateOfBirth: string

  @ApiPropertyOptional()
  mobileNumber: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleAIdentificationType)
  identificationType: TripleAIdentificationType

  @ApiPropertyOptional()
  identificationNumber: string

  @ApiPropertyOptional()
  identificationIssuer: string

  @ApiPropertyOptional()
  identificationIssueDate: string

  @ApiPropertyOptional()
  identificationExpiryDate: string

  @ApiPropertyOptional()
  nationality: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleAOccupation)
  occupation: TripleAOccupation

  @ApiPropertyOptional()
  remarks: string
}

export class CreateCompanyDto {
  @ApiPropertyOptional()
  registeredName: string

  @ApiPropertyOptional()
  tradingName: string

  @ApiPropertyOptional()
  registrationType: string

  @ApiPropertyOptional()
  registrationNumber: string

  @ApiPropertyOptional()
  registrationDate: string

  @ApiPropertyOptional()
  registrationExpiryDate: string

  @ApiPropertyOptional()
  registrationCountry: string

  @ApiPropertyOptional()
  email: string

  @ApiPropertyOptional()
  phoneNumber: string

  @ApiPropertyOptional()
  address: string

  @ApiPropertyOptional()
  countryCode: string

  @ApiPropertyOptional()
  zipCode: string

  @ApiPropertyOptional()
  city: string

  @ApiPropertyOptional()
  provinceState: string

  @ApiPropertyOptional()
  mobileNumber: string

  @ApiPropertyOptional()
  remarks: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleABusinessNature)
  businessNature: TripleABusinessNature
}

export class CreateDestinationAccountDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  bankId: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  bankName: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  currency: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  countryCode: string

  @ApiPropertyOptional()
  alias: string

  @ApiPropertyOptional()
  cashpoint: string

  @ApiPropertyOptional()
  mobileNumber: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  accountName: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  accountNumber: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleAAccountType)
  accountType: TripleAAccountType

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleABankAccountType)
  bankAccountType: TripleABankAccountType

  @ApiPropertyOptional()
  routingType: TripleARoutingType

  @ApiPropertyOptional()
  routingCode: string

  @ApiPropertyOptional()
  branchCode: string

  @ApiPropertyOptional()
  recipientName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleAIdentificationType)
  recipientIdentificationType: TripleAIdentificationType

  @ApiPropertyOptional()
  recipientIdentificationNumber: string

  @ApiPropertyOptional()
  recipientNationality: string

  @ApiPropertyOptional()
  recipientAddress: string

  @ApiPropertyOptional()
  recipientProvinceState: string

  @ApiPropertyOptional()
  recipientCity: string

  @ApiPropertyOptional()
  recipientEmail: string

  @ApiPropertyOptional()
  recipientDateOfBirth: string

  @ApiPropertyOptional()
  recipientIdentificationIssuer: string

  @ApiPropertyOptional()
  recipientIdentificationIssueDate: string

  @ApiPropertyOptional()
  recipientIdentificationExpiryDate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TripleAGender)
  recipientGender: TripleAGender

  @ApiPropertyOptional()
  recipientZipCode: string
}

@ApiExtraModels(CreateIndividualDto, CreateCompanyDto)
export class CreateRecipientBankAccountDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateDestinationAccountDto)
  destinationAccount: CreateDestinationAccountDto

  @ApiProperty({ required: true })
  @IsEnum(TripleARecipientType)
  recipientType: TripleARecipientType

  @ApiProperty({
    required: true,
    type: () => Object,
    oneOf: [{ $ref: getSchemaPath(CreateIndividualDto) }, { $ref: getSchemaPath(CreateCompanyDto) }]
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type((obj) => {
    switch (obj.object.recipientType) {
      case TripleARecipientType.INDIVIDUAL:
        return CreateIndividualDto
      case TripleARecipientType.COMPANY:
        return CreateCompanyDto
      default:
        return undefined
    }
  })
  recipient: CreateIndividualDto | CreateCompanyDto
}

export class UpdateRecipientBankAccountDto extends CreateRecipientBankAccountDto {}
