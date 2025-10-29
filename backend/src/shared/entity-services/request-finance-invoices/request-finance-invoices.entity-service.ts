import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, In, Repository } from 'typeorm'
import { keccak256 } from 'web3-utils'
import { RequestFinanceInvoiceResponse } from '../../../domain/integrations/request-finance/interfaces'
import { BaseEntityService } from '../base.entity-service'
import { RequestFinanceInvoiceRole, RequestFinanceInvoiceStatus, RequestFinanceInvoiceStatusGroups } from './interfaces'
import { RequestFinanceInvoice } from './request-finance-invoice.entity'

@Injectable()
export class RequestFinanceInvoicesEntityService extends BaseEntityService<RequestFinanceInvoice> {
  constructor(
    @InjectRepository(RequestFinanceInvoice)
    private requestFinanceInvoicesRepository: Repository<RequestFinanceInvoice>
  ) {
    super(requestFinanceInvoicesRepository)
  }

  updateByObjectAndRawData(
    currentInvoice: RequestFinanceInvoice,
    invoiceResponse: RequestFinanceInvoiceResponse
  ): Promise<RequestFinanceInvoice> {
    currentInvoice.transactionHash = invoiceResponse.paymentMetadata?.txHash
    currentInvoice.status = invoiceResponse.status as RequestFinanceInvoiceStatus
    currentInvoice.rawData = invoiceResponse
    return this.requestFinanceInvoicesRepository.save(currentInvoice)
  }

  async upsertByOrganization(organizationId: string, invoiceResponses: RequestFinanceInvoiceResponse[]) {
    const invoices: RequestFinanceInvoice[] = []
    for (const invoiceResponse of invoiceResponses) {
      // Payment option of type wallet indicates an onchain transaction
      // However, there can be multiple payment option within 1 invoice.
      // As long as there is an onchain transaction then we need to parse them
      for (const paymentOption of invoiceResponse.paymentOptions) {
        if (paymentOption.type === 'wallet') {
          const existingInvoice = await this.requestFinanceInvoicesRepository.findOne({
            where: { organizationId, requestId: invoiceResponse.id }
          })

          if (existingInvoice) {
            if (keccak256(JSON.stringify(existingInvoice)) !== keccak256(JSON.stringify(invoiceResponse))) {
              existingInvoice.transactionHash = invoiceResponse.paymentMetadata?.txHash
              existingInvoice.requestBlockchainId =
                invoiceResponse.paymentMetadata?.chainName ?? paymentOption.value?.paymentInformation?.chain
              existingInvoice.creationDate = new Date(invoiceResponse.creationDate) // hack to get resync all invoices
              existingInvoice.status = invoiceResponse.status as RequestFinanceInvoiceStatus
              existingInvoice.rawData = invoiceResponse
              invoices.push(await this.requestFinanceInvoicesRepository.save(existingInvoice))
            }
          } else {
            const newInvoice: DeepPartial<RequestFinanceInvoice> = {
              organizationId,
              requestId: invoiceResponse.id,
              invoiceNumber: invoiceResponse.invoiceNumber,
              creationDate: invoiceResponse.creationDate,
              transactionHash: invoiceResponse.paymentMetadata?.txHash,
              requestBlockchainId:
                invoiceResponse.paymentMetadata?.chainName ?? paymentOption.value?.paymentInformation?.chain,
              status: invoiceResponse.status as RequestFinanceInvoiceStatus,
              role: invoiceResponse.role as RequestFinanceInvoiceRole,
              rawData: invoiceResponse
            }
            invoices.push(await this.requestFinanceInvoicesRepository.save(newInvoice))
            break
          }
        }
      }
    }
    return invoices
  }

  getByOrganizationAndRequestIdAndHash(organizationId: string, requestId: string) {
    return this.requestFinanceInvoicesRepository.findOne({
      where: {
        organizationId,
        requestId
      }
    })
  }

  getByOrganizationAndRequest(organizationId: string) {
    return this.requestFinanceInvoicesRepository.findOne({
      where: {
        organizationId
      },
      order: {
        creationDate: 'DESC'
      }
    })
  }

  getLatestInvoiceByOrganization(organizationId: string) {
    return this.requestFinanceInvoicesRepository.findOne({
      where: {
        organizationId
      },
      order: {
        creationDate: 'DESC'
      }
    })
  }

  getNonTerminalStateInvoicesByOrganization(organizationId: string) {
    return this.requestFinanceInvoicesRepository.find({
      where: {
        organizationId,
        status: In(RequestFinanceInvoiceStatusGroups.NON_TERMINAL_STATE)
      },
      select: {
        id: true,
        requestId: true,
        status: true
      }
    })
  }

  softDeleteByOrganization(organizationId: string) {
    return this.requestFinanceInvoicesRepository.softDelete({ organizationId })
  }

  getUnlinkedPaidInvoices(organizationId: string): Promise<RequestFinanceInvoice[]> {
    return this.requestFinanceInvoicesRepository.find({
      where: {
        organizationId,
        status: RequestFinanceInvoiceStatus.PAID,
        isLinked: false
      }
    })
  }

  markedAsLinkedById(id: string) {
    return this.requestFinanceInvoicesRepository.update(id, { isLinked: true })
  }
}
