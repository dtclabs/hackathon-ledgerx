import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, DeepPartial, FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm'
import { FilesService } from '../../../files/files.service'
import { InvalidStateError } from '../../errors/invalid-state.error'
import { ValidationError } from '../../errors/validation.error'
import { dateHelper } from '../../helpers/date.helper'
import { Account } from '../account/account.entity'
import { BaseEntityService } from '../base.entity-service'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { Organization } from '../organizations/organization.entity'
import { Wallet } from '../wallets/wallet.entity'
import {
  CurrencyType,
  DestinationMetadata,
  DestinationType,
  PaymentMetadata,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ProviderStatus,
  Recipient
} from './interfaces'
import { Payment } from './payment.entity'
import { TripleAQuoteResponse } from '../../../domain/integrations/triple-a/interfaces'
import Decimal from 'decimal.js'

@Injectable()
export class PaymentsEntityService extends BaseEntityService<Payment> {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private filesService: FilesService
  ) {
    super(paymentsRepository)
  }

  async createPayments(
    organizationId: string,
    params: {
      status: PaymentStatus
      destinationCurrencyType: CurrencyType
      destinationAddress?: string
      blockchainId?: string
      sourceWalletId?: string
      type?: PaymentType
      sourceCryptocurrencyId?: string
      destinationCurrencyId?: string
      sourceAmount?: string
      destinationAmount?: string
      destinationName?: string
      destinationMetadata?: DestinationMetadata
      files?: string[]
      chartOfAccountId?: string
      annotationPublicIds?: string[]
      remarks?: string
      metadata?: PaymentMetadata
      notes?: string
      reviewerId?: string
    }[],
    accountId: string
  ): Promise<Payment[]> {
    let payments: Payment[] = []
    for (const element of params) {
      const payment = new Payment()
      payment.organization = { id: organizationId } as Organization
      payment.blockchainId = element.blockchainId
      payment.status = element.status
      payment.type = element.type
      payment.sourceWallet = { id: element.sourceWalletId } as Wallet
      payment.sourceCryptocurrency = { id: element.sourceCryptocurrencyId } as Cryptocurrency
      payment.destinationCurrencyType = element.destinationCurrencyType
      payment.destinationCurrencyId = element.destinationCurrencyId
      payment.sourceAmount = element.sourceAmount
      payment.destinationAmount = element.destinationAmount
      payment.destinationAddress = element.destinationAddress?.toLowerCase()
      payment.destinationName = element.destinationName
      payment.destinationMetadata = element.destinationMetadata
      payment.chartOfAccountId = element.chartOfAccountId
      payment.annotationPublicIds = element.annotationPublicIds
      payment.metadata = element.metadata
      payment.notes = element.notes
      payment.remarks = element.remarks
      payment.files = element.files
      payment.reviewer = { id: element.reviewerId } as Account
      payment.createdBy = { id: accountId } as Account
      payment.updatedBy = { id: accountId } as Account
      switch (payment.status) {
        case PaymentStatus.PENDING:
          payment.reviewRequestedAt = dateHelper.getUTCTimestamp()
          payment.reviewRequestedBy = { id: accountId } as Account
          break
        case PaymentStatus.EXECUTING:
          if (payment.destinationCurrencyType === CurrencyType.CRYPTO) {
            switch (payment.type) {
              case PaymentType.DISPERSE:
                payment.provider = PaymentProvider.HQ
                break
              case PaymentType.SAFE:
                payment.provider = PaymentProvider.GNOSIS_SAFE
                break
            }
          }

          payment.executedAt = dateHelper.getUTCTimestamp()
          payment.executedBy = { id: accountId } as Account
          break
      }
      payment.lastUpdatedAt = dateHelper.getUTCTimestamp()
      payments.push(payment)
    }

    payments = await this.savePayments(...payments)

    for (const payment of payments) {
      if (payment.files) {
        for (const file of payment.files) {
          await this.filesService.copyFromPublicBucketToPayment({
            organizationPublicId: payment.organization.publicId,
            paymentPublicId: payment.publicId,
            filename: file
          })
        }
      }
    }

    return payments
  }

  async updatePayment(
    id: string,
    organizationId: string,
    params: {
      destinationAddress?: string
      destinationName?: string
      destinationMetadata?: DestinationMetadata
      sourceCryptocurrencyId?: string
      sourceAmount?: string
      destinationCurrencyId?: string
      destinationAmount?: string
      files?: string[]
      chartOfAccountId?: string
      annotationPublicIds?: string[]
      notes?: string
      reviewerId?: string
      metadata?: PaymentMetadata
    },
    accountId: string
  ): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: id, organization: { id: organizationId } },
      relations: { organization: true, sourceCryptocurrency: true }
    })

    if (
      ![
        PaymentStatus.CREATED,
        PaymentStatus.PENDING,
        PaymentStatus.INVALID,
        PaymentStatus.APPROVED,
        PaymentStatus.FAILED
      ].includes(payment.status)
    ) {
      throw new InvalidStateError('Payment must be in created, pending, invalid, approved or failed state')
    }

    const existingFiles = payment.files ? payment.files : []

    // Newly added files
    const files = params.files ? params.files.filter((file) => !existingFiles.includes(file)) : []

    if (params.destinationAddress !== undefined) payment.destinationAddress = params.destinationAddress?.toLowerCase()
    if (params.destinationName !== undefined) payment.destinationName = params.destinationName
    if (params.destinationMetadata !== undefined) payment.destinationMetadata = params.destinationMetadata
    if (params.sourceCryptocurrencyId !== undefined)
      payment.sourceCryptocurrency = { id: params.sourceCryptocurrencyId } as Cryptocurrency
    if (params.destinationCurrencyId !== undefined) payment.destinationCurrencyId = params.destinationCurrencyId
    if (params.sourceAmount !== undefined) payment.sourceAmount = params.sourceAmount
    if (params.destinationAmount !== undefined) payment.destinationAmount = params.destinationAmount
    if (params.files !== undefined) payment.files = params.files
    if (params.chartOfAccountId !== undefined) payment.chartOfAccountId = params.chartOfAccountId
    if (params.annotationPublicIds !== undefined) payment.annotationPublicIds = params.annotationPublicIds
    if (params.notes !== undefined) payment.notes = params.notes
    if (params.reviewerId !== undefined) payment.reviewer = { id: params.reviewerId } as Account
    if (params.metadata !== undefined) payment.metadata = { ...payment.metadata, ...params.metadata }
    payment.updatedBy = { id: accountId } as Account
    payment.lastUpdatedAt = dateHelper.getUTCTimestamp()
    if (payment.status === PaymentStatus.INVALID) payment.status = PaymentStatus.CREATED

    const payments = await this.savePayments(payment)

    for (const file of files) {
      await this.filesService.copyFromPublicBucketToPayment({
        organizationPublicId: payment.organization.publicId,
        paymentPublicId: payment.publicId,
        filename: file
      })
    }

    return payments[0]
  }

  async setAsCreated(publicId: string, organizationId: string, accountId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { publicId: publicId, organization: { id: organizationId } },
      relations: { sourceCryptocurrency: true }
    })

    if (!payment) throw new NotFoundException()

    if (
      ![PaymentStatus.PENDING, PaymentStatus.INVALID, PaymentStatus.APPROVED, PaymentStatus.FAILED].includes(
        payment.status
      )
    ) {
      throw new InvalidStateError('Payment must be in pending, invalid, approved or failed state')
    }

    payment.status = PaymentStatus.CREATED
    payment.blockchainId = null
    payment.type = null
    payment.sourceWallet = null
    payment.reviewRequestedBy = null
    payment.reviewRequestedAt = null
    payment.reviewedAt = null
    payment.reviewedBy = null
    payment.executedBy = null
    payment.executedAt = null
    payment.failedAt = null
    payment.updatedBy = { id: accountId } as Account
    payment.lastUpdatedAt = dateHelper.getUTCTimestamp()

    return (await this.savePayments(payment))[0]
  }

  async setAsPending(publicId: string, organizationId: string, accountId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { publicId: publicId, organization: { id: organizationId } },
      relations: { sourceCryptocurrency: true }
    })

    if (!payment) throw new NotFoundException()

    if (![PaymentStatus.CREATED].includes(payment.status)) {
      throw new InvalidStateError('Payment must be in created state')
    }

    payment.status = PaymentStatus.PENDING
    payment.reviewRequestedBy = { id: accountId } as Account
    payment.reviewRequestedAt = dateHelper.getUTCTimestamp()
    payment.updatedBy = { id: accountId } as Account
    payment.lastUpdatedAt = dateHelper.getUTCTimestamp()

    return (await this.savePayments(payment))[0]
  }

  async setAsApproved(publicId: string, organizationId: string, accountId: DeepPartial<Account>): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { publicId: publicId, organization: { id: organizationId } },
      relations: { sourceCryptocurrency: true }
    })

    if (!payment) throw new NotFoundException()

    if (![PaymentStatus.PENDING].includes(payment.status)) {
      throw new InvalidStateError('Payment must be in pending state')
    }

    payment.status = PaymentStatus.APPROVED
    payment.reviewedBy = { id: accountId } as Account
    payment.reviewedAt = dateHelper.getUTCTimestamp()

    return (await this.savePayments(payment))[0]
  }

  async setAsExecuting(
    publicIds: string[],
    organizationId: string,
    params: {
      blockchainId: string
      sourceWalletId: string
      paymentType: PaymentType
      remarks?: string
      proposedTransactionHash: string
    },
    accountId: string
  ): Promise<Payment[]> {
    const payments = await this.paymentsRepository.find({
      where: { publicId: In(publicIds), organization: { id: organizationId } },
      relations: { sourceWallet: true, sourceCryptocurrency: true }
    })

    for (const payment of payments) {
      if (
        ![
          PaymentStatus.CREATED,
          PaymentStatus.PREVIEW,
          PaymentStatus.PENDING,
          PaymentStatus.APPROVED,
          PaymentStatus.FAILED
        ].includes(payment.status)
      ) {
        throw new InvalidStateError('Payment must be in preview, created, pending, approved or failed state')
      }

      payment.status = PaymentStatus.EXECUTING
      payment.blockchainId = params.blockchainId
      payment.type = params.paymentType
      if (payment.destinationCurrencyType === CurrencyType.CRYPTO) {
        switch (payment.type) {
          case PaymentType.DISPERSE:
            payment.provider = PaymentProvider.HQ
            break
          case PaymentType.SAFE:
            payment.provider = PaymentProvider.GNOSIS_SAFE
            break
        }
      }
      payment.sourceWallet = { id: params.sourceWalletId } as Wallet
      if (params.remarks) {
        payment.remarks = params.remarks
      }
      payment.executedBy = { id: accountId } as Account
      payment.metadata = { ...payment.metadata, proposedTransactionHash: params.proposedTransactionHash }
      payment.lastUpdatedAt = dateHelper.getUTCTimestamp()
    }

    return await this.savePayments(...payments)
  }

  async setAsExecuted(
    params: {
      id: string
      hash?: string
      safeHash?: string
      metadata?: PaymentMetadata
    }[],
    organizationId: string
  ): Promise<Payment[]> {
    const payments = await this.paymentsRepository.find({
      where: { publicId: In(params.map((element) => element.id)), organization: { id: organizationId } },
      relations: { sourceWallet: true, sourceCryptocurrency: true }
    })

    for (const payment of payments) {
      if (![PaymentStatus.EXECUTING].includes(payment.status)) {
        throw new InvalidStateError('Payment must be in executing state')
      }

      const element = params.find((element) => element.id === payment.publicId)

      payment.status = PaymentStatus.EXECUTED
      payment.hash = element.hash
      payment.safeHash = element.safeHash
      payment.metadata = { ...payment.metadata, ...element.metadata }
      payment.executedAt = dateHelper.getUTCTimestamp()
      payment.lastUpdatedAt = dateHelper.getUTCTimestamp()
      switch (payment.provider) {
        case PaymentProvider.HQ:
          // Transactions made via Disperse/LedgerX complete immediately
          payment.providerStatus = ProviderStatus.COMPLETED
          break
        case PaymentProvider.GNOSIS_SAFE:
          if (payment.hash) {
            // Safe transactions with 1 confirmation completes immediately
            payment.providerStatus = ProviderStatus.COMPLETED
          } else {
            // Safe transactions with multiple confirmations are queued
            payment.providerStatus = ProviderStatus.PENDING
          }
          break
      }
    }

    return await this.savePayments(...payments)
  }

  async setAsFailed(publicIds: string[], organizationId: string): Promise<Payment[]> {
    const payments = await this.paymentsRepository.find({
      where: { publicId: In(publicIds), organization: { id: organizationId } },
      relations: { sourceWallet: true, sourceCryptocurrency: true }
    })

    for (const payment of payments) {
      if (![PaymentStatus.EXECUTING].includes(payment.status)) {
        throw new InvalidStateError('Payment must be in executing state')
      }

      payment.status = PaymentStatus.FAILED
      payment.failedAt = dateHelper.getUTCTimestamp()
    }

    return await this.savePayments(...payments)
  }

  async setAsSynced(id: string): Promise<Payment> {
    return await this.paymentsRepository.save({
      id: id,
      status: PaymentStatus.SYNCED,
      syncedAt: dateHelper.getUTCTimestamp()
    })
  }

  async setAsInvalid(id: string): Promise<Payment> {
    return await this.paymentsRepository.save({
      id: id,
      status: PaymentStatus.INVALID
    })
  }

  async softDeleteBySourceWallet(sourceWallet: Wallet) {
    return await this.paymentsRepository.softDelete({
      sourceWallet: { id: sourceWallet.id }
    })
  }

  async findOneByPublicId(
    publicId: string,
    organizationId: string,
    relations?: FindOptionsRelations<Payment>
  ): Promise<Payment> {
    return await this.paymentsRepository.findOne({
      where: { publicId: publicId, organization: { id: organizationId } },
      relations: relations ?? {}
    })
  }

  async findByPublicIds(
    publicIds: string[],
    organizationId: string,
    relations?: FindOptionsRelations<Payment>
  ): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: { publicId: In(publicIds), organization: { id: organizationId } },
      relations: relations ?? {}
    })
  }

  async findOneBySafeHash(safeHash: string, organizationId: string): Promise<Payment> {
    return await this.paymentsRepository.findOne({
      where: { safeHash: safeHash, organization: { id: organizationId } },
      relations: { organization: true, sourceCryptocurrency: true }
    })
  }

  async findBySafeHash(safeHash: string, organizationId: string): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: {
        safeHash: safeHash,
        organization: { id: organizationId }
      },
      relations: { organization: true, sourceCryptocurrency: true }
    })
  }

  async findBySourceWallet(
    sourceWalletId: string,
    options?: {
      blockchainId?: string
      statuses?: PaymentStatus[]
    },
    relations?: FindOptionsRelations<Payment>
  ): Promise<Payment[]> {
    const whereConditions: FindOptionsWhere<Payment> = {
      sourceWallet: { id: sourceWalletId }
    }
    if (options) {
      if (options.blockchainId) {
        whereConditions.blockchainId = options.blockchainId
      }
      if (options.statuses) {
        whereConditions.status = In(options.statuses)
      }
    }
    return await this.paymentsRepository.find({
      where: whereConditions,
      relations: { sourceWallet: true, sourceCryptocurrency: true, ...relations }
    })
  }

  async findByDestination(
    destination: {
      address?: string
      metadata: DestinationMetadata
    },
    organizationId: string,
    statuses?: PaymentStatus[]
  ): Promise<Payment[]> {
    let queryBuilder = this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.organization_id = :organizationId', {
        organizationId: organizationId
      })

    if (destination.address) {
      queryBuilder = queryBuilder.andWhere('payment.destination_address ILIKE :destinationAddress', {
        destinationAddress: destination.address
      })
    }

    if (destination.metadata === null) {
      queryBuilder = queryBuilder.andWhere('payment.destination_metadata IS NULL')
    } else {
      queryBuilder = queryBuilder.andWhere(
        `payment.destination_metadata ->> 'id' = :id AND payment.destination_metadata ->> 'type' = :type`,
        { id: destination.metadata.id, type: destination.metadata.type }
      )
    }

    if (statuses) {
      queryBuilder = queryBuilder.andWhere('payment.status IN (:...statuses)', { statuses: statuses })
    }

    return await queryBuilder.getMany()
  }

  async updateDestination(id: string, destinationName: string, destinationMetadata?: DestinationMetadata) {
    const object: DeepPartial<Payment> = {
      destinationName: destinationName
    }
    // Allow destinationMetadata to be set as null
    if (destinationMetadata !== undefined) {
      object.destinationMetadata = destinationMetadata
    }
    return await this.paymentsRepository.update(id, object)
  }

  async getRecipients(
    organizationId: string,
    options?: { destinationCurrencyType?: CurrencyType }
  ): Promise<Recipient[]> {
    const recipients = []
    const query = this.paymentsRepository
      .createQueryBuilder('payment')
      .select(['payment.destination_address, payment.destination_name'])
      .where('payment.organization_id = :organizationId', { organizationId: organizationId })
      .andWhere('payment.status IN (:...statuses)', {
        statuses: [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.FAILED]
      })
    if (options?.destinationCurrencyType) {
      query.andWhere('payment.destinationCurrencyType = :destinationCurrencyType', {
        destinationCurrencyType: options.destinationCurrencyType
      })
    }
    const records = await query.groupBy('payment.destination_address, payment.destination_name').getRawMany()
    for (const record of records) {
      recipients.push({
        destinationName: record.destination_name,
        destinationAddress: record.destination_address
      })
    }
    return recipients
  }

  async updateQuote(
    id: string,
    destinationAddress: string,
    quote: TripleAQuoteResponse,
    accountId: string
  ): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: id },
      relations: { sourceCryptocurrency: true, sourceWallet: true }
    })

    if (
      ![
        PaymentStatus.CREATED,
        PaymentStatus.PREVIEW,
        PaymentStatus.PENDING,
        PaymentStatus.APPROVED,
        PaymentStatus.FAILED
      ].includes(payment.status)
    ) {
      throw new InvalidStateError('Payment must be in created, preview, pending, approved or failed state')
    }

    payment.provider = PaymentProvider.TRIPLE_A
    payment.destinationAddress = destinationAddress.toLowerCase()
    payment.sourceAmount = new Decimal(quote.sending_amount).add(new Decimal(quote.fee)).toString()
    payment.metadata = payment.metadata ? { ...payment.metadata, quote: quote } : { quote: quote }
    payment.updatedBy = { id: accountId } as Account
    payment.lastUpdatedAt = dateHelper.getUTCTimestamp()

    return (await this.savePayments(payment))[0]
  }

  async updateProviderStatus(id: string, providerStatus: ProviderStatus) {
    return await this.paymentsRepository.update(id, { providerStatus: providerStatus })
  }

  async findUnconfirmedTripleAPayments(executedBetween: { from: Date; to: Date }): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: {
        status: In([PaymentStatus.EXECUTED, PaymentStatus.SYNCED]),
        provider: PaymentProvider.TRIPLE_A,
        providerStatus: ProviderStatus.CREATED,
        executedAt: Between(executedBetween.from, executedBetween.to)
      }
    })
  }

  async findByProviderStatuses(provider: PaymentProvider, providerStatuses: ProviderStatus[]) {
    return await this.paymentsRepository.find({
      where: { provider: provider, providerStatus: In(providerStatuses) }
    })
  }

  private async savePayments(...payments: Payment[]): Promise<Payment[]> {
    for (const payment of payments) {
      switch (payment.destinationCurrencyType) {
        case CurrencyType.FIAT:
          if (!payment.destinationMetadata) {
            throw new ValidationError('Missing destinationMetadata')
          } else if (payment.destinationMetadata.type !== DestinationType.RECIPIENT_BANK_ACCOUNT) {
            throw new ValidationError('Invalid destinationMetadata.recipientType')
          }
          if (!payment.destinationCurrencyId) {
            throw new ValidationError('Missing destinationCurrency')
          }
          if (![PaymentStatus.CREATED].includes(payment.status)) {
            if (!payment.destinationAmount) {
              throw new ValidationError('Missing destinationAmount')
            }

            if ([PaymentStatus.PREVIEW, PaymentStatus.EXECUTING, PaymentStatus.EXECUTED].includes(payment.status)) {
              if (!payment.sourceCryptocurrency) {
                throw new ValidationError('Missing sourceCryptocurrency')
              }
              if (!payment.metadata?.purposeOfTransfer) {
                throw new ValidationError('Missing purposeOfTransfer')
              }
            }

            if ([PaymentStatus.EXECUTING, PaymentStatus.EXECUTED].includes(payment.status)) {
              if (!payment.sourceAmount) {
                throw new ValidationError('Missing sourceAmount')
              }
              if (!payment.destinationAddress) {
                throw new ValidationError('Missing destinationAddress')
              }
              if (!payment.provider) {
                throw new ValidationError('Missing provider')
              }
              if (!payment.metadata?.quote) {
                throw new ValidationError('Missing quote')
              }
            }
          }

          break
        case CurrencyType.CRYPTO:
          if (!payment.destinationAddress) {
            throw new ValidationError('Missing destinationAddress')
          }
          if (payment.sourceCryptocurrency?.id !== payment.destinationCurrencyId) {
            throw new ValidationError('Invalid destinationCurrency')
          }
          if (payment.sourceAmount !== payment.destinationAmount) {
            throw new ValidationError('Invalid destinationAmount')
          }
          if (![PaymentStatus.CREATED].includes(payment.status)) {
            if (!payment.sourceCryptocurrency) {
              throw new ValidationError('Missing sourceCryptocurrency')
            }
            if (!payment.sourceAmount) {
              throw new ValidationError('Missing sourceAmount')
            }
          }
          break
        default:
          throw new ValidationError('Invalid destination currency type')
      }
      if ([PaymentStatus.PREVIEW, PaymentStatus.EXECUTING, PaymentStatus.EXECUTED].includes(payment.status)) {
        if (!payment.blockchainId) {
          throw new ValidationError('Missing blockchainId')
        }
        if (!payment.type) {
          throw new ValidationError('Missing payment type')
        }
        if (!payment.sourceWallet) {
          throw new ValidationError('Missing sourceWallet')
        }
      }
      if ([PaymentStatus.EXECUTED].includes(payment.status)) {
        if (!payment.hash && !payment.safeHash) {
          throw new ValidationError('Either hash or safeHash must be present')
        }
        if (!payment.provider) {
          throw new ValidationError('Payment provider must be present')
        }
        if (!payment.providerStatus) {
          throw new ValidationError('Provider status must be present')
        }
      }
    }

    payments = await this.paymentsRepository.save(payments)
    return await this.paymentsRepository.find({
      where: {
        id: In(payments.map((payment) => payment.id))
      },
      relations: {
        organization: true,
        sourceCryptocurrency: true,
        reviewer: true,
        createdBy: true,
        updatedBy: true,
        reviewRequestedBy: true,
        reviewedBy: true,
        executedBy: true
      }
    })
  }

  async findExecutingLastUpdatedForDateRange(fromDate: Date, untilDate: Date): Promise<Payment[]> {
    return await this.paymentsRepository.find({
      where: {
        status: PaymentStatus.EXECUTING,
        updatedAt: Between(fromDate, untilDate)
      },
      relations: {
        organization: true
      }
    })
  }
}
