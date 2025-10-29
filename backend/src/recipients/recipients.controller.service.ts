import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { LoggerService } from '../shared/logger/logger.service'
import { CreateRecipientDto, RecipientAddressDto, RecipientContactDto, UpdateRecipientDto } from './interface'
import { Recipient } from '../shared/entity-services/contacts/recipient.entity'
import { DeepPartial } from 'typeorm'
import { RecipientAddress } from '../shared/entity-services/contacts/recipient-address.entity'
import { RecipientContact } from '../shared/entity-services/contacts/contacts/recipient-contact.entity'
import { RecipientCreatedEvent, RecipientDeletedEvent, RecipientEventType } from './events/event'
import { PostgresErrorCode } from '../shared/constants'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import {
  EntityTypeEnum,
  OrganizationAddressesService
} from '../shared/entity-services/contacts/organization-addresses.service'
import { RecipientsEntityService } from '../shared/entity-services/contacts/recipients.entity-service'
import { TokensEntityService } from '../shared/entity-services/tokens/tokens.entity-service'
import { ContactProvidersService } from '../shared/entity-services/contacts/contacts/contacts.entity-service'
import { RecipientContactsEntityService } from '../shared/entity-services/contacts/contacts/recipient-contact.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { ChartOfAccountRulesDomainService } from '../domain/chart-of-account-rules/chart-of-account-rules.domain.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RecipientBankAccountsEntityService } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-accounts.entity-service'
import {
  RecipientBankAccountDeletedEvent,
  RecipientBankAccountEventType
} from '../recipient-bank-accounts/events/event'

@Injectable()
export class RecipientsControllerService {
  constructor(
    private loggerService: LoggerService,
    private organizationsService: OrganizationsEntityService,
    private organizationAddressesService: OrganizationAddressesService,
    private recipientsService: RecipientsEntityService,
    private tokensService: TokensEntityService,
    private contactProvidersService: ContactProvidersService,
    private recipientContactsService: RecipientContactsEntityService,
    private recipientBankAccountsEntityService: RecipientBankAccountsEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private chartOfAccountRulesDomainService: ChartOfAccountRulesDomainService,
    private eventEmitter: EventEmitter2
  ) {}

  async create(createRecipientDto: CreateRecipientDto, organizationId: string) {
    const organization = await this.organizationsService.get(organizationId)

    if (!organization) {
      throw new BadRequestException('Organization not found')
    }

    await this.validateRecipientAddressesUniqueness(null, createRecipientDto.wallets, organization.id)
    this.validateRecipientContactsUniqueness(createRecipientDto.contacts)

    try {
      const recipientPartial = Recipient.create({
        organizationId: organization.id,
        organizationName: createRecipientDto.organizationName,
        organizationAddress: createRecipientDto.organizationAddress,
        contactName: createRecipientDto.contactName,
        type: createRecipientDto.type
      })

      const recipient = await this.recipientsService.create(recipientPartial)

      for (const recipientAddressDto of createRecipientDto.wallets) {
        const recipientAddress: DeepPartial<RecipientAddress> = await this.createRecipientAddress(
          recipientAddressDto,
          recipient.id
        )
        await this.recipientsService.saveRecipientAddress(recipientAddress)
      }

      for (const recipientContact of createRecipientDto.contacts) {
        const contact = RecipientContact.create({
          content: recipientContact.content,
          recipientId: recipient.id,
          contactProviderId: recipientContact.providerId
        })
        await this.recipientContactsService.create(contact)
      }

      await this.chartOfAccountMappingsEntityService.createByRecipientAndOrganization(recipient.id, organization.id)

      this.eventEmitter.emit(
        RecipientEventType.RECIPIENT_CREATED,
        new RecipientCreatedEvent(recipient.id, organization.id)
      )

      return await this.getFullRecipient(organizationId, recipient.id)
    } catch (error) {
      if (
        error?.code === PostgresErrorCode.UniqueViolation ||
        error?.data?.code === PostgresErrorCode.UniqueViolation
      ) {
        throw new BadRequestException('Contact name already exists')
      }
      this.loggerService.error('Failed to create recipient', error)
      throw new InternalServerErrorException()
    }
  }

  async update(params: { organizationId: string; id: string; updateRecipientDto: UpdateRecipientDto }) {
    const { organizationId, id, updateRecipientDto } = params

    const recipient = await this.getFullRecipient(organizationId, id)

    if (!recipient) {
      throw new NotFoundException('Can not find contact')
    }

    await this.validateRecipientAddressesUniqueness(recipient, updateRecipientDto.wallets, recipient.organization.id)
    this.validateRecipientContactsUniqueness(updateRecipientDto.contacts)

    try {
      await this.recipientsService.updateRecipient(params.id, {
        contactName: updateRecipientDto.contactName,
        organizationName: updateRecipientDto.organizationName,
        organizationAddress: updateRecipientDto.organizationAddress
      })

      for (const recipientAddressDto of updateRecipientDto.wallets) {
        // Recipient address wasn't changed
        const doesRecipientAddressExist = recipient.recipientAddresses.some((ra) =>
          this.isRecipientAddressUnique(recipientAddressDto, ra)
        )
        if (doesRecipientAddressExist) {
          continue
        }

        const recipientAddress: DeepPartial<RecipientAddress> = await this.createRecipientAddress(
          recipientAddressDto,
          recipient.id
        )
        await this.recipientsService.saveRecipientAddress(recipientAddress)
      }

      // find recipient addresses that doesn't exist in the updateRecipientDto.wallets and soft delete
      const recipientAddressesToDelete = recipient.recipientAddresses.filter((ra) => {
        return updateRecipientDto.wallets.every((a) => !this.isRecipientAddressUnique(a, ra))
      })

      for (const recipientAddress of recipientAddressesToDelete) {
        await this.recipientsService.softDeleteRecipientAddressById(recipientAddress.id)
      }

      for (const recipientContactDto of updateRecipientDto.contacts) {
        // Recipient contact wasn't changed
        const doesRecipientAddressExist = recipient.recipientContacts.some((rc) =>
          this.isContactAddressUnique(recipientContactDto, RecipientContactDto.map(rc))
        )
        if (doesRecipientAddressExist) {
          continue
        }

        const contact = RecipientContact.create({
          content: recipientContactDto.content,
          recipientId: recipient.id,
          contactProviderId: recipientContactDto.providerId
        })
        await this.recipientContactsService.create(contact)
      }

      // find recipient contact that doesn't exist in the updateRecipientDto.recipientContacts and soft delete
      const recipientContactsToDelete = recipient.recipientContacts.filter((rc) => {
        return updateRecipientDto.contacts.every((c) => !this.isContactAddressUnique(c, RecipientContactDto.map(rc)))
      })

      for (const recipientContact of recipientContactsToDelete) {
        await this.recipientsService.softDeleteRecipientContactById(recipientContact.id)
      }

      this.eventEmitter.emit(
        RecipientEventType.RECIPIENT_UPDATED,
        new RecipientCreatedEvent(recipient.id, recipient.organization.id)
      )

      // return updated recipient
      return await this.getFullRecipient(organizationId, id)
    } catch (error) {
      this.loggerService.error('Failed to update recipient', error)
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException()
      }
      if (error.status === HttpStatus.BAD_REQUEST) {
        throw new BadRequestException(error)
      }

      if (
        error?.code === PostgresErrorCode.UniqueViolation ||
        error?.data?.code === PostgresErrorCode.UniqueViolation
      ) {
        throw new BadRequestException('Contact name already exists')
      }

      throw new InternalServerErrorException()
    }
  }

  private async validateRecipientAddressesUniqueness(
    recipient: Recipient,
    wallets: RecipientAddressDto[],
    organizationId: string
  ) {
    // find duplicates in the wallets array by properties "address" and "blockchainId" and throw an error if found
    const duplicates = wallets.filter(
      (wallet, index) =>
        index !== wallets.findIndex((otherWallet) => this.isRecipientAddressUnique(wallet, otherWallet))
    )
    if (duplicates.length > 0) {
      throw new BadRequestException('Duplicate blockchain and address combination in the same recipient')
    }

    for (const wallet of wallets) {
      const validationResponse = await this.organizationAddressesService.getAddressLocation(
        wallet.address,
        wallet.blockchainId,
        organizationId
      )

      if (validationResponse?.isNewOrSame(recipient, EntityTypeEnum.CONTACTS)) {
        continue
      }

      if (!!validationResponse) {
        throw new BadRequestException(`This address exists in '${validationResponse.message}'.`)
      }
    }
  }

  private async createRecipientAddress(recipientAddressDto: RecipientAddressDto, recipientId: string) {
    let recipientAddress: DeepPartial<RecipientAddress>
    if (recipientAddressDto.cryptocurrencySymbol) {
      const cryptocurrency = await this.cryptocurrenciesService.getBySymbol(recipientAddressDto.cryptocurrencySymbol)
      if (!cryptocurrency) {
        throw new BadRequestException(
          `Cryptocurrency with symbol ${recipientAddressDto.cryptocurrencySymbol} not found`
        )
      }
      const token = await this.tokensService.getBySymbol(cryptocurrency.symbol)
      recipientAddress = RecipientAddress.create({
        address: recipientAddressDto.address,
        recipientId: recipientId,
        blockchainId: recipientAddressDto.blockchainId,
        tokenId: token?.id,
        cryptocurrencyId: cryptocurrency.id
      })
    } else {
      recipientAddress = RecipientAddress.create({
        address: recipientAddressDto.address,
        recipientId: recipientId,
        blockchainId: recipientAddressDto.blockchainId,
        tokenId: null,
        cryptocurrencyId: null
      })
    }
    return recipientAddress
  }

  private isRecipientAddressUnique(
    a: { address: string; blockchainId: string },
    b: { address: string; blockchainId: string }
  ) {
    return a.address.toLowerCase() === b.address.toLowerCase() && a.blockchainId === b.blockchainId
  }

  private isContactAddressUnique(a: RecipientContactDto, b: RecipientContactDto) {
    return a.providerId === b.providerId && a.content === b.content
  }

  private validateRecipientContactsUniqueness(contacts: RecipientContactDto[]) {
    const duplicates = contacts.filter(
      (contact, index) =>
        index !== contacts.findIndex((otherContact) => this.isContactAddressUnique(contact, otherContact))
    )
    if (duplicates.length > 0) {
      throw new BadRequestException('Duplicate contacts in the same recipient')
    }
  }

  async getByIdAndOrganization(id: string, organizationId: string) {
    const recipient = await this.getFullRecipient(organizationId, id)
    if (recipient) {
      return recipient
    }

    throw new NotFoundException()
  }

  private async getFullRecipient(organizationId: string, id: string) {
    return await this.recipientsService.getByOrganizationAndId(organizationId, id, {
      organization: true,
      recipientContacts: {
        contactProvider: true
      },
      recipientAddresses: {
        token: true,
        cryptocurrency: true
      }
    })
  }

  async delete(id: string, organizationId: string) {
    const recipient = await this.recipientsService.getByOrganizationAndId(organizationId, id, {
      recipientAddresses: true,
      recipientBankAccounts: true
    })
    if (recipient) {
      for (const recipientAddress of recipient.recipientAddresses) {
        await this.recipientsService.softDeleteRecipientAddressById(recipientAddress.id)
      }
      for (const recipientBankAccount of recipient.recipientBankAccounts) {
        await this.recipientBankAccountsEntityService.softDeleteById(recipientBankAccount.id)
        this.eventEmitter.emit(
          RecipientBankAccountEventType.RECIPIENT_BANK_ACCOUNT_DELETED,
          new RecipientBankAccountDeletedEvent(recipientBankAccount.id, organizationId)
        )
      }
      const chartOfAccountMappings = await this.chartOfAccountMappingsEntityService.getByRecipientAndOrganization(
        recipient.id,
        organizationId
      )
      for (const mapping of chartOfAccountMappings) {
        await this.chartOfAccountRulesDomainService.deleteChartOfAccountMappingById(mapping.id)
      }
      await this.recipientsService.softDelete(recipient.id)
      this.eventEmitter.emit(
        RecipientEventType.RECIPIENT_DELETED,
        new RecipientDeletedEvent(recipient.id, organizationId)
      )
    } else {
      throw new NotFoundException()
    }
  }
}
