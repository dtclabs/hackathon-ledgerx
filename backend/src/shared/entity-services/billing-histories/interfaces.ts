export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  PAID = 'paid',
  REJECTED = 'rejected',
  REFUNDED = 'refunded'
}

export interface SubscriptionDetails {
  planName: string
  billingCycle: string
}

export interface InvoiceMetadata {
  invoiceNumber: string
  s3Filename: string
}
