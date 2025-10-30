import { ApiProperty } from '@nestjs/swagger'
import { BillingHistory } from '../shared/entity-services/billing-histories/billing-history.entity'
import { PaginationParams } from '../core/interfaces'
import {
  InvoiceMetadata,
  PaymentMethod,
  PaymentStatus,
  SubscriptionDetails
} from '../shared/entity-services/billing-histories/interfaces'
import { dateHelper } from '../shared/helpers/date.helper'

export class SubscriptionDetailsDto {
  @ApiProperty({ example: 'standard' })
  planName: string

  @ApiProperty({ example: 'annually' })
  billingCycle: string

  static map(subscriptionDetails: SubscriptionDetails): SubscriptionDetailsDto {
    const result = new SubscriptionDetailsDto()
    result.planName = subscriptionDetails.planName
    result.billingCycle = subscriptionDetails.billingCycle

    return result
  }
}

export class InvoiceMetadataDto {
  @ApiProperty({ example: '20230810' })
  invoiceNumber: string

  @ApiProperty({ example: 'invoice_file.pdf' })
  s3Filename: string

  static map(invoiceMetadata: InvoiceMetadata): InvoiceMetadataDto {
    const result = new InvoiceMetadataDto()
    result.invoiceNumber = invoiceMetadata.invoiceNumber
    result.s3Filename = invoiceMetadata.s3Filename
    return result
  }
}

export class BillingHistoryDto {
  @ApiProperty({ example: '73e3c4cd-7b3d-4b33-9218-5189f766d2b7' })
  id: string

  @ApiProperty({ example: 'USD' })
  billingCurrency: string

  @ApiProperty({ example: '200.92' })
  billedAmount: string

  @ApiProperty({ example: '199.92' })
  paidAmount: string

  @ApiProperty({ example: PaymentStatus.PENDING })
  status: PaymentStatus

  @ApiProperty({ example: dateHelper.getUTCTimestamp() })
  paidAt: Date

  @ApiProperty({ example: 'USD' })
  paymentCurrency: string

  @ApiProperty({ example: PaymentMethod.BANK_TRANSFER })
  paymentMethod: PaymentMethod

  @ApiProperty({ type: SubscriptionDetailsDto })
  subscriptionDetails: SubscriptionDetailsDto | undefined

  @ApiProperty({ type: InvoiceMetadataDto })
  invoiceMetadata: InvoiceMetadataDto | undefined

  static map(billingHistory: BillingHistory): BillingHistoryDto {
    const result = new BillingHistoryDto()
    result.id = billingHistory.publicId
    result.billingCurrency = billingHistory.billingCurrency
    result.billedAmount = billingHistory.billedAmount
    result.paidAmount = billingHistory.paidAmount
    result.status = billingHistory.status
    result.paidAt = billingHistory.paidAt
    result.paymentCurrency = billingHistory.paymentCurrency
    result.paymentMethod = billingHistory.paymentMethod
    if (billingHistory.subscriptionDetails)
      result.subscriptionDetails = SubscriptionDetailsDto.map(billingHistory.subscriptionDetails)
    if (billingHistory.invoiceMetadata) result.invoiceMetadata = InvoiceMetadataDto.map(billingHistory.invoiceMetadata)

    return result
  }
}

export class BillingHistoriesQueryParams extends PaginationParams {}
