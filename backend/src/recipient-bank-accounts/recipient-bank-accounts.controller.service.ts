import { FindOptionsWhere } from 'typeorm'
import { TripleAService } from '../domain/integrations/triple-a/triple-a.service'
import { RecipientBankAccount } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-account.entity'
import { RecipientBankAccountsEntityService } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-accounts.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import {
  CreateCompanyDto,
  CreateDestinationAccountDto,
  CreateIndividualDto,
  CreateRecipientBankAccountDto,
  RecipientBankAccountDto,
  RecipientBankAccountsQueryParams,
  UpdateRecipientBankAccountDto
} from './interfaces'
import { PaginationResponse } from '../core/interfaces'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { RecipientsEntityService } from '../shared/entity-services/contacts/recipients.entity-service'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import {
  TripleABankResponse,
  TripleACompanyResponse,
  TripleACreateCompanyRequest,
  TripleACreateDestinationAccountRequest,
  TripleACreateIndividualRequest,
  TripleADestinationAccountResponse,
  TripleAIndividualResponse,
  TripleARecipientType
} from '../domain/integrations/triple-a/interfaces'
import { ERecipientType } from '../recipients/interface'
import { CompanyFieldsDto, IndividualFieldsDto, RequiredFieldDto, RequiredFieldsDto } from '../triple-a/interfaces'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RecipientBankAccountDeletedEvent, RecipientBankAccountEventType } from './events/event'

@Injectable()
export class RecipientBankAccountsControllerService {
  constructor(
    private readonly recipientsEntityService: RecipientsEntityService,
    private readonly recipientBankAccountsEntityService: RecipientBankAccountsEntityService,
    private readonly fiatCurrenciesEntityService: FiatCurrenciesEntityService,
    private readonly tripleAService: TripleAService,
    private readonly eventEmitter: EventEmitter2,
    private readonly loggerService: LoggerService
  ) {}

  async getAllPaging(
    organizationId: string,
    recipientPublicId: string,
    query: RecipientBankAccountsQueryParams
  ): Promise<PaginationResponse<RecipientBankAccountDto>> {
    const whereConditions: FindOptionsWhere<RecipientBankAccount> = {
      recipient: { publicId: recipientPublicId, organization: { id: organizationId } }
    }

    const results = await this.recipientBankAccountsEntityService.getAllPaging(query, [], whereConditions as any, [
      'fiatCurrency'
    ])

    return PaginationResponse.from({
      items: results.items.map((item) => RecipientBankAccountDto.map(item)),
      totalItems: results.totalItems,
      currentPage: results.currentPage,
      limit: results.limit
    })
  }

  async getRecipientBankAccount(
    recipientBankAccountPublicId: string,
    recipientPublicId: string,
    organizationId: string
  ): Promise<RecipientBankAccountDto> {
    const recipientBankAccount = await this.recipientBankAccountsEntityService.findOneByPublicId(
      recipientBankAccountPublicId,
      organizationId,
      { recipientPublicId: recipientPublicId, relations: { recipient: true } }
    )

    if (!recipientBankAccount) throw new NotFoundException('Recipient bank account not found')

    const destinationAccount = await this.tripleAService.getDestinationAccount(recipientBankAccount.tripleAId)

    switch (recipientBankAccount.recipient.type) {
      case ERecipientType.INDIVIDUAL:
        const individual = await this.tripleAService.getIndividual(destinationAccount.owner_id)
        return RecipientBankAccountDto.map(recipientBankAccount, destinationAccount, {
          type: TripleARecipientType.INDIVIDUAL,
          response: individual
        })
      case ERecipientType.ORGANIZATION:
        const company = await this.tripleAService.getCompany(destinationAccount.owner_id)
        return RecipientBankAccountDto.map(recipientBankAccount, destinationAccount, {
          type: TripleARecipientType.COMPANY,
          response: company
        })
      default:
        throw new BadRequestException('Invalid recipient type')
    }
  }

  async createRecipientBankAccount(
    recipientPublicId: string,
    organizationId: string,
    createRecipientBankAccountDto: CreateRecipientBankAccountDto
  ): Promise<RecipientBankAccountDto> {
    const recipient = await this.recipientsEntityService.getByOrganizationAndPublicId(organizationId, recipientPublicId)
    if (!recipient) {
      throw new NotFoundException('Recipient not found')
    }
    const bank = await this.findBank(
      createRecipientBankAccountDto.destinationAccount.countryCode,
      createRecipientBankAccountDto.destinationAccount.bankId,
      createRecipientBankAccountDto.destinationAccount.bankName
    )
    const fiatCurrency = await this.fiatCurrenciesEntityService.getByAlphabeticCode(
      createRecipientBankAccountDto.destinationAccount.currency
    )
    if (!fiatCurrency) {
      throw new NotFoundException('Currency not found')
    } else if (bank.currency != fiatCurrency.alphabeticCode) {
      throw new BadRequestException(`Invalid currency: ${createRecipientBankAccountDto.destinationAccount.currency}`)
    }

    await this.validateParams(createRecipientBankAccountDto, recipient.type)

    let tripleARecipient: { type: TripleARecipientType; response: TripleAIndividualResponse | TripleACompanyResponse }

    switch (recipient.type) {
      case ERecipientType.INDIVIDUAL:
        const individual = await this.createIndividual(createRecipientBankAccountDto.recipient as CreateIndividualDto)
        tripleARecipient = {
          type: TripleARecipientType.INDIVIDUAL,
          response: individual
        }
        break
      case ERecipientType.ORGANIZATION:
        const company = await this.createCompany(createRecipientBankAccountDto.recipient as CreateCompanyDto)
        tripleARecipient = {
          type: TripleARecipientType.COMPANY,
          response: company
        }
        break
    }

    const destinationAccount = await this.createDestinationAccount(
      tripleARecipient.response.id,
      createRecipientBankAccountDto.destinationAccount
    )

    const recipientBankAccount = await this.recipientBankAccountsEntityService.createRecipientBankAccount({
      tripleAId: destinationAccount.id,
      recipient: recipient,
      bankName: createRecipientBankAccountDto.destinationAccount.bankName,
      accountNumber: createRecipientBankAccountDto.destinationAccount.accountNumber,
      fiatCurrency: fiatCurrency
    })

    return RecipientBankAccountDto.map(recipientBankAccount, destinationAccount, tripleARecipient)
  }

  async updateRecipientBankAccount(
    recipientBankAccountPublicId: string,
    recipientPublicId: string,
    organizationId: string,
    params: UpdateRecipientBankAccountDto
  ): Promise<RecipientBankAccountDto> {
    const existingRecipientBankAccount = await this.recipientBankAccountsEntityService.findOneByPublicId(
      recipientBankAccountPublicId,
      organizationId,
      { recipientPublicId: recipientPublicId }
    )

    if (!existingRecipientBankAccount) throw new NotFoundException('Recipient bank account not found')

    const newRecipientBankAccount = await this.createRecipientBankAccount(recipientPublicId, organizationId, params)

    await this.recipientBankAccountsEntityService.softDeleteById(existingRecipientBankAccount.id)
    this.eventEmitter.emit(
      RecipientBankAccountEventType.RECIPIENT_BANK_ACCOUNT_DELETED,
      new RecipientBankAccountDeletedEvent(existingRecipientBankAccount.id, organizationId)
    )

    return newRecipientBankAccount
  }

  async deleteRecipientBankAccount(
    recipientBankAccountPublicId: string,
    recipientPublicId: string,
    organizationId: string
  ): Promise<void> {
    const recipientBankAccount = await this.recipientBankAccountsEntityService.findOneByPublicId(
      recipientBankAccountPublicId,
      organizationId,
      { recipientPublicId: recipientPublicId }
    )

    if (!recipientBankAccount) throw new NotFoundException('Recipient bank account not found')

    await this.recipientBankAccountsEntityService.softDeleteById(recipientBankAccount.id)
    this.eventEmitter.emit(
      RecipientBankAccountEventType.RECIPIENT_BANK_ACCOUNT_DELETED,
      new RecipientBankAccountDeletedEvent(recipientBankAccount.id, organizationId)
    )
  }

  private async createIndividual(createIndividualDto: CreateIndividualDto): Promise<TripleAIndividualResponse> {
    const params: TripleACreateIndividualRequest = {
      gender: createIndividualDto.gender,
      lastName: createIndividualDto.lastName,
      firstName: createIndividualDto.firstName,
      email: createIndividualDto.email,
      countryCode: createIndividualDto.countryCode,
      provinceState: createIndividualDto.provinceState,
      city: createIndividualDto.city,
      address: createIndividualDto.address,
      zipCode: createIndividualDto.zipCode,
      dateOfBirth: createIndividualDto.dateOfBirth,
      mobileNumber: createIndividualDto.mobileNumber,
      identificationType: createIndividualDto.identificationType,
      identificationNumber: createIndividualDto.identificationNumber,
      identificationIssuer: createIndividualDto.identificationIssuer,
      identificationIssueDate: createIndividualDto.identificationIssueDate,
      identificationExpiryDate: createIndividualDto.identificationExpiryDate,
      nationality: createIndividualDto.nationality,
      occupation: createIndividualDto.occupation,
      remarks: createIndividualDto.remarks
    }
    return await this.tripleAService.createIndividual(params)
  }

  private async createCompany(createCompanyDto: CreateCompanyDto): Promise<TripleACompanyResponse> {
    const params: TripleACreateCompanyRequest = {
      registeredName: createCompanyDto.registeredName,
      tradingName: createCompanyDto.tradingName,
      registrationType: createCompanyDto.registrationType,
      registrationNumber: createCompanyDto.registrationNumber,
      registrationDate: createCompanyDto.registrationDate,
      registrationExpiryDate: createCompanyDto.registrationExpiryDate,
      registrationCountry: createCompanyDto.registrationCountry,
      email: createCompanyDto.email,
      phoneNumber: createCompanyDto.phoneNumber,
      address: createCompanyDto.address,
      countryCode: createCompanyDto.countryCode,
      zipCode: createCompanyDto.zipCode,
      city: createCompanyDto.city,
      provinceState: createCompanyDto.provinceState,
      mobileNumber: createCompanyDto.mobileNumber,
      remarks: createCompanyDto.remarks,
      businessNature: createCompanyDto.businessNature
    }
    return await this.tripleAService.createCompany(params)
  }

  private async createDestinationAccount(
    ownerId: string,
    createDestinationAccountDto: CreateDestinationAccountDto
  ): Promise<TripleADestinationAccountResponse> {
    const params: TripleACreateDestinationAccountRequest = {
      ownerId: ownerId,
      receivingInstitutionId: createDestinationAccountDto.bankId,
      currency: createDestinationAccountDto.currency,
      countryCode: createDestinationAccountDto.countryCode,
      alias: createDestinationAccountDto.alias,
      account: {
        cashpoint: createDestinationAccountDto.cashpoint,
        mobileNumber: createDestinationAccountDto.mobileNumber,
        accountName: createDestinationAccountDto.accountName,
        accountNumber: createDestinationAccountDto.accountNumber,
        accountType: createDestinationAccountDto.accountType,
        bankAccountType: createDestinationAccountDto.bankAccountType,
        routingType: createDestinationAccountDto.routingType,
        routingCode: createDestinationAccountDto.routingCode,
        branchCode: createDestinationAccountDto.branchCode,
        bankName: createDestinationAccountDto.bankName,
        recipientName: createDestinationAccountDto.recipientName,
        recipientIdentificationType: createDestinationAccountDto.recipientIdentificationType,
        recipientIdentificationNumber: createDestinationAccountDto.recipientIdentificationNumber,
        recipientNationality: createDestinationAccountDto.recipientNationality,
        recipientAddress: createDestinationAccountDto.recipientAddress,
        recipientProvinceState: createDestinationAccountDto.recipientProvinceState,
        recipientCity: createDestinationAccountDto.recipientCity,
        recipientEmail: createDestinationAccountDto.recipientEmail,
        recipientDateOfBirth: createDestinationAccountDto.recipientDateOfBirth,
        recipientIdentificationIssuer: createDestinationAccountDto.recipientIdentificationIssuer,
        recipientIdentificationIssueDate: createDestinationAccountDto.recipientIdentificationIssueDate,
        recipientIdentificationExpiryDate: createDestinationAccountDto.recipientIdentificationExpiryDate,
        recipientGender: createDestinationAccountDto.recipientGender,
        recipientZipCode: createDestinationAccountDto.recipientZipCode
      }
    }
    return await this.tripleAService.createDestinationAccount(params)
  }

  private async findBank(countryCode: string, bankId: string, bankName: string): Promise<TripleABankResponse> {
    // Additional filter as bankName might not be unique and id filter is not working on Triple A
    const banks = (
      await this.tripleAService.listBanks({
        countryCode: countryCode,
        name: bankName,
        id: bankId
      })
    ).filter((bank) => bank.id == bankId && bank.name.trim().toUpperCase() == bankName.trim().toUpperCase())
    // Bank should be unique
    if (banks.length != 1) {
      throw new BadRequestException(`Invalid bankId: ${bankId}`)
    }

    return banks[0]
  }

  private async validateParams(
    createRecipientBankAccountDto: CreateRecipientBankAccountDto,
    recipientType: ERecipientType
  ): Promise<void> {
    const destinationAccountDto = createRecipientBankAccountDto.destinationAccount
    const destinationAccountRequiredFieldsResponse = (
      await this.tripleAService.listRequiredFields(destinationAccountDto.countryCode)
    )?.[destinationAccountDto.countryCode]?.bank_account

    if (!destinationAccountRequiredFieldsResponse || !destinationAccountRequiredFieldsResponse.destination_account) {
      throw new BadRequestException(`Country not supported: ${destinationAccountDto.countryCode}`)
    }

    const destinationAccountRequiredFieldsDto = RequiredFieldsDto.map(destinationAccountRequiredFieldsResponse)

    // Validate required fields
    for (const key of Object.keys(destinationAccountRequiredFieldsDto.destinationAccount)) {
      const element = destinationAccountRequiredFieldsDto.destinationAccount[key] as RequiredFieldDto

      if (element.required && !destinationAccountDto[key]) {
        throw new BadRequestException(`Missing destinationAccount field: ${key}`)
      }

      if (element.options && !element.options.includes(destinationAccountDto[key].toString())) {
        throw new BadRequestException(`Invalid destinationAccount field: ${key}`)
      }
    }

    const recipientCountryCode =
      createRecipientBankAccountDto.recipient.countryCode ?? destinationAccountDto.countryCode

    const recipientRequiredFieldsResponse =
      recipientCountryCode == destinationAccountDto.countryCode
        ? destinationAccountRequiredFieldsResponse
        : (await this.tripleAService.listRequiredFields(recipientCountryCode))?.[recipientCountryCode]?.bank_account

    let recipientRequiredFieldsDto: IndividualFieldsDto | CompanyFieldsDto
    let recipientDto: CreateIndividualDto | CreateCompanyDto

    switch (recipientType) {
      case ERecipientType.INDIVIDUAL:
        if (createRecipientBankAccountDto.recipientType !== TripleARecipientType.INDIVIDUAL) {
          throw new BadRequestException('Invalid recipientType')
        }
        if (!recipientRequiredFieldsResponse || !recipientRequiredFieldsResponse.individual_recipient) {
          throw new BadRequestException(`Country not supported: ${recipientCountryCode}`)
        }
        recipientDto = createRecipientBankAccountDto.recipient as CreateIndividualDto
        recipientRequiredFieldsDto = RequiredFieldsDto.map(recipientRequiredFieldsResponse)
          .individual as IndividualFieldsDto
        break
      case ERecipientType.ORGANIZATION:
        if (createRecipientBankAccountDto.recipientType !== TripleARecipientType.COMPANY) {
          throw new BadRequestException('Invalid recipientType')
        }
        if (!recipientRequiredFieldsResponse || !recipientRequiredFieldsResponse.company_recipient) {
          throw new BadRequestException(`Country not supported: ${recipientCountryCode}`)
        }
        recipientDto = createRecipientBankAccountDto.recipient as CreateCompanyDto
        recipientRequiredFieldsDto = RequiredFieldsDto.map(recipientRequiredFieldsResponse).company as CompanyFieldsDto
        break
    }

    // Validate required fields
    for (const key of Object.keys(recipientRequiredFieldsDto)) {
      const element = recipientRequiredFieldsDto[key] as RequiredFieldDto

      if (element.required && !recipientDto[key]) {
        throw new BadRequestException(`Missing ${createRecipientBankAccountDto.recipientType} field: ${key}`)
      }

      if (element.options && !element.options.includes(recipientDto[key].toString())) {
        throw new BadRequestException(`Invalid ${createRecipientBankAccountDto.recipientType} field: ${key}`)
      }
    }
  }
}
