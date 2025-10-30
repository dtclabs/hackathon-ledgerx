import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { groupBy } from 'lodash'
import { Readable } from 'stream'
import { Between, FindOptionsWhere, In, IsNull, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm'
import { PaginationResponse } from '../core/interfaces'
import { GnosisProviderService } from '../domain/block-explorers/gnosis/gnosis-provider.service'
import { FilesService } from '../files/files.service'
import { NULL_API_STRING } from '../shared/constants'
import { Annotation } from '../shared/entity-services/annotations/annotation.entity'
import { AnnotationsEntityService } from '../shared/entity-services/annotations/annotations.entity-service'
import { FinancialTransactionChildAnnotationEntityService } from '../shared/entity-services/annotations/resource-annotations/financial-transaction-child-annotations.entity-service'
import { ChartOfAccount } from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { RecipientsEntityService } from '../shared/entity-services/contacts/recipients.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionFile } from '../shared/entity-services/financial-transactions/financial-transaction-files.entity'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildPaymentMetadata
} from '../shared/entity-services/financial-transactions/interfaces'
import { MembersEntityService } from '../shared/entity-services/members/members.entity-service'
import { Organization } from '../shared/entity-services/organizations/organization.entity'
import {
  CurrencyType,
  DestinationMetadata,
  DestinationType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ProviderStatus
} from '../shared/entity-services/payments/interfaces'
import { Payment } from '../shared/entity-services/payments/payment.entity'
import { PaymentsEntityService } from '../shared/entity-services/payments/payments.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { InvalidStateError } from '../shared/errors/invalid-state.error'
import { ValidationError } from '../shared/errors/validation.error'
import { LoggerService } from '../shared/logger/logger.service'
import {
  CreatePaymentDto,
  PaymentDto,
  PaymentsQueryParams,
  RecipientDto,
  RecipientsQueryParams,
  SetExecutedPaymentDto,
  SetExecutingPaymentsDto,
  SetFailedPaymentsDto,
  UpdatePaymentDto
} from './interfaces'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import { FiatCurrency } from '../shared/entity-services/fiat-currencies/fiat-currency.entity'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { RecipientBankAccountsEntityService } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-accounts.entity-service'
import { TripleAService } from '../domain/integrations/triple-a/triple-a.service'
import { dateHelper } from '../shared/helpers/date.helper'
import { isBefore, subDays, subHours } from 'date-fns'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import {
  OrganizationIntegrationStatus,
  OrganizationIntegrationTripleAMetadata
} from '../shared/entity-services/organization-integrations/interfaces'
import { TripleATransferResponse, TripleATransferStatus } from '../domain/integrations/triple-a/interfaces'
import { RecipientAddressesEntityService } from '../shared/entity-services/contacts/recipient-addresses.entity-service'
import { Account } from '../shared/entity-services/account/account.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { TripleATransfersEntityService } from '../shared/entity-services/triple-a-transfers/triple-a-transfers.entity-service'
import { PaymentEventType, PaymentExecutedEvent } from '../domain/financial-transformations/events/events'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Recipient } from '../shared/entity-services/contacts/recipient.entity'
import { ERecipientType } from '../recipients/interface'
import { BlockExplorerAdapterFactory } from '../domain/block-explorers/block-explorer.adapter.factory'

@Injectable()
export class PaymentsDomainService {
  constructor(
    private readonly paymentsEntityService: PaymentsEntityService,
    private readonly cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private readonly fiatCurrenciesEntityService: FiatCurrenciesEntityService,
    private readonly walletsEntityService: WalletsEntityService,
    private readonly membersEntityService: MembersEntityService,
    private readonly recipientsEntityService: RecipientsEntityService,
    private readonly recipientAddressesEntityService: RecipientAddressesEntityService,
    private readonly recipientBankAccountsEntityService: RecipientBankAccountsEntityService,
    private readonly filesService: FilesService,
    private readonly gnosisProviderService: GnosisProviderService,
    private readonly chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private readonly annotationsEntityService: AnnotationsEntityService,
    private readonly financialTransactionChildAnnotationEntityService: FinancialTransactionChildAnnotationEntityService,
    private readonly financialTransactionsEntityService: FinancialTransactionsEntityService,
    private readonly tripleAService: TripleAService,
    private readonly tripleATransfersEntityService: TripleATransfersEntityService,
    private readonly organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly loggerService: LoggerService,
    private readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory
  ) {}

  async paymentDtosMapper(payments: Payment[], organizationId: string): Promise<PaymentDto[]> {
    const chartOfAccounts = await this.chartOfAccountsEntityService.getByOrganizationIdAndPublicIds(
      organizationId,
      payments.map((payment) => payment.chartOfAccountId)
    )

    const annotationPublicIds: string[] = payments
      .flatMap((p) => p.annotationPublicIds)
      .filter((id) => id !== null && id !== undefined)
    let annotations: Annotation[] = []

    if (annotationPublicIds?.length) {
      annotations = await this.annotationsEntityService.getByPublicIdsAndOrganizationId({
        publicIds: annotationPublicIds,
        organizationId
      })
    }

    const members = await this.membersEntityService.findByAccountIds(
      payments.map((payment) => payment.reviewer?.id),
      organizationId,
      true
    )

    const cryptocurrencyIds = payments
      .filter((payment) => payment.destinationCurrencyType === CurrencyType.CRYPTO)
      .map((payment) => payment.destinationCurrencyId)
    const fiatCurrencyIds = payments
      .filter((payment) => payment.destinationCurrencyType === CurrencyType.FIAT)
      .map((payment) => payment.destinationCurrencyId)

    const cryptocurrencies = await this.cryptocurrenciesEntityService.getAllByIds(cryptocurrencyIds)
    const fiatCurrencies = await this.fiatCurrenciesEntityService.getByIds(fiatCurrencyIds)

    return payments.map((payment) => {
      const orderedAnnotations: Annotation[] = []

      for (const annotationPublicId of payment.annotationPublicIds ?? []) {
        const annotation = annotations.find((annotation) => annotation.publicId === annotationPublicId)
        if (annotation) {
          orderedAnnotations.push(annotation)
        }
      }

      let destinationCurrency: Cryptocurrency | FiatCurrency

      switch (payment.destinationCurrencyType) {
        case CurrencyType.CRYPTO:
          destinationCurrency = cryptocurrencies.find(
            (cryptocurrency) => cryptocurrency.id === payment.destinationCurrencyId
          )
          break
        case CurrencyType.FIAT:
          destinationCurrency = fiatCurrencies.find((fiatCurrency) => fiatCurrency.id === payment.destinationCurrencyId)
          break
      }

      return PaymentDto.map(
        payment,
        chartOfAccounts.find((chartOfAccount) => chartOfAccount.publicId === payment.chartOfAccountId),
        orderedAnnotations,
        members.find((member) => member.account.id === payment.reviewer?.id),
        destinationCurrency
      )
    })
  }

  async getAllPaging(organizationId: string, query: PaymentsQueryParams) {
    const whereConditions: FindOptionsWhere<Payment> = {
      organization: { id: organizationId }
    }

    if (query.startDate && query.endDate) whereConditions.createdAt = Between(query.startDate, query.endDate)
    else if (query.startDate) whereConditions.createdAt = MoreThanOrEqual(query.startDate)
    else if (query.endDate) whereConditions.createdAt = LessThanOrEqual(query.endDate)
    if (query.statuses) whereConditions.status = In(query.statuses)
    if (query.providerStatuses) whereConditions.providerStatus = In(query.providerStatuses)
    if (query.destinationAddresses) whereConditions.destinationAddress = In(query.destinationAddresses)
    if (query.cryptocurrencies) whereConditions.sourceCryptocurrency = { symbol: In(query.cryptocurrencies) }
    else if (query.sourceCryptocurrencies) {
      whereConditions.sourceCryptocurrency = { symbol: In(query.sourceCryptocurrencies) }
    }
    if (query.destinationCurrencyType) {
      whereConditions.destinationCurrencyType = query.destinationCurrencyType
      if (query.destinationCurrencies) {
        switch (query.destinationCurrencyType) {
          case CurrencyType.FIAT:
            const destinationFiatCurrencies = await this.fiatCurrenciesEntityService.getByAlphabeticCodes(
              query.destinationCurrencies
            )
            whereConditions.destinationCurrencyId = In(destinationFiatCurrencies.map((currency) => currency.id))
          case CurrencyType.CRYPTO:
            const destinationCryptocurrencies = await this.cryptocurrenciesEntityService.getBySymbols(
              query.destinationCurrencies
            )
            whereConditions.destinationCurrencyId = In(destinationCryptocurrencies.map((currency) => currency.id))
        }
      }
    }
    if (query.chartOfAccountIds) whereConditions.chartOfAccountId = In(query.chartOfAccountIds)
    if (query.annotationIds) whereConditions.annotationPublicIds = In(query.annotationIds)
    if (query.reviewerIds) {
      const members = await this.membersEntityService.findByPublicIds(
        query.reviewerIds.filter((reviewerId) => reviewerId !== NULL_API_STRING),
        organizationId,
        ['account']
      )

      if (query.reviewerIds.includes(NULL_API_STRING)) {
        if (members.length > 0) {
          whereConditions.reviewerId = Raw((alias) => `(${alias} IS NULL OR ${alias} IN (:...reviewerIds))`, {
            reviewerIds: members.map((member) => member.account.id)
          })
        } else {
          whereConditions.reviewerId = IsNull()
        }
      } else {
        whereConditions.reviewer = { id: In(members.map((member) => member.account.id)) }
      }
    }

    const response = await this.paymentsEntityService.getAllPaging(
      query,
      ['destinationName', 'destinationAddress'],
      whereConditions as any,
      [
        'sourceWallet',
        'sourceCryptocurrency',
        'reviewer',
        'createdBy',
        'updatedBy',
        'reviewRequestedBy',
        'reviewedBy',
        'executedBy'
      ]
    )

    const paymentDtos = await this.paymentDtosMapper(response.items, organizationId)

    return PaginationResponse.from({
      items: paymentDtos,
      limit: response.limit,
      totalItems: response.totalItems,
      currentPage: response.currentPage
    })
  }

  async getPayment(paymentPublicId: string, organizationId: string) {
    const payment = await this.paymentsEntityService.findOneByPublicId(paymentPublicId, organizationId, {
      sourceCryptocurrency: true,
      reviewer: true,
      createdBy: true,
      updatedBy: true,
      reviewRequestedBy: true,
      reviewedBy: true,
      executedBy: true
    })

    switch (payment.provider) {
      case PaymentProvider.TRIPLE_A:
        await this.syncTripleATransfer(payment)
        break
      case PaymentProvider.GNOSIS_SAFE:
        await this.syncSafeTransfer(payment)
        break
    }

    return (await this.paymentDtosMapper([payment], organizationId))?.at(0)
  }

  async getRecipients(organizationId: string, recipientsQueryParams: RecipientsQueryParams): Promise<RecipientDto[]> {
    const recipients = await this.paymentsEntityService.getRecipients(organizationId, {
      destinationCurrencyType: recipientsQueryParams.destinationCurrencyType
    })
    return recipients.map((recipient) => RecipientDto.map(recipient))
  }

  async getQuote(paymentPublicId: string, organizationId: string, accountId: string) {
    let payment = await this.paymentsEntityService.findOneByPublicId(paymentPublicId, organizationId, {
      sourceCryptocurrency: true
    })

    const mutableStatuses = [
      PaymentStatus.CREATED,
      PaymentStatus.PREVIEW,
      PaymentStatus.PENDING,
      PaymentStatus.APPROVED,
      PaymentStatus.FAILED
    ]

    if (!mutableStatuses.includes(payment.status)) {
      throw new BadRequestException(`Cannot get quote for ${payment.status} payment`)
    }

    if (!payment.sourceCryptocurrency) {
      throw new BadRequestException('Missing sourceCryptocurrency')
    }

    if (payment.destinationCurrencyType !== CurrencyType.FIAT || !payment.destinationCurrencyId) {
      throw new BadRequestException('Invalid destinationCurrency')
    }

    if (!payment.destinationAmount) {
      throw new BadRequestException('Missing destinationAmount')
    }

    if (payment.destinationMetadata?.type !== DestinationType.RECIPIENT_BANK_ACCOUNT) {
      throw new BadRequestException('Invalid destination')
    }

    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: IntegrationName.TRIPLE_A,
        organizationId: organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED]
      })

    if (!organizationIntegration) {
      throw new BadRequestException('Triple A integration not found')
    }

    const destinationCurrency = await this.fiatCurrenciesEntityService.get(payment.destinationCurrencyId)
    const recipientBankAccount = await this.recipientBankAccountsEntityService.findOneByPublicId(
      payment.destinationMetadata.id,
      organizationId
    )
    if (recipientBankAccount.fiatCurrency.id !== destinationCurrency.id) {
      throw new BadRequestException('Currency mismatch between payment and recipientBankAccount')
    }
    const destinationAccount = await this.tripleAService.getDestinationAccount(recipientBankAccount.tripleAId)
    const quote = await this.tripleAService.createQuote({
      destinationCountry: destinationAccount.country_code,
      sendingCurrency: payment.sourceCryptocurrency.symbol,
      receivingCurrency: destinationCurrency.alphabeticCode,
      receivingAmount: new Decimal(payment.destinationAmount).toNumber()
    })

    try {
      const tripleAMetadata = organizationIntegration.metadata as OrganizationIntegrationTripleAMetadata

      // Triple A wallet address is manually added to database
      // See https://app.clickup.com/25661070/v/dc/rf3me-30498/rf3me-42338
      payment = await this.paymentsEntityService.updateQuote(
        payment.id,
        tripleAMetadata.wallet.address,
        quote,
        accountId
      )

      return (await this.paymentDtosMapper([payment], organizationId))?.at(0)
    } catch (e) {
      this.handleError(e)
    }
  }

  async createPayments(
    organizationId: string,
    accountId: string,
    createPaymentDtos: CreatePaymentDto[]
  ): Promise<PaymentDto[]> {
    if (createPaymentDtos.some((createPaymentDto) => createPaymentDto.destinationCurrencyType === CurrencyType.FIAT)) {
      const organizationIntegration =
        await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
          integrationName: IntegrationName.TRIPLE_A,
          organizationId: organizationId,
          statuses: [OrganizationIntegrationStatus.COMPLETED]
        })

      if (!organizationIntegration) {
        throw new BadRequestException('Triple A integration not found')
      }
    }

    let cryptocurrencyPublicIds = createPaymentDtos
      .filter((createPaymentDto) => createPaymentDto.sourceCryptocurrencyId)
      .map((createPaymentDto) => createPaymentDto.sourceCryptocurrencyId)
    cryptocurrencyPublicIds = cryptocurrencyPublicIds.concat(
      createPaymentDtos
        .filter(
          (createPaymentDto) =>
            createPaymentDto.destinationCurrencyType === CurrencyType.CRYPTO && createPaymentDto.destinationCurrencyId
        )
        .map((createPaymentDto) => createPaymentDto.destinationCurrencyId)
    )
    const fiatCurrencyPublicIds = createPaymentDtos
      .filter((createPaymentDto) => createPaymentDto.destinationCurrencyType === CurrencyType.FIAT)
      .map((createPaymentDto) => createPaymentDto.destinationCurrencyId)
    const cryptocurrencies = await this.cryptocurrenciesEntityService.getAllByPublicIds(cryptocurrencyPublicIds)
    const fiatCurrencies = await this.fiatCurrenciesEntityService.getByAlphabeticCodes(fiatCurrencyPublicIds)
    const sourceWallets = await this.walletsEntityService.getByOrganizationAndPublicIds(
      organizationId,
      createPaymentDtos
        .filter((createPaymentDto) => createPaymentDto.sourceWalletId)
        .map((createPaymentDto) => createPaymentDto.sourceWalletId)
    )
    const destinationWalletPublicIds = createPaymentDtos
      .filter((createPaymentDto) => createPaymentDto.destinationMetadata?.type === DestinationType.WALLET)
      .map((createPaymentDto) => createPaymentDto.destinationMetadata.id)
    const destinationAddressPublicIds = createPaymentDtos
      .filter((createPaymentDto) => createPaymentDto.destinationMetadata?.type === DestinationType.RECIPIENT_ADDRESS)
      .map((createPaymentDto) => createPaymentDto.destinationMetadata.id)
    const destinationBankAccountPublicIds = createPaymentDtos
      .filter(
        (createPaymentDto) => createPaymentDto.destinationMetadata?.type === DestinationType.RECIPIENT_BANK_ACCOUNT
      )
      .map((createPaymentDto) => createPaymentDto.destinationMetadata.id)
    const destinationWallets = await this.walletsEntityService.getByOrganizationAndPublicIds(
      organizationId,
      destinationWalletPublicIds
    )
    const destinationAddresses = await this.recipientAddressesEntityService.findByPublicIds(
      destinationAddressPublicIds,
      organizationId
    )
    const destinationBankAccounts = await this.recipientBankAccountsEntityService.findByPublicIds(
      destinationBankAccountPublicIds,
      organizationId
    )
    const members = await this.membersEntityService.findByPublicIds(
      createPaymentDtos.map((createPaymentDto) => createPaymentDto.reviewerId),
      organizationId,
      ['account']
    )

    const params = []

    for (const createPaymentDto of createPaymentDtos) {
      let sourceCryptocurrency: Cryptocurrency
      let destinationCurrency: Cryptocurrency | FiatCurrency
      let sourceWallet: Wallet
      let destinationMetadata: DestinationMetadata
      let reviewer: Account

      if (createPaymentDto.sourceCryptocurrencyId) {
        const cryptocurrency = cryptocurrencies.find(
          (cryptocurrency) => cryptocurrency.publicId === createPaymentDto.sourceCryptocurrencyId
        )
        if (!cryptocurrency) {
          throw new BadRequestException(`Invalid sourceCryptocurrency ${createPaymentDto.sourceCryptocurrencyId}`)
        }
        sourceCryptocurrency = cryptocurrency
      }

      if (createPaymentDto.destinationCurrencyId) {
        switch (createPaymentDto.destinationCurrencyType) {
          case CurrencyType.CRYPTO:
            const cryptocurrency = cryptocurrencies.find(
              (cryptocurrency) => cryptocurrency.publicId === createPaymentDto.destinationCurrencyId
            )
            if (!cryptocurrency) {
              throw new BadRequestException(`Invalid destinationCurrency ${createPaymentDto.destinationCurrencyId}`)
            }
            destinationCurrency = cryptocurrency
            break
          case CurrencyType.FIAT:
            const fiatCurrency = fiatCurrencies.find(
              (fiatCurrency) => fiatCurrency.alphabeticCode === createPaymentDto.destinationCurrencyId
            )
            if (!fiatCurrency) {
              throw new BadRequestException(`Invalid destinationCurrency ${createPaymentDto.destinationCurrencyId}`)
            }
            destinationCurrency = fiatCurrency
            break
        }
      }

      if (createPaymentDto.destinationMetadata) {
        switch (createPaymentDto.destinationMetadata.type) {
          case DestinationType.WALLET:
            const wallet = destinationWallets.find(
              (destinationWallet) => destinationWallet.publicId === createPaymentDto.destinationMetadata.id
            )
            if (!wallet) {
              throw new BadRequestException(`Invalid destinationMetadata`)
            }
            destinationMetadata = {
              id: createPaymentDto.destinationMetadata.id,
              type: createPaymentDto.destinationMetadata.type
            }
            break
          case DestinationType.RECIPIENT_ADDRESS:
            const recipientAddress = destinationAddresses.find(
              (recipientAddress) => recipientAddress.publicId === createPaymentDto.destinationMetadata.id
            )
            if (!recipientAddress) {
              throw new BadRequestException(`Invalid destinationMetadata`)
            }
            destinationMetadata = {
              id: createPaymentDto.destinationMetadata.id,
              type: createPaymentDto.destinationMetadata.type
            }
            break
          case DestinationType.RECIPIENT_BANK_ACCOUNT:
            const recipientBankAccount = destinationBankAccounts.find(
              (recipientBankAccount) => recipientBankAccount.publicId === createPaymentDto.destinationMetadata.id
            )
            if (!recipientBankAccount) {
              throw new BadRequestException(`Invalid destinationMetadata`)
            }
            destinationMetadata = {
              id: createPaymentDto.destinationMetadata.id,
              type: createPaymentDto.destinationMetadata.type,
              bankName: recipientBankAccount.bankName,
              accountNumberLast4: recipientBankAccount.accountNumberLast4
            }
            break
          default:
            throw new BadRequestException(`Invalid destinationMetadata`)
        }
      }

      if (createPaymentDto.sourceWalletId) {
        sourceWallet = sourceWallets.find((sourceWallet) => sourceWallet.publicId === createPaymentDto.sourceWalletId)
        if (!sourceWallet) {
          throw new BadRequestException(`Invalid source wallet ${createPaymentDto.sourceWalletId}`)
        }
      }

      if (createPaymentDto.reviewerId) {
        reviewer = members.find((reviewer) => reviewer.publicId === createPaymentDto.reviewerId)?.account
      }

      params.push({
        sourceCryptocurrencyId: createPaymentDto.sourceCryptocurrencyId
          ? sourceCryptocurrency.id
          : createPaymentDto.sourceCryptocurrencyId,
        destinationCurrencyType: createPaymentDto.destinationCurrencyType,
        destinationCurrencyId: createPaymentDto.destinationCurrencyId
          ? destinationCurrency.id
          : createPaymentDto.destinationCurrencyId,
        sourceWalletId: createPaymentDto.sourceWalletId ? sourceWallet.id : createPaymentDto.sourceWalletId,
        blockchainId: createPaymentDto.blockchainId,
        type: createPaymentDto.paymentType,
        destinationAddress: createPaymentDto.destinationAddress,
        status: createPaymentDto.status,
        destinationName: createPaymentDto.destinationName,
        destinationMetadata: createPaymentDto.destinationMetadata
          ? destinationMetadata
          : createPaymentDto.destinationMetadata,
        sourceAmount: createPaymentDto.sourceAmount,
        destinationAmount: createPaymentDto.destinationAmount,
        files: createPaymentDto.files?.length ? createPaymentDto.files : [],
        chartOfAccountId: createPaymentDto.chartOfAccountId,
        annotationPublicIds: createPaymentDto.annotationIds,
        metadata: createPaymentDto.metadata,
        remarks: createPaymentDto.remarks,
        notes: createPaymentDto.notes,
        reviewerId: createPaymentDto.reviewerId ? reviewer?.id : createPaymentDto.reviewerId
      })
    }

    try {
      const payments = await this.paymentsEntityService.createPayments(organizationId, params, accountId)
      return await this.paymentDtosMapper(payments, organizationId)
    } catch (e) {
      this.handleError(e)
    }
  }

  async updatePayment(
    paymentPublicId: string,
    organizationId: string,
    accountId: string,
    updatePaymentDto: UpdatePaymentDto
  ): Promise<PaymentDto> {
    let payment = await this.paymentsEntityService.findOneByPublicId(paymentPublicId, organizationId)
    let sourceCryptocurrency: Cryptocurrency
    let destinationCurrency: Cryptocurrency | FiatCurrency
    let destinationMetadata: DestinationMetadata
    let reviewer: Account

    if (updatePaymentDto.sourceCryptocurrencyId) {
      sourceCryptocurrency = await this.cryptocurrenciesEntityService.getByPublicId(
        updatePaymentDto.sourceCryptocurrencyId
      )
      if (!sourceCryptocurrency) {
        throw new BadRequestException(`Invalid sourceCryptocurrency ${updatePaymentDto.sourceCryptocurrencyId}`)
      }
    }

    if (updatePaymentDto.destinationCurrencyId) {
      switch (payment.destinationCurrencyType) {
        case CurrencyType.CRYPTO:
          const cryptocurrency = await this.cryptocurrenciesEntityService.getByPublicId(
            updatePaymentDto.destinationCurrencyId
          )
          if (!cryptocurrency) {
            throw new BadRequestException(`Invalid destinationCurrency ${updatePaymentDto.destinationCurrencyId}`)
          }
          destinationCurrency = cryptocurrency
          break
        case CurrencyType.FIAT:
          const fiatCurrency = await this.fiatCurrenciesEntityService.getByAlphabeticCode(
            updatePaymentDto.destinationCurrencyId
          )
          if (!fiatCurrency) {
            throw new BadRequestException(`Invalid destinationCurrency ${updatePaymentDto.destinationCurrencyId}`)
          }
          destinationCurrency = fiatCurrency
          break
      }
    }

    if (updatePaymentDto.destinationMetadata) {
      switch (updatePaymentDto.destinationMetadata.type) {
        case DestinationType.WALLET:
          const wallet = await this.walletsEntityService.getByOrganizationAndPublicId(
            organizationId,
            updatePaymentDto.destinationMetadata.id
          )
          if (!wallet) {
            throw new BadRequestException(`Invalid destinationMetadata`)
          }
          destinationMetadata = {
            id: updatePaymentDto.destinationMetadata.id,
            type: updatePaymentDto.destinationMetadata.type
          }
          break
        case DestinationType.RECIPIENT_ADDRESS:
          const recipientAddress = await this.recipientAddressesEntityService.findOneByPublicId(
            updatePaymentDto.destinationMetadata.id,
            organizationId
          )
          if (!recipientAddress) {
            throw new BadRequestException(`Invalid destinationMetadata`)
          }
          destinationMetadata = {
            id: updatePaymentDto.destinationMetadata.id,
            type: updatePaymentDto.destinationMetadata.type
          }
          break
        case DestinationType.RECIPIENT_BANK_ACCOUNT:
          const recipientBankAccount = await this.recipientBankAccountsEntityService.findOneByPublicId(
            updatePaymentDto.destinationMetadata.id,
            organizationId
          )
          if (!recipientBankAccount) {
            throw new BadRequestException(`Invalid destinationMetadata`)
          }
          destinationMetadata = {
            id: updatePaymentDto.destinationMetadata.id,
            type: updatePaymentDto.destinationMetadata.type,
            bankName: recipientBankAccount.bankName,
            accountNumberLast4: recipientBankAccount.accountNumberLast4
          }
          break
        default:
          throw new BadRequestException(`Invalid destinationMetadata`)
      }
    }

    if (updatePaymentDto.reviewerId) {
      const member = (
        await this.membersEntityService.findByPublicIds([updatePaymentDto.reviewerId], organizationId, ['account'])
      )?.[0]
      reviewer = member?.account
    }

    const params = {
      destinationAddress: updatePaymentDto.destinationAddress,
      destinationName: updatePaymentDto.destinationName,
      destinationMetadata: updatePaymentDto.destinationMetadata
        ? destinationMetadata
        : updatePaymentDto.destinationMetadata,
      destinationCurrencyId: updatePaymentDto.destinationCurrencyId
        ? destinationCurrency.id
        : updatePaymentDto.destinationCurrencyId,
      sourceCryptocurrencyId: updatePaymentDto.sourceCryptocurrencyId
        ? sourceCryptocurrency.id
        : updatePaymentDto.sourceCryptocurrencyId,
      sourceAmount: updatePaymentDto.sourceAmount,
      destinationAmount: updatePaymentDto.destinationAmount,
      files: updatePaymentDto.files,
      chartOfAccountId: updatePaymentDto.chartOfAccountId,
      annotationPublicIds: updatePaymentDto.annotationIds,
      metadata: updatePaymentDto.metadata,
      notes: updatePaymentDto.notes,
      reviewerId: updatePaymentDto.reviewerId ? reviewer?.id : updatePaymentDto.reviewerId
    }

    try {
      payment = await this.paymentsEntityService.updatePayment(payment.id, organizationId, params, accountId)
      return (await this.paymentDtosMapper([payment], organizationId))?.at(0)
    } catch (e) {
      this.handleError(e)
    }
  }

  async setAsCreated(paymentId: string, organizationId: string, accountId: string): Promise<PaymentDto> {
    try {
      const payment = await this.paymentsEntityService.setAsCreated(paymentId, organizationId, accountId)
      return (await this.paymentDtosMapper([payment], organizationId))?.at(0)
    } catch (e) {
      this.handleError(e)
    }
  }

  async setAsPending(paymentId: string, organizationId: string, accountId: string): Promise<PaymentDto> {
    try {
      const payment = await this.paymentsEntityService.setAsPending(paymentId, organizationId, accountId)
      return (await this.paymentDtosMapper([payment], organizationId))?.at(0)
    } catch (e) {
      this.handleError(e)
    }
  }

  async setAsApproved(paymentId: string, organizationId: string, accountId: string): Promise<PaymentDto> {
    try {
      const payment = await this.paymentsEntityService.setAsApproved(paymentId, organizationId, { id: accountId })
      return (await this.paymentDtosMapper([payment], organizationId))?.at(0)
    } catch (e) {
      this.handleError(e)
    }
  }

  async setAsExecuting(
    setExecutingPaymentsDto: SetExecutingPaymentsDto,
    organizationId: string,
    accountId: string
  ): Promise<PaymentDto[]> {
    const sourceWallet = await this.walletsEntityService.getByOrganizationAndPublicId(
      organizationId,
      setExecutingPaymentsDto.sourceWalletId
    )

    if (!sourceWallet) {
      throw new BadRequestException(`Invalid source wallet ${setExecutingPaymentsDto.sourceWalletId}`)
    }

    try {
      await this.createTripleATransfers(setExecutingPaymentsDto, organizationId)

      const payments = await this.paymentsEntityService.setAsExecuting(
        setExecutingPaymentsDto.ids,
        organizationId,
        {
          blockchainId: setExecutingPaymentsDto.blockchainId,
          sourceWalletId: sourceWallet.id,
          paymentType: setExecutingPaymentsDto.paymentType,
          remarks: setExecutingPaymentsDto.remarks,
          proposedTransactionHash: setExecutingPaymentsDto.proposedTransactionHash
        },
        accountId
      )

      return await this.paymentDtosMapper(payments, organizationId)
    } catch (e) {
      this.handleError(e)
    }
  }

  async setAsExecuted(setExecutedPaymentDtos: SetExecutedPaymentDto[], organizationId: string): Promise<PaymentDto[]> {
    try {
      const payments = await this.paymentsEntityService.setAsExecuted(setExecutedPaymentDtos, organizationId)
      for (const payment of payments) {
        this.eventEmitter.emit(PaymentEventType.PAYMENT_EXECUTED, new PaymentExecutedEvent(payment.id))
      }
      return await this.paymentDtosMapper(payments, organizationId)
    } catch (e) {
      this.handleError(e)
    }
  }

  async setAsFailed(setFailedPaymentsDto: SetFailedPaymentsDto, organizationId: string): Promise<PaymentDto[]> {
    try {
      const payments = await this.paymentsEntityService.setAsFailed(setFailedPaymentsDto.ids, organizationId)
      return await this.paymentDtosMapper(payments, organizationId)
    } catch (e) {
      this.handleError(e)
    }
  }

  async deletePayment(paymentId: string, organizationId: string) {
    const payment = await this.paymentsEntityService.findOneByPublicId(paymentId, organizationId)

    if (payment) {
      return await this.paymentsEntityService.softDelete(payment.id)
    } else {
      throw new NotFoundException()
    }
  }

  async getFile(
    publicOrganizationId: string,
    publicPaymentId: string,
    filename: string
  ): Promise<{ filename: string; mimeType: string; fileStream: Readable }> {
    return await this.filesService.getPaymentObject({
      publicOrganizationId: publicOrganizationId,
      publicPaymentId: publicPaymentId,
      filename: filename
    })
  }

  async syncDestinationMetadataByWallet(walletId: string) {
    const wallet = await this.walletsEntityService.get(walletId, {
      relations: { organization: true },
      withDeleted: true
    })

    if (wallet.deletedAt) {
      // Only set payments that can be executed later to be invalid
      const payments = await this.paymentsEntityService.findByDestination(
        {
          metadata: {
            id: wallet.publicId,
            type: DestinationType.WALLET
          }
        },
        wallet.organization.id,
        [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.FAILED]
      )

      for (const payment of payments) {
        await this.paymentsEntityService.setAsInvalid(payment.id)
      }
    } else {
      // Without reference
      let payments = await this.paymentsEntityService.findByDestination(
        {
          address: wallet.address,
          metadata: null
        },
        wallet.organization.id
      )

      for (const payment of payments) {
        await this.paymentsEntityService.updateDestination(payment.id, wallet.name, {
          id: wallet.publicId,
          type: DestinationType.WALLET
        })
      }

      // With reference
      payments = await this.paymentsEntityService.findByDestination(
        {
          metadata: {
            id: wallet.publicId,
            type: DestinationType.WALLET
          }
        },
        wallet.organization.id
      )

      for (const payment of payments) {
        if (payment.destinationName !== wallet.name) {
          await this.paymentsEntityService.updateDestination(payment.id, wallet.name)
        }

        if (payment.destinationAddress !== wallet.address) {
          await this.paymentsEntityService.setAsInvalid(payment.id)
        }
      }
    }
  }

  async syncDestinationMetadataByRecipient(recipientId: string) {
    const recipient = await this.recipientsEntityService.get(recipientId, {
      relations: { organization: true, recipientAddresses: true, recipientBankAccounts: true },
      withDeleted: true
    })

    for (const recipientAddress of recipient.recipientAddresses) {
      if (recipientAddress.deletedAt) {
        // Only set payments that can be executed later to be invalid
        const payments = await this.paymentsEntityService.findByDestination(
          {
            metadata: {
              id: recipientAddress.publicId,
              type: DestinationType.RECIPIENT_ADDRESS
            }
          },
          recipient.organization.id,
          [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.FAILED]
        )

        for (const payment of payments) {
          await this.paymentsEntityService.setAsInvalid(payment.id)
        }
      } else {
        // Without reference
        let payments = await this.paymentsEntityService.findByDestination(
          {
            address: recipientAddress.address,
            metadata: null
          },
          recipient.organization.id
        )

        for (const payment of payments) {
          await this.paymentsEntityService.updateDestination(payment.id, this.getRecipientName(recipient), {
            id: recipientAddress.publicId,
            type: DestinationType.RECIPIENT_ADDRESS
          })
        }

        // With reference
        payments = await this.paymentsEntityService.findByDestination(
          {
            metadata: {
              id: recipientAddress.publicId,
              type: DestinationType.RECIPIENT_ADDRESS
            }
          },
          recipient.organization.id
        )

        for (const payment of payments) {
          if (payment.destinationName !== this.getRecipientName(recipient)) {
            await this.paymentsEntityService.updateDestination(payment.id, this.getRecipientName(recipient))
          }

          // Recipient addresses are not casted to lower case when saving to database
          if (payment.destinationAddress !== recipientAddress.address.toLowerCase()) {
            await this.paymentsEntityService.setAsInvalid(payment.id)
          }
        }
      }
    }

    for (const recipientBankAccount of recipient.recipientBankAccounts) {
      // With reference
      const payments = await this.paymentsEntityService.findByDestination(
        {
          metadata: {
            id: recipientBankAccount.publicId,
            type: DestinationType.RECIPIENT_BANK_ACCOUNT
          }
        },
        recipient.organization.id
      )

      // Update destinationName
      for (const payment of payments) {
        if (payment.destinationName !== this.getRecipientName(recipient)) {
          await this.paymentsEntityService.updateDestination(payment.id, this.getRecipientName(recipient))
        }
      }
    }
  }

  async syncDestinationMetadataByRecipientBankAccount(recipientBankAccountId: string) {
    const recipientBankAccount = await this.recipientBankAccountsEntityService.get(recipientBankAccountId, {
      relations: { recipient: { organization: true } },
      withDeleted: true
    })

    if (recipientBankAccount.deletedAt) {
      // Only set payments that can be executed later to be invalid
      const payments = await this.paymentsEntityService.findByDestination(
        {
          metadata: {
            id: recipientBankAccount.publicId,
            type: DestinationType.RECIPIENT_BANK_ACCOUNT
          }
        },
        recipientBankAccount.recipient.organization.id,
        [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.FAILED]
      )

      for (const payment of payments) {
        await this.paymentsEntityService.setAsInvalid(payment.id)
      }
    }
  }

  async confirmTripleATransfer(paymentId: string) {
    const payment = await this.paymentsEntityService.get(paymentId, { relations: { organization: true } })

    if (payment.provider !== PaymentProvider.TRIPLE_A) return
    if (payment.providerStatus !== ProviderStatus.CREATED) return
    if (![PaymentStatus.EXECUTED, PaymentStatus.SYNCED].includes(payment.status)) return

    // Get confirmed or latest created transfer
    const tripleATransfer = await this.tripleATransfersEntityService.findEffectiveTransfer(
      payment.id,
      payment.metadata.quote?.id
    )

    if (tripleATransfer) {
      switch (tripleATransfer.status) {
        case TripleATransferStatus.CREATED:
          if (!tripleATransfer.isRetryable()) return

          try {
            // Confirm transfer
            const transfer = await this.tripleAService.confirmTransfer(tripleATransfer.transferId)

            // Update transfer
            await this.tripleATransfersEntityService.updateTripleATransfer(transfer)

            await this.paymentsEntityService.updateProviderStatus(payment.id, ProviderStatus.PENDING)
          } catch (e) {
            this.loggerService.error(`Failed to confirm Triple A Transfer for payment ${payment.id}`, e, {
              organizationId: payment.organization?.id,
              transferId: tripleATransfer.transferId
            })

            // Save error
            await this.tripleATransfersEntityService.saveError(tripleATransfer.id, {
              response: e.response?.data,
              retryCount: tripleATransfer.error?.retryCount ? tripleATransfer.error.retryCount + 1 : 0
            })

            throw e
          }
          break
        case TripleATransferStatus.COMPLETED:
          await this.paymentsEntityService.updateProviderStatus(payment.id, ProviderStatus.COMPLETED)
          break
        case TripleATransferStatus.CANCELLED:
        case TripleATransferStatus.DECLINED:
        case TripleATransferStatus.REJECTED:
        case TripleATransferStatus.REVERSED:
          // NOTE: Temporary solution due to Triple A unable to support immediate top up,
          //       set to failed only after ops confirmed that transfer will not processed
          await this.paymentsEntityService.updateProviderStatus(payment.id, ProviderStatus.PENDING)
          this.loggerService.error(`Triple A Transfer failed for payment ${payment.id}`, {
            organizationId: payment.organization?.id,
            transferId: tripleATransfer.transferId
          })
          break
        default:
          await this.paymentsEntityService.updateProviderStatus(payment.id, ProviderStatus.PENDING)
          break
      }
    } else {
      this.loggerService.error(`Unable to find effective Triple A Transfer for payment ${payment.id}`, {
        organizationId: payment.organization.id
      })
    }
  }

  async syncSafeTransfer(payment: Payment): Promise<void> {
    if (payment.provider !== PaymentProvider.GNOSIS_SAFE) return
    if (![ProviderStatus.PENDING].includes(payment.providerStatus)) return

    try {
      const multisigTransaction = await this.gnosisProviderService.getMultisigTransaction({
        safeHash: payment.safeHash,
        blockchainId: payment.blockchainId
      })

      if (!multisigTransaction) return

      if (multisigTransaction.isSuccessful) {
        await this.paymentsEntityService.updateProviderStatus(payment.id, ProviderStatus.COMPLETED)
      } else {
        let sourceWallet = payment.sourceWallet
        if (!sourceWallet) {
          sourceWallet = (await this.paymentsEntityService.get(payment.id, { relations: { sourceWallet: true } }))
            .sourceWallet
        }

        const safeGnosis = await this.gnosisProviderService.getSafeGnosis({
          blockchainId: payment.blockchainId,
          address: sourceWallet.address
        })

        if (!safeGnosis) return

        // If transaction is not successful and nonce is smaller than current nonce, transaction is rejected
        // If transaction nonce is larger than current nonce, leave status as pending regardless of rejection
        if (safeGnosis.nonce > multisigTransaction.nonce) {
          await this.paymentsEntityService.updateProviderStatus(payment.id, ProviderStatus.FAILED)
        }
      }
    } catch (e) {
      this.loggerService.error('Failed to fetch safe transaction', {
        safeHash: payment.safeHash,
        blockchainId: payment.blockchainId,
        e
      })
    }
  }

  async syncTripleATransfer(payment: Payment): Promise<void> {
    if (payment.provider !== PaymentProvider.TRIPLE_A) return
    if (![ProviderStatus.CREATED, ProviderStatus.PENDING].includes(payment.providerStatus)) return

    // Get transfer
    const tripleATransfer = await this.tripleATransfersEntityService.findEffectiveTransfer(
      payment.id,
      payment.metadata.quote?.id
    )

    if (tripleATransfer) {
      let transfer: TripleATransferResponse

      try {
        transfer = await this.tripleAService.getTransfer(tripleATransfer.transferId)
      } catch (e) {
        this.loggerService.error(`Failed to sync Triple A Transfer for payment ${payment.id}`, e, {
          organizationId: payment.organization?.id,
          transferId: tripleATransfer.transferId
        })

        // Save error
        await this.tripleATransfersEntityService.saveError(tripleATransfer.id, {
          response: e.response?.data,
          retryCount: tripleATransfer.error?.retryCount ? tripleATransfer.error.retryCount + 1 : 0
        })

        return
      }

      if (transfer.status !== tripleATransfer.status) {
        await this.tripleATransfersEntityService.updateTripleATransfer(transfer)

        let providerStatus: ProviderStatus

        switch (transfer.status) {
          case TripleATransferStatus.COMPLETED:
            providerStatus = ProviderStatus.COMPLETED
            break
          case TripleATransferStatus.CANCELLED:
          case TripleATransferStatus.DECLINED:
          case TripleATransferStatus.REJECTED:
          case TripleATransferStatus.REVERSED:
            providerStatus = ProviderStatus.FAILED
            break
          default:
            providerStatus = ProviderStatus.PENDING
            break
        }

        if (providerStatus !== payment.providerStatus) {
          await this.paymentsEntityService.updateProviderStatus(payment.id, providerStatus)
        }
      }
    } else {
      this.loggerService.error(`Unable to find effective Triple A Transfer for payment ${payment.id}`, {
        organizationId: payment.organization?.id
      })
    }
  }

  async syncPayments(sourceWalletId: string, blockchainId: string) {
    const sourceWallet = await this.walletsEntityService.getByWalletId(sourceWalletId, { organization: true })
    const organization = sourceWallet.organization
    const groupedPayments = groupBy(await this.getSynchronizablePayments(sourceWallet.id, blockchainId), 'hash')

    for (const hash in groupedPayments) {
      const financialTransactionParent = await this.financialTransactionsEntityService.getParentByHashAndOrganization(
        hash,
        organization.id
      )

      if (!financialTransactionParent) {
        continue
      }

      if (groupedPayments[hash][0].remarks && !financialTransactionParent.remark) {
        await this.financialTransactionsEntityService.updateParent(financialTransactionParent.id, {
          remark: groupedPayments[hash][0].remarks
        })
      }

      const payments: { [key: string]: Payment[] } = {}

      for (const key of Object.values(FinancialTransactionChildMetadataDirection)) {
        // Create copies for each direction
        payments[key] = groupedPayments[hash].map((payment) => payment)
      }

      for (const financialTransactionChild of financialTransactionParent.financialTransactionChild) {
        const direction = financialTransactionChild.financialTransactionChildMetadata.direction
        const index = payments[direction].findIndex(
          (payment) =>
            payment.sourceWallet.address === financialTransactionChild.fromAddress &&
            payment.blockchainId === financialTransactionChild.blockchainId &&
            payment.destinationAddress === financialTransactionChild.toAddress &&
            payment.sourceCryptocurrency.id === financialTransactionChild.cryptocurrency.id &&
            new Decimal(payment.sourceAmount).equals(new Decimal(financialTransactionChild.cryptocurrencyAmount))
        )

        if (index < 0) {
          continue
        }

        const payment = payments[direction].splice(index, 1)[0]

        // Migrate files
        if (payment.files && payment.files.length > 0) {
          await this.syncFiles(organization, payment, financialTransactionChild)
        }

        // Migrate COA, notes and payment metadata
        await this.syncMetadata(organization, financialTransactionChild, payment)

        await this.paymentsEntityService.setAsSynced(payment.id)
      }
    }
  }

  private async syncFiles(
    organization: Organization,
    payment: Payment,
    financialTransactionChild: FinancialTransactionChild
  ): Promise<void> {
    const financialTransactionFiles =
      await this.financialTransactionsEntityService.getFilesByOrganizationIdAndChildPublicId({
        organizationId: financialTransactionChild.organizationId,
        childPublicId: financialTransactionChild.publicId
      })
    const financialTransactionFileNames = financialTransactionFiles.map(
      (financialTransactionFile) => financialTransactionFile.name
    )
    const filenames = payment.files.filter((filename) => !financialTransactionFileNames.includes(filename))

    for (const filename of filenames) {
      try {
        const { filePath, key, bucket, contentLength, contentType } =
          await this.filesService.copyFromPaymentToTransactionAttachment({
            paymentPublicId: payment.publicId,
            organizationPublicId: organization.publicId,
            financialTransactionChildPublicId: financialTransactionChild.publicId,
            filename: filename
          })

        await this.financialTransactionsEntityService.saveFile(
          FinancialTransactionFile.create({
            filePath: filePath,
            file: {
              originalname: filename,
              mimetype: contentType,
              size: contentLength
            },
            key: key,
            bucket: bucket,
            financialTransactionChildId: financialTransactionChild.id,
            organizationId: financialTransactionChild.organizationId
          })
        )
      } catch (e) {
        this.loggerService.error(
          `Failed to sync file (${filename}) for financial transaction child ${financialTransactionChild.id} ${e.message}`,
          {
            organizationId: organization.id,
            e
          }
        )
      }
    }
  }

  private async syncMetadata(
    organization: Organization,
    financialTransactionChild: FinancialTransactionChild,
    payment: Payment
  ): Promise<void> {
    try {
      const metadata: {
        paymentMetadata: FinancialTransactionChildPaymentMetadata
        correspondingChartOfAccount?: ChartOfAccount
        correspondingChartOfAccountUpdatedBy?: string
        note?: string
      } = {
        paymentMetadata: {
          createdBy: `${payment.createdBy.firstName} ${payment.createdBy.lastName}`.trim(),
          reviewedBy: payment.reviewedBy
            ? `${payment.reviewedBy.firstName} ${payment.reviewedBy.lastName}`.trim()
            : null,
          executedBy: `${payment.executedBy.firstName} ${payment.executedBy.lastName}`.trim(),
          createdAt: payment.createdAt,
          reviewedAt: payment.reviewedAt,
          executedAt: payment.executedAt
        }
      }

      // Overwrite COA if updatedBy is null or starts with service prefix
      if (
        payment.chartOfAccountId &&
        (!financialTransactionChild.financialTransactionChildMetadata.correspondingChartOfAccountUpdatedBy ||
          financialTransactionChild.financialTransactionChildMetadata.correspondingChartOfAccountUpdatedBy.startsWith(
            'service_chart_of_account_mapping_'
          ))
      ) {
        metadata.correspondingChartOfAccount = await this.chartOfAccountsEntityService.getByOrganizationIdAndPublicId(
          organization.id,
          payment.chartOfAccountId
        )
        metadata.correspondingChartOfAccountUpdatedBy = `account_${payment.updatedBy.id}`
      }

      if (!financialTransactionChild.financialTransactionChildMetadata.note) {
        metadata.note = payment.notes
      }

      await this.financialTransactionsEntityService.updateChildMetadata(
        financialTransactionChild.financialTransactionChildMetadata.id,
        metadata
      )

      for (const annotationPublicId of payment.annotationPublicIds ?? []) {
        const annotation = await this.annotationsEntityService.getOneByPublicIdAndOrganizationId({
          publicId: annotationPublicId,
          organizationId: organization.id
        })
        if (annotation) {
          await this.financialTransactionChildAnnotationEntityService.upsertResourceAnnotation({
            annotationId: annotation.id,
            resourceId: financialTransactionChild.id,
            createdBy: `account_${payment.updatedBy?.id}`
          })
        }
      }
    } catch (e) {
      this.loggerService.error(
        `Failed to sync metadata for financial transaction child ${financialTransactionChild.id} ${e.message}`,
        {
          organizationId: organization.id,
          e
        }
      )
    }
  }

  private async getSynchronizablePayments(sourceWalletId: string, blockchainId: string): Promise<Payment[]> {
    const payments = await this.paymentsEntityService.findBySourceWallet(
      sourceWalletId,
      {
        blockchainId: blockchainId,
        statuses: [PaymentStatus.EXECUTED]
      },
      { createdBy: true, updatedBy: true, reviewedBy: true, executedBy: true }
    )

    // Get hash for Safe transactions
    for (const payment of payments) {
      if (payment.hash) continue
      if (payment.type !== PaymentType.SAFE) continue
      if (!payment.safeHash) continue

      try {
        const multisigTransaction = await this.gnosisProviderService.getMultisigTransaction({
          safeHash: payment.safeHash,
          blockchainId: payment.blockchainId
        })

        if (multisigTransaction?.transactionHash) {
          payment.hash = multisigTransaction.transactionHash
          payment.metadata = payment.metadata ?? {}
          payment.metadata.safeTransaction = multisigTransaction
          await this.paymentsEntityService.update(payment)
        }
      } catch (e) {
        this.loggerService.error(
          `Failed to fetch safe transaction with hash ${payment.safeHash} for wallet (${sourceWalletId}) on ${blockchainId}`,
          {
            walletId: sourceWalletId,
            e
          }
        )
      }
    }

    // Return only payments with hash
    return payments.filter((payment) => !!payment.hash)
  }

  private async createTripleATransfers(setExecutingPaymentsDto: SetExecutingPaymentsDto, organizationId: string) {
    const payments = await this.paymentsEntityService.findByPublicIds(setExecutingPaymentsDto.ids, organizationId, {
      sourceCryptocurrency: true
    })
    const fiatPayments = payments.filter((payment) => payment.destinationCurrencyType === CurrencyType.FIAT)

    if (fiatPayments.length == 0) return

    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: IntegrationName.TRIPLE_A,
        organizationId: organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED]
      })

    if (!organizationIntegration) {
      throw new BadRequestException('Triple A integration not found')
    }

    const tripleAMetadata = organizationIntegration.metadata as OrganizationIntegrationTripleAMetadata

    if (!tripleAMetadata.wallet.blockchainIds.includes(setExecutingPaymentsDto.blockchainId)) {
      throw new BadRequestException('Invalid blockchainId')
    }

    const fiatCurrencies = await this.fiatCurrenciesEntityService.getByIds(
      fiatPayments.map((payment) => payment.destinationCurrencyId)
    )
    const recipientBankAccounts = await this.recipientBankAccountsEntityService.findByPublicIds(
      fiatPayments.map((payment) => payment.destinationMetadata.id),
      organizationId
    )

    for (const fiatPayment of fiatPayments) {
      const quote = fiatPayment.metadata?.quote

      // Triple A wallet address is manually added to database
      // See https://app.clickup.com/25661070/v/dc/rf3me-30498/rf3me-42338
      if (fiatPayment.destinationAddress !== tripleAMetadata.wallet.address.toLowerCase()) {
        throw new BadRequestException(`Invalid destinationAddress for ${fiatPayment.publicId}`)
      }

      if (!quote) {
        throw new BadRequestException(`Missing quote for ${fiatPayment.publicId}`)
      }

      if (
        isBefore(new Date(fiatPayment.metadata.quote.expires_at), dateHelper.getUTCTimestampForward({ minutes: 5 }))
      ) {
        throw new BadRequestException(`Expired quote for ${fiatPayment.publicId}`)
      }

      const destinationCurrency = fiatCurrencies.find(
        (fiatCurrency) => fiatCurrency.id === fiatPayment.destinationCurrencyId
      )

      if (
        quote.receiving_currency !== destinationCurrency.alphabeticCode ||
        !new Decimal(quote.receiving_amount).equals(new Decimal(fiatPayment.destinationAmount)) ||
        quote.fee_currency !== quote.sending_currency ||
        quote.sending_currency !== fiatPayment.sourceCryptocurrency.symbol ||
        !new Decimal(quote.sending_amount).add(new Decimal(quote.fee)).equals(new Decimal(fiatPayment.sourceAmount))
      ) {
        throw new BadRequestException(`Invalid quote for ${fiatPayment.publicId}`)
      }
    }

    await Promise.all(
      fiatPayments.map(async (fiatPayment) => {
        const recipientBankAccount = recipientBankAccounts.find(
          (recipientBankAccount) => recipientBankAccount.publicId === fiatPayment.destinationMetadata.id
        )

        // Create transfer by quote
        const transfer = await this.tripleAService.createTransferWithQuote(fiatPayment.metadata.quote.id, {
          senderId: tripleAMetadata.companyId,
          destinationAccountId: recipientBankAccount.tripleAId,
          purposeOfRemittance: fiatPayment.metadata.purposeOfTransfer
        })

        // Save transfer
        await this.tripleATransfersEntityService.createTripleATransfer(
          fiatPayment.id,
          fiatPayment.metadata.quote.id,
          transfer
        )

        await this.paymentsEntityService.updateProviderStatus(fiatPayment.id, ProviderStatus.CREATED)
      })
    )
  }

  private getRecipientName(recipient: Recipient) {
    switch (recipient.type) {
      case ERecipientType.ORGANIZATION:
        return recipient.organizationName
      default:
        return recipient.contactName
    }
  }

  private handleError(error: Error) {
    if (error instanceof InvalidStateError) throw new BadRequestException(error.message)
    else if (error instanceof ValidationError) throw new BadRequestException(error.message)
    else throw error
  }

  async syncStuckInExecutingPayments() {
    // Looking for all stuck in executing payments not older than 7 day
    const fromDate = subDays(new Date(), 7)
    // We don't want to take the very last since customer might have just created it and still goes through the process
    const untilDate = subHours(new Date(), 1)
    const payments = await this.paymentsEntityService.findExecutingLastUpdatedForDateRange(fromDate, untilDate)
    for (const payment of payments) {
      try {
        await this.syncStuckInExecutingPayment(payment)
      } catch (e) {
        this.loggerService.error(`Failed to sync stuck in executing payment ${payment.id}`, e, {
          paymentId: payment.id,
          organizationId: payment.organization.id
        })
      }
    }
  }

  private async syncStuckInExecutingPayment(payment: Payment) {
    if (payment.hash || payment.safeHash) {
      // if hash is present, then it is unknown case and better do not touch that
      return
    }
    if (!payment.metadata?.proposedTransactionHash) {
      // if proposedTransactionHash is not present, then we can't do anything with that
      return
    }
    const proposedTransactionHash = payment.metadata.proposedTransactionHash

    if (payment.type === PaymentType.SAFE) {
      const gnosisTx = await this.gnosisProviderService.getMultisigTransaction({
        safeHash: proposedTransactionHash,
        blockchainId: payment.blockchainId
      })
      if (gnosisTx) {
        const setExecutedPaymentDto: SetExecutedPaymentDto = {
          safeHash: proposedTransactionHash,
          hash: null,
          id: payment.publicId,
          metadata: {
            safeTransaction: gnosisTx
          }
        }
        await this.setAsExecuted([setExecutedPaymentDto], payment.organization.id)
      }
    } else if (payment.type === PaymentType.DISPERSE) {
      const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(payment.blockchainId)
      const onchainTx = await etherscanAdapter.getTransactionReceipt(proposedTransactionHash)

      if (onchainTx) {
        const setExecutedPaymentDto: SetExecutedPaymentDto = {
          safeHash: null,
          hash: proposedTransactionHash,
          id: payment.publicId,
          metadata: {
            metamaskTransaction: onchainTx
          }
        }
        await this.setAsExecuted([setExecutedPaymentDto], payment.organization.id)
      }
    }
  }
}
