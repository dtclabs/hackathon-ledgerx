import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '../base.entity-service'
import { DtcpayPaymentDetail } from './dtcpay-payment-detail.entity'
import { Repository } from 'typeorm'
import { GenerateMerchantQrResponse, QueryPaymentDetailResponse } from '../../../domain/integrations/dtcpay/interfaces'
import { parse } from 'date-fns'

@Injectable()
export class DtcpayPaymentDetailsEntityService extends BaseEntityService<DtcpayPaymentDetail> {
  constructor(
    @InjectRepository(DtcpayPaymentDetail)
    private dtcpayPaymentDetailsRepository: Repository<DtcpayPaymentDetail>
  ) {
    super(dtcpayPaymentDetailsRepository)
  }

  async findOneByTransactionId(transactionId: string, organizationId: string): Promise<DtcpayPaymentDetail> {
    return await this.dtcpayPaymentDetailsRepository.findOneBy({
      transactionId: transactionId,
      organizationId: organizationId
    })
  }

  async upsertPaymentDetail(
    organizationId: string,
    response: QueryPaymentDetailResponse | GenerateMerchantQrResponse,
    invoiceId?: string
  ): Promise<DtcpayPaymentDetail> {
    const dtcpayPaymentDetail = await this.dtcpayPaymentDetailsRepository.findOne({
      where: { transactionId: response.id.toString(), organizationId: organizationId }
    })

    const dtcTimestamp = response.dtcTimestamp
      ? parse(`${response.dtcTimestamp}+0800`, 'yyyy-MM-dd HH:mm:ssxxxx', new Date())
      : null
    const lastUpdatedTime = response.lastUpdatedTime
      ? parse(`${response.lastUpdatedTime}+0800`, 'yyyy-MM-dd HH:mm:ssxxxx', new Date())
      : null

    if (!dtcpayPaymentDetail) {
      return await this.create({
        organizationId: organizationId,
        invoiceId: invoiceId,
        transactionId: response.id.toString(),
        state: response.state,
        referenceNo: response.referenceNo,
        requestCurrency: response.requestCurrency,
        processingAmount: response.processingAmount,
        processingCurrency: response.processingCurrency,
        dtcTimestamp: dtcTimestamp,
        lastUpdatedTime: lastUpdatedTime,
        rawData: response
      })
    } else if (
      dtcpayPaymentDetail.lastUpdatedTime &&
      lastUpdatedTime &&
      dtcpayPaymentDetail.lastUpdatedTime.getTime() === lastUpdatedTime.getTime()
    ) {
      // No change
      return dtcpayPaymentDetail
    } else {
      dtcpayPaymentDetail.state = response.state
      dtcpayPaymentDetail.referenceNo = response.referenceNo
      dtcpayPaymentDetail.requestCurrency = response.requestCurrency
      dtcpayPaymentDetail.processingAmount = response.processingAmount
      dtcpayPaymentDetail.processingCurrency = response.processingCurrency
      dtcpayPaymentDetail.dtcTimestamp = dtcTimestamp
      dtcpayPaymentDetail.lastUpdatedTime = lastUpdatedTime
      dtcpayPaymentDetail.rawData = response

      return await this.dtcpayPaymentDetailsRepository.save(dtcpayPaymentDetail)
    }
  }

  async softDeleteByOrganization(organizationId: string) {
    return await this.dtcpayPaymentDetailsRepository.softDelete({ organizationId })
  }
}
