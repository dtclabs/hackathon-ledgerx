import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOptionsRelations, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { BaseEntityService } from '../base.entity-service'
import {
  CounterpartyMetadata,
  InvoiceDetails,
  InvoiceItem,
  InvoiceMetadata,
  InvoiceRole,
  InvoiceSource,
  InvoiceStatus
} from './interfaces'
import { Invoice } from './invoice.entity'
import { dateHelper } from '../../helpers/date.helper'
import { ConfigService } from '@nestjs/config'
import { Organization } from '../organizations/organization.entity'

@Injectable()
export class InvoicesEntityService extends BaseEntityService<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private configService: ConfigService
  ) {
    super(invoicesRepository)
  }

  async upsertInvoiceForParent(params: {
    financialTransactionParentId: string
    organizationId: string
    source: InvoiceSource
    sourceId: string
    invoiceNumber: string
    counterpartyName: string
    counterpartyEmail: string
    fromMetadata: CounterpartyMetadata
    toMetadata: CounterpartyMetadata
    status: InvoiceStatus
    invoiceDetails: InvoiceDetails
    invoiceItems: InvoiceItem[]
    totalAmount: string
    role: string
    viewUrl: string
    metadata: InvoiceMetadata
  }) {
    const invoiceTemplate: QueryDeepPartialEntity<Invoice> = {
      financialTransactionParent: { id: params.financialTransactionParentId },
      organization: { id: params.organizationId },
      source: params.source,
      sourceId: params.sourceId,
      invoiceNumber: params.invoiceNumber,
      counterpartyName: params.counterpartyName,
      counterpartyEmail: params.counterpartyEmail,
      fromMetadata: params.fromMetadata,
      toMetadata: params.toMetadata,
      status: params.status,
      invoiceDetails: params.invoiceDetails,
      items: params.invoiceItems,
      currency: params.invoiceItems.at(0).currency,
      totalAmount: params.totalAmount,
      role: params.role as InvoiceRole,
      viewUrl: params.viewUrl,
      metadata: params.metadata
    }

    const exist = await this.invoicesRepository.findOne({
      where: {
        organization: { id: params.organizationId },
        source: params.source,
        sourceId: params.sourceId
      }
    })

    if (exist) {
      return this.invoicesRepository.update(exist.id, invoiceTemplate)
    } else {
      return this.invoicesRepository.save(invoiceTemplate as DeepPartial<Invoice>)
    }
  }

  async createInvoice(params: {
    organization: {
      id: string
      publicId: string
    }
    invoiceNumber: string
    currency: string
    totalAmount: string
    fromMetadata: CounterpartyMetadata
    invoiceDetails: InvoiceDetails
    toMetadata?: CounterpartyMetadata
    source?: InvoiceSource
    role?: InvoiceRole
    status?: InvoiceStatus
    issuedAt?: Date
    expiredAt?: Date
    note?: string
  }): Promise<Invoice> {
    const invoiceTemplate: DeepPartial<Invoice> = {
      organization: params.organization,
      status: params.status ?? InvoiceStatus.CREATED,
      source: params.source ?? InvoiceSource.DTCPAY,
      role: params.role ?? InvoiceRole.SELLER,
      invoiceNumber: params.invoiceNumber,
      currency: params.currency,
      totalAmount: params.totalAmount,
      fromMetadata: params.fromMetadata,
      toMetadata: params.toMetadata,
      invoiceDetails: params.invoiceDetails,
      issuedAt: params.issuedAt ?? dateHelper.getUTCTimestamp(),
      expiredAt: params.expiredAt ?? dateHelper.getUTCTimestampForward({ days: 7 }),
      metadata: { note: params.note }
    }

    return await this.invoicesRepository.manager.transaction(async (transactionManager) => {
      const invoice = await transactionManager.getRepository(Invoice).save(invoiceTemplate)
      invoice.viewUrl = `${this.configService.get('BASE_URL')}/${invoice.organization.publicId}/invoices/${
        invoice.publicId
      }/public`
      return await transactionManager.getRepository(Invoice).save(invoice)
    })
  }

  async getByOrganizationIdAndPublicId(
    organizationId: string,
    publicId: string,
    relations?: FindOptionsRelations<Invoice>
  ) {
    // Delegate expiry handling to invoice source
    return await this.invoicesRepository.findOne({
      where: {
        organization: { id: organizationId },
        publicId
      },
      relations
    })
  }

  async findOneByInvoiceNumber(
    invoiceNumber: string,
    organizationId: string,
    source: InvoiceSource,
    role: InvoiceRole = InvoiceRole.SELLER
  ): Promise<Invoice> {
    return await this.invoicesRepository.findOne({
      where: {
        organization: { id: organizationId },
        invoiceNumber: invoiceNumber,
        source: source,
        role: role
      }
    })
  }

  async findOneBySource(source: InvoiceSource, sourceId: string, organizationId: string): Promise<Invoice> {
    return await this.invoicesRepository.findOne({
      where: {
        organization: { id: organizationId },
        source: source,
        sourceId: sourceId
      }
    })
  }

  updateById(id: string, updateData: QueryDeepPartialEntity<Invoice>) {
    return this.invoicesRepository.update(id, updateData)
  }

  softDeleteBySourceForOrganization(organizationId: string, source: InvoiceSource) {
    return this.invoicesRepository.softDelete({ organization: { id: organizationId }, source })
  }
}
