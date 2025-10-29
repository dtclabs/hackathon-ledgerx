import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { formatUnits } from 'ethers/lib/utils'
import { BlockchainsEntityService } from '../../shared/entity-services/blockchains/blockchains.entity-service'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  InvoiceItem,
  InvoiceMetadata,
  InvoiceRole,
  InvoiceSettlementStatus,
  InvoiceSource,
  InvoiceStatus
} from '../../shared/entity-services/invoices/interfaces'
import { Invoice } from '../../shared/entity-services/invoices/invoice.entity'
import { InvoicesEntityService } from '../../shared/entity-services/invoices/invoices.entity-service'
import {
  RequestFinanceInvoiceRole,
  RequestFinanceInvoiceStatus
} from '../../shared/entity-services/request-finance-invoices/interfaces'
import { RequestFinanceInvoice } from '../../shared/entity-services/request-finance-invoices/request-finance-invoice.entity'
import { RequestFinanceInvoicesEntityService } from '../../shared/entity-services/request-finance-invoices/request-finance-invoices.entity-service'
import { TaxType } from '../integrations/request-finance/interfaces'
import { RequestFinanceService } from '../integrations/request-finance/request-finance.service'
import { CreateInvoiceDto, GenerateQrDto, InvoiceDto, InvoicesQueryParams } from '../../invoices/interfaces'
import { OrganizationIntegrationsEntityService } from '../../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { IntegrationName } from '../../shared/entity-services/integration/integration.entity'
import {
  OrganizationIntegrationStatus,
  OrganizationIntegrationDtcpayMetadata
} from '../../shared/entity-services/organization-integrations/interfaces'
import { DtcpayService } from '../integrations/dtcpay/dtcpay.service'
import {
  ResponseCode,
  PaymentTransactionState,
  Module,
  SettlementStatus,
  QueryHistoryResponse,
  QueryPaymentDetailResponse,
  CurrencyCategory,
  LoginResponse
} from '../integrations/dtcpay/interfaces'
import { LoggerService } from '../../shared/logger/logger.service'
import { FindOptionsWhere, DeepPartial, Between, ILike } from 'typeorm'
import { PaginationResponse } from '../../core/interfaces'
import { DtcpayPaymentDetailsEntityService } from '../../shared/entity-services/dtcpay-payment-details/dtcpay-payment-details.entity-service'
import { CryptocurrenciesEntityService } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Blockchain } from '../../shared/entity-services/blockchains/blockchain.entity'
import { Cryptocurrency } from '../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { FilesService } from '../../files/files.service'
import { addDays, parse } from 'date-fns'
import { dateHelper } from '../../shared/helpers/date.helper'

@Injectable()
export class InvoicesDomainService {
  constructor(
    private requestFinanceService: RequestFinanceService,
    private invoicesEntityService: InvoicesEntityService,
    private requestFinanceInvoicesEntityService: RequestFinanceInvoicesEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private blockchainsEntityService: BlockchainsEntityService,
    private cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private dtcpayPaymentDetailsEntityService: DtcpayPaymentDetailsEntityService,
    private dtcpayService: DtcpayService,
    private filesService: FilesService,
    private loggerService: LoggerService
  ) {}

  async getAllPaging(organizationId: string, query: InvoicesQueryParams) {
    const whereConditions: FindOptionsWhere<Invoice> = {
      organization: { id: organizationId }
    }

    if (query.source) whereConditions.source = query.source
    if (query.invoiceNumber) whereConditions.invoiceNumber = ILike(`%${query.invoiceNumber}%`)
    if (query.status) whereConditions.status = query.status
    if (query.issuedAt)
      whereConditions.issuedAt = Between(new Date(query.issuedAt), addDays(new Date(query.issuedAt), 1))
    if (query.expiredAt)
      whereConditions.expiredAt = Between(new Date(query.expiredAt), addDays(new Date(query.expiredAt), 1))

    const response = await this.invoicesEntityService.getAllPaging(query, [], whereConditions as any)

    return PaginationResponse.from({
      items: response.items.map((item) => InvoiceDto.map(item)),
      limit: response.limit,
      totalItems: response.totalItems,
      currentPage: response.currentPage
    })
  }

  async getChannels(
    organizationId: string
  ): Promise<{ id: number; blockchain: Blockchain; cryptocurrency: DeepPartial<Cryptocurrency> }[]> {
    await this.refreshChannels(organizationId)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: IntegrationName.DTCPAY,
        organizationId: organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED],
        relations: { organization: true }
      })

    const blockchains = await this.blockchainsEntityService.getEnabledBlockchains()
    const networks = blockchains.map((blockchain) => blockchain.publicId)
    // Get currencies that belong to blockchains supported by HQ
    const channels =
      (organizationIntegration.metadata as OrganizationIntegrationDtcpayMetadata)?.channels?.filter((channel) => {
        const module = Module[channel.module]
        return module && networks.includes(module.toLowerCase())
      }) ?? []
    const cryptocurrencies = await this.cryptocurrenciesEntityService.getBySymbols(
      channels.map((channel) => channel.processingCurrency)
    )

    return channels.map((channel) => {
      // Match using symbol, rely on dtcpay to ensure no conflicts in each module and currency pair
      // Prioritize verified cryptocurrencies first, if not found, fall back to unverified cryptocurrencies
      const cryptocurrency =
        cryptocurrencies.find(
          (cryptocurrency) =>
            cryptocurrency.symbol === channel.processingCurrency.toUpperCase() && cryptocurrency.isVerified
        ) ??
        cryptocurrencies.find((cryptocurrency) => cryptocurrency.symbol === channel.processingCurrency.toUpperCase())
      return {
        id: channel.acqRouteId,
        blockchain: blockchains.find(
          (blockchain) => blockchain.publicId === (Module[channel.module] as string).toLowerCase()
        ),
        // If cryptocurrency is not present, fill in details with information provided by dtcpay
        cryptocurrency: {
          name: cryptocurrency?.name ?? channel.processingCurrency,
          symbol: cryptocurrency?.symbol ?? channel.processingCurrency,
          image: cryptocurrency?.image ?? {
            thumb: `https://${this.filesService.PUBLIC_AWS_S3_BUCKET}.s3.${this.filesService.AWS_S3_REGION}.amazonaws.com/cryptocurrency-images/missing_thumb.png`,
            large: `https://${this.filesService.PUBLIC_AWS_S3_BUCKET}.s3.${this.filesService.AWS_S3_REGION}.amazonaws.com/cryptocurrency-images/missing_large.png`,
            small: `https://${this.filesService.PUBLIC_AWS_S3_BUCKET}.s3.${this.filesService.AWS_S3_REGION}.amazonaws.com/cryptocurrency-images/missing_small.png`
          }
        }
      }
    })
  }

  async create(organizationId: string, organizationPublicId: string, createInvoiceDto: CreateInvoiceDto) {
    switch (createInvoiceDto.source) {
      case InvoiceSource.DTCPAY:
        const organizationIntegration =
          await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
            integrationName: IntegrationName.DTCPAY,
            organizationId: organizationId,
            statuses: [OrganizationIntegrationStatus.COMPLETED]
          })
        if (!organizationIntegration) throw new BadRequestException('Missing dtcpay integration')
        createInvoiceDto.currency = (organizationIntegration.metadata as OrganizationIntegrationDtcpayMetadata).currency
        break
    }
    const invoice = await this.invoicesEntityService.findOneByInvoiceNumber(
      createInvoiceDto.invoiceNumber,
      organizationId,
      createInvoiceDto.source
    )

    if (invoice) throw new BadRequestException('This invoice number has already been used.')

    return await this.invoicesEntityService.createInvoice({
      organization: { id: organizationId, publicId: organizationPublicId },
      invoiceNumber: createInvoiceDto.invoiceNumber,
      currency: createInvoiceDto.currency,
      totalAmount: createInvoiceDto.totalAmount,
      fromMetadata: createInvoiceDto.fromMetadata,
      toMetadata: createInvoiceDto.toMetadata,
      invoiceDetails: createInvoiceDto.invoiceDetails,
      source: createInvoiceDto.source,
      issuedAt: createInvoiceDto.issuedAt,
      expiredAt: createInvoiceDto.expiredAt,
      note: createInvoiceDto.note
    })
  }

  async cancel(organizationId: string, invoicePublicId: string) {
    const invoice = await this.refreshFromSource(organizationId, invoicePublicId)
    if ([InvoiceStatus.CREATED, InvoiceStatus.PENDING].includes(invoice.status)) {
      invoice.status = InvoiceStatus.CANCELLED
      invoice.metadata.settlementStatus = InvoiceSettlementStatus.CANCELLED
      return await this.invoicesEntityService.update(invoice)
    } else return invoice
  }

  // TODO: Cancel previous QR and handle race conditions, trust user to not make duplicate payments for now
  async generateQr(organizationId: string, publicId: string, generateQrDto: GenerateQrDto) {
    const invoice = await this.refreshFromSource(organizationId, publicId)
    // Do not allow QR generation once past invoice.expiredAt
    if (
      ![InvoiceStatus.CREATED, InvoiceStatus.PENDING].includes(invoice.status) ||
      (invoice.expiredAt && invoice.expiredAt < dateHelper.getUTCTimestamp())
    )
      throw new BadRequestException('Failed to generate QR')

    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: IntegrationName.DTCPAY,
        organizationId: organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED],
        relations: { organizationIntegrationAuth: true }
      })

    const response = await this.dtcpayService.generateMerchantQr(
      organizationIntegration.organizationIntegrationAuth.metadata.signKey,
      organizationIntegration.organizationIntegrationAuth.metadata.merchantId,
      organizationIntegration.organizationIntegrationAuth.metadata.terminalId,
      generateQrDto.id,
      invoice.totalAmount,
      `${invoice.invoiceNumber}_${Date.now()}`
    )

    if (response.header.code !== ResponseCode.SUCCESS) {
      this.loggerService.error('Failed to generate dtcpay QR', JSON.stringify(response, null, 2))
      throw new BadRequestException('Failed to generate QR')
    }

    await this.dtcpayPaymentDetailsEntityService.upsertPaymentDetail(organizationId, response, invoice.id)

    invoice.sourceId = response.id.toString()
    invoice.status = InvoiceStatus.PENDING
    invoice.metadata.settlementStatus = [SettlementStatus.ACQ_SETTLED].includes(response.settlementStatus)
      ? InvoiceSettlementStatus.SETTLED
      : InvoiceSettlementStatus.PENDING
    invoice.sourceMetadata = {
      qr: response.qr,
      amount: response.processingAmount,
      blockchain: (Module[response.module] as string).toLowerCase(),
      cryptocurrency: response.processingCurrency,
      exchangeRate: response.exchangeRate.toString(),
      expiry: parse(`${response.txnExpiry}+0800`, 'yyyy-MM-dd HH:mm:ssxxxx', new Date())
    }

    return await this.invoicesEntityService.update(invoice)
  }

  async sync(organizationId: string) {
    const paidInvoices: RequestFinanceInvoice[] =
      (await this.requestFinanceService.syncNonTerminalStateForOrganization(organizationId)) ?? []
    const newRequestFinanceInvoices: RequestFinanceInvoice[] =
      (await this.requestFinanceService.syncNewForOrganization(organizationId)) ?? []

    const unlinkedRequestFinanceInvoices: RequestFinanceInvoice[] =
      (await this.requestFinanceInvoicesEntityService.getUnlinkedPaidInvoices(organizationId)) ?? []

    const invoices: RequestFinanceInvoice[] = paidInvoices
      .concat(newRequestFinanceInvoices)
      .concat(unlinkedRequestFinanceInvoices)
    const blockchains = await this.blockchainsEntityService.getEnabledBlockchains()

    const blockchainIdGroupedByRequestFinanceName: { [requestFinanceName: string]: string } = {}
    for (const blockchain of blockchains) {
      blockchainIdGroupedByRequestFinanceName[blockchain.requestFinanceName] = blockchain.publicId
    }

    for (const newRequestFinanceInvoice of invoices) {
      const blockchainId = blockchainIdGroupedByRequestFinanceName[newRequestFinanceInvoice.requestBlockchainId]

      if (blockchainId && newRequestFinanceInvoice.status === RequestFinanceInvoiceStatus.PAID) {
        const parent = await this.financialTransactionsEntityService.getParentByHashAndOrganizationAndBlockchainId(
          newRequestFinanceInvoice.transactionHash.toLowerCase(),
          organizationId,
          blockchainId
        )

        if (parent) {
          const invoiceData = await this.generateInvoiceDataFromRequestFinanceInvoice(newRequestFinanceInvoice)
          await this.invoicesEntityService.upsertInvoiceForParent({
            financialTransactionParentId: parent.id,
            organizationId,
            source: InvoiceSource.REQUEST_FINANCE,
            sourceId: newRequestFinanceInvoice.requestId,
            invoiceNumber: newRequestFinanceInvoice.invoiceNumber,
            counterpartyName: invoiceData.counterpartyName,
            counterpartyEmail: invoiceData.counterpartyEmail,
            fromMetadata: invoiceData.fromMetadata,
            toMetadata: invoiceData.toMetadata,
            status: invoiceData.status,
            invoiceDetails: invoiceData.invoiceDetails,
            invoiceItems: invoiceData.items,
            totalAmount: invoiceData.totalAmount,
            role: invoiceData.role,
            viewUrl: invoiceData.viewUrl,
            metadata: invoiceData.metadata
          })
          await this.requestFinanceInvoicesEntityService.markedAsLinkedById(newRequestFinanceInvoice.id)
        }
      }
    }
  }

  async syncDtcpay(organizationId: string): Promise<void> {
    const pageSize = 30
    let pageNo = 1

    try {
      const organizationIntegration =
        await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
          integrationName: IntegrationName.DTCPAY,
          organizationId: organizationId,
          statuses: [OrganizationIntegrationStatus.COMPLETED],
          relations: { organizationIntegrationAuth: true, organization: true }
        })

      if (!organizationIntegration) return

      const organization = organizationIntegration.organization

      while (true) {
        const queryResponse: QueryHistoryResponse = await this.dtcpayService.queryHistory(
          organizationIntegration.organizationIntegrationAuth.metadata.signKey,
          organizationIntegration.organizationIntegrationAuth.metadata.merchantId,
          organizationIntegration.organizationIntegrationAuth.metadata.terminalId,
          pageSize,
          pageNo
        )

        if (queryResponse.header.code !== ResponseCode.SUCCESS) {
          this.loggerService.error('Failed to query dtcpay history', JSON.stringify(queryResponse, null, 2))
          break
        }

        for (const record of queryResponse.page.records) {
          const transactionId = record.id.toString()
          const invoice = await this.invoicesEntityService.findOneBySource(
            InvoiceSource.DTCPAY,
            transactionId,
            organizationId
          )

          if (invoice) {
            // Updates both invoice and payment detail
            await this.refreshFromSource(organizationId, invoice.publicId)
          } else {
            let dtcpayPaymentDetail = await this.dtcpayPaymentDetailsEntityService.findOne({
              where: {
                transactionId: transactionId,
                organizationId: organizationId
              }
            })

            // Skip if no update required
            if (dtcpayPaymentDetail && dtcpayPaymentDetail.state === record.state) continue

            // Fetch from dtcpay
            const response: QueryPaymentDetailResponse = await this.dtcpayService.queryPaymentDetail(
              organizationIntegration.organizationIntegrationAuth.metadata.signKey,
              organizationIntegration.organizationIntegrationAuth.metadata.merchantId,
              organizationIntegration.organizationIntegrationAuth.metadata.terminalId,
              record.id
            )

            if (response.header.code === ResponseCode.SUCCESS) {
              if (dtcpayPaymentDetail) {
                // Update existing payment detail
                await this.dtcpayPaymentDetailsEntityService.upsertPaymentDetail(organizationId, response)
              } else {
                // Create payment detail
                dtcpayPaymentDetail = await this.dtcpayPaymentDetailsEntityService.upsertPaymentDetail(
                  organizationId,
                  response
                )

                // Create invoice
                const invoice = await this.invoicesEntityService.createInvoice({
                  organization: organization,
                  invoiceNumber: response.referenceNo,
                  currency: response.requestCurrency,
                  totalAmount: response.totalAmount,
                  fromMetadata: { name: response.merchantName },
                  invoiceDetails: {
                    subtotal: response.totalAmount,
                    taxTotal: '0',
                    items: [
                      {
                        name: `${response.processingAmount} ${response.processingCurrency}`,
                        currency: response.requestCurrency,
                        quantity: 1,
                        amount: response.totalAmount,
                        tax: {
                          percentage: 0
                        }
                      }
                    ]
                  },
                  issuedAt: dtcpayPaymentDetail.dtcTimestamp,
                  expiredAt: parse(`${response.txnExpiry}+0800`, 'yyyy-MM-dd HH:mm:ssxxxx', new Date())
                })

                dtcpayPaymentDetail.invoiceId = invoice.id
                invoice.sourceId = dtcpayPaymentDetail.transactionId
                invoice.sourceMetadata = {
                  qr: response.qr,
                  amount: response.processingAmount,
                  blockchain: (Module[response.module] as string).toLowerCase(),
                  cryptocurrency: response.processingCurrency,
                  exchangeRate: response.exchangeRate.toString(),
                  expiry: parse(`${response.txnExpiry}+0800`, 'yyyy-MM-dd HH:mm:ssxxxx', new Date())
                }

                invoice.metadata.settlementStatus = [SettlementStatus.ACQ_SETTLED].includes(response.settlementStatus)
                  ? InvoiceSettlementStatus.SETTLED
                  : InvoiceSettlementStatus.PENDING

                switch (response.state) {
                  case PaymentTransactionState.PENDING:
                    invoice.status = InvoiceStatus.PENDING
                    break
                  case PaymentTransactionState.SUCCESS:
                    invoice.status = InvoiceStatus.PAID
                    invoice.sourceMetadata.paidAt = dtcpayPaymentDetail.lastUpdatedTime
                    invoice.sourceMetadata.transactionHash = response.receiptNumber
                    break
                  case PaymentTransactionState.EXPIRED:
                    invoice.status = InvoiceStatus.EXPIRED
                    invoice.metadata.settlementStatus = InvoiceSettlementStatus.CANCELLED
                    break
                  default:
                    invoice.status = InvoiceStatus.CANCELLED
                    invoice.metadata.settlementStatus = InvoiceSettlementStatus.CANCELLED
                }

                await this.invoicesEntityService.update(invoice)
                await this.dtcpayPaymentDetailsEntityService.update(dtcpayPaymentDetail)
              }
            } else {
              this.loggerService.error(
                `Failed to query dtcpay payment (${record.id})`,
                JSON.stringify(response, null, 2)
              )
            }
          }
        }

        if (queryResponse.page.records.length != queryResponse.page.size) break

        pageNo += 1
      }
    } catch (e) {
      this.loggerService.error('Failed to sync with dtcpay', e, { organizationId })
    }
  }

  async refreshFromSource(organizationId: string, invoicePublicId: string): Promise<Invoice> {
    const invoice = await this.invoicesEntityService.getByOrganizationIdAndPublicId(organizationId, invoicePublicId, {
      financialTransactionParent: true
    })
    if (!invoice) {
      throw new NotFoundException('Invoice does not exist in the organization')
    }
    if (invoice.source === InvoiceSource.REQUEST_FINANCE) {
      const newRequestFinanceInvoice = await this.requestFinanceService.refreshFromSource(
        organizationId,
        invoice.sourceId
      )
      const newInvoiceData = await this.generateInvoiceDataFromRequestFinanceInvoice(newRequestFinanceInvoice)
      await this.invoicesEntityService.updateById(invoice.id, newInvoiceData)

      return { ...invoice, ...newInvoiceData }
    } else if (invoice.source === InvoiceSource.DTCPAY) {
      let invoice = await this.invoicesEntityService.getByOrganizationIdAndPublicId(organizationId, invoicePublicId)

      // If invoice is not in terminal state
      // cancelled is not a terminal state
      if (![InvoiceStatus.EXPIRED, InvoiceStatus.PAID].includes(invoice.status)) {
        // If dtcpay payment is generated
        if (invoice.sourceId) {
          let dtcpayPaymentDetail = await this.dtcpayPaymentDetailsEntityService.findOneByTransactionId(
            invoice.sourceId,
            organizationId
          )

          // Fetch latest if dtcpay payment is not in terminal state
          if (dtcpayPaymentDetail.state === PaymentTransactionState.PENDING) {
            const organizationIntegration =
              await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
                integrationName: IntegrationName.DTCPAY,
                organizationId: organizationId,
                statuses: [OrganizationIntegrationStatus.COMPLETED],
                relations: { organizationIntegrationAuth: true }
              })

            if (organizationIntegration) {
              try {
                const response = await this.dtcpayService.queryPaymentDetail(
                  organizationIntegration.organizationIntegrationAuth.metadata.signKey,
                  organizationIntegration.organizationIntegrationAuth.metadata.merchantId,
                  organizationIntegration.organizationIntegrationAuth.metadata.terminalId,
                  Number(invoice.sourceId)
                )

                if (response.header.code === ResponseCode.SUCCESS) {
                  dtcpayPaymentDetail = await this.dtcpayPaymentDetailsEntityService.upsertPaymentDetail(
                    organizationId,
                    response
                  )
                } else {
                  this.loggerService.error('Failed to query dtcpay payment', JSON.stringify(response, null, 2))
                }
              } catch (error) {
                this.loggerService.error('Error refreshing invoice from dtcpay payment detail', error, invoice.id)
              }
            }
          }

          switch (dtcpayPaymentDetail.state) {
            case PaymentTransactionState.SUCCESS:
              // Success state should contain full payment details
              const data = dtcpayPaymentDetail.rawData as QueryPaymentDetailResponse
              invoice.status = InvoiceStatus.PAID
              invoice.metadata.settlementStatus = [SettlementStatus.ACQ_SETTLED].includes(data.settlementStatus)
                ? InvoiceSettlementStatus.SETTLED
                : InvoiceSettlementStatus.PENDING
              invoice.sourceMetadata.paidAt = dtcpayPaymentDetail.lastUpdatedTime
              invoice.sourceMetadata.transactionHash = data.receiptNumber
              invoice = await this.invoicesEntityService.update(invoice)
              break
            case PaymentTransactionState.EXPIRED:
              // Expire invoice only if QR has expired and invoice.expiredAt has passed
              if (
                ![InvoiceStatus.CANCELLED].includes(invoice.status) &&
                invoice.expiredAt &&
                invoice.expiredAt < dateHelper.getUTCTimestamp()
              ) {
                invoice.status = InvoiceStatus.EXPIRED
                invoice.metadata.settlementStatus = InvoiceSettlementStatus.CANCELLED
                invoice = await this.invoicesEntityService.update(invoice)
              }
              break
          }
        } else if (
          // Expire invoice directly if no QR has been generated
          ![InvoiceStatus.CANCELLED].includes(invoice.status) &&
          invoice.expiredAt &&
          invoice.expiredAt < dateHelper.getUTCTimestamp()
        ) {
          invoice.status = InvoiceStatus.EXPIRED
          invoice.metadata.settlementStatus = InvoiceSettlementStatus.CANCELLED
          invoice = await this.invoicesEntityService.update(invoice)
        }
      }

      return invoice
    }
  }

  async generateInvoiceDataFromRequestFinanceInvoice(
    requestFinanceInvoice: RequestFinanceInvoice
  ): Promise<Partial<Invoice>> {
    const buyerName = requestFinanceInvoice.rawData.buyerInfo.businessName
      ? requestFinanceInvoice.rawData.buyerInfo.businessName
      : `${requestFinanceInvoice.rawData.buyerInfo.firstName} ${requestFinanceInvoice.rawData.buyerInfo.lastName}`.trim()
    const sellerName = requestFinanceInvoice.rawData.sellerInfo.businessName
      ? requestFinanceInvoice.rawData.sellerInfo.businessName
      : `${requestFinanceInvoice.rawData.sellerInfo.firstName} ${requestFinanceInvoice.rawData.sellerInfo.lastName}`.trim()
    const counterpartyName = requestFinanceInvoice.role === RequestFinanceInvoiceRole.SELLER ? buyerName : sellerName
    const counterpartyEmail =
      requestFinanceInvoice.role === RequestFinanceInvoiceRole.SELLER
        ? requestFinanceInvoice.rawData.buyerInfo.email
        : requestFinanceInvoice.rawData.sellerInfo.email
    const toMetadata = {
      name: buyerName,
      email: requestFinanceInvoice.rawData.buyerInfo.email
    }
    const fromMetadata = {
      name: sellerName,
      email: requestFinanceInvoice.rawData.sellerInfo.email
    }

    const invoiceItems: InvoiceItem[] = []
    let totalAmount: Decimal = new Decimal(0)
    for (const requestFinanceInvoiceItem of requestFinanceInvoice.rawData.invoiceItems) {
      const { symbol, decimals } = await this.requestFinanceService.getSymbolAndDecimalFromRequestCurrency(
        requestFinanceInvoiceItem.currency
      )

      let amount = new Decimal(requestFinanceInvoiceItem.quantity).mul(
        formatUnits(requestFinanceInvoiceItem.unitPrice, decimals)
      )
      if (requestFinanceInvoiceItem.discount) {
        amount = amount.sub(formatUnits(requestFinanceInvoiceItem.discount, decimals))
      }
      if (requestFinanceInvoiceItem.tax) {
        const tax = requestFinanceInvoiceItem.tax
        if (tax.type === TaxType.FIXED) {
          amount = amount.add(formatUnits(tax.amount, decimals))
        } else if (tax.type === TaxType.PERCENTAGE) {
          const multiplier = new Decimal(1).add(new Decimal(tax.amount).div(100))
          amount = amount.mul(multiplier)
        }
      }
      totalAmount = totalAmount.add(amount)
      const invoiceItem: InvoiceItem = {
        name: requestFinanceInvoiceItem.name,
        currency: symbol,
        quantity: requestFinanceInvoiceItem.quantity,
        amount: amount.toString()
      }
      invoiceItems.push(invoiceItem)
    }
    const metadata: InvoiceMetadata = {
      note: requestFinanceInvoice.rawData.note,
      tags: requestFinanceInvoice.rawData.tags
    }
    const invoiceData: Partial<Invoice> = {
      counterpartyName,
      counterpartyEmail,
      invoiceDetails: { items: invoiceItems },
      items: invoiceItems,
      totalAmount: totalAmount.toString(),
      role: requestFinanceInvoice.role as unknown as InvoiceRole,
      status: InvoiceStatus.PAID,
      toMetadata: toMetadata,
      fromMetadata: fromMetadata,
      // Seller will have the view link but buyer will only have the pay link. It is virtually the same link with only additional flag &enablePayment=true added
      // Doing the below rather than checking buyer or seller which is more business-logic agnostic
      viewUrl: requestFinanceInvoice.rawData.invoiceLinks?.view ?? requestFinanceInvoice.rawData.invoiceLinks?.pay,
      metadata
    }

    return invoiceData
  }

  async softDeleteRequestFinanceForOrganization(organizationId: string) {
    await this.invoicesEntityService.softDeleteBySourceForOrganization(organizationId, InvoiceSource.REQUEST_FINANCE)
    await this.requestFinanceInvoicesEntityService.softDeleteByOrganization(organizationId)
  }

  async softDeleteDtcpayForOrganization(organizationId: string) {
    await this.invoicesEntityService.softDeleteBySourceForOrganization(organizationId, InvoiceSource.DTCPAY)
    await this.dtcpayPaymentDetailsEntityService.softDeleteByOrganization(organizationId)
  }

  private async refreshChannels(organizationId: string): Promise<void> {
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: IntegrationName.DTCPAY,
        organizationId: organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED],
        relations: { organizationIntegrationAuth: true }
      })

    const signKey = organizationIntegration.organizationIntegrationAuth.metadata.signKey
    const merchantId = organizationIntegration.organizationIntegrationAuth.metadata.merchantId
    const terminalId = organizationIntegration.organizationIntegrationAuth.metadata.terminalId
    const integrationMetadata = organizationIntegration.metadata as OrganizationIntegrationDtcpayMetadata

    let response: LoginResponse

    try {
      response = await this.dtcpayService.login(signKey, merchantId, terminalId)
    } catch (e) {
      this.loggerService.error('Error logging in to dtcpay', { organizationId: organizationId }, e)
      throw new InternalServerErrorException(
        'Invalid login. Verify your credentials and reach out to our team if the problem continues.'
      )
    }

    if (response.header.code !== ResponseCode.SUCCESS) {
      this.loggerService.error('Failed to login to dtcpay', { organizationId: organizationId, response: response })
      throw new BadRequestException('Invalid login. Please verify your credentials.')
    }

    if (!response.terminalInfo?.requestCurrency) {
      this.loggerService.error('Missing dtcpay request currency', {
        organizationId: organizationId,
        response: response
      })
      throw new BadRequestException('Missing currency in dtcpay setup')
    }

    const blockchains = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()
    const modules = response.channels.map((channel) => Module[channel.module]).filter((module) => module)

    if (modules.filter((module) => blockchains.includes(module.toLowerCase())).length === 0) {
      this.loggerService.error('No available dtcpay payment channels', {
        organizationId: organizationId,
        response: response
      })
      throw new BadRequestException('Missing payment methods in dtcpay setup')
    }

    if (integrationMetadata.currency !== response.terminalInfo.requestCurrency) {
      this.loggerService.error(
        `Request currency changed from ${integrationMetadata.currency} to ${response.terminalInfo.requestCurrency}`,
        { organizationId: organizationId, response: response }
      )
      throw new BadRequestException(`Request currency modified.`)
    }

    await this.organizationIntegrationsEntityService.updateMetadata(organizationIntegration.id, {
      currency: response.terminalInfo.requestCurrency,
      currencyCategory: (
        CurrencyCategory[this.dtcpayService.getCurrencyCategory(response.terminalInfo.requestCurrency)] as string
      )?.toLowerCase(),
      companyName: response.merchantInfo.name,
      address: {
        country: response.merchantInfo.country,
        city: response.merchantInfo.city,
        state: response.merchantInfo.state,
        postalCode: response.merchantInfo.postalCode,
        address: response.merchantInfo.address
      },
      channels: response.channels
    })
  }
}
