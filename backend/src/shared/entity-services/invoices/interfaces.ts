export enum InvoiceRole {
  SELLER = 'seller',
  BUYER = 'buyer'
}

export enum InvoiceSource {
  REQUEST_FINANCE = 'request_finance',
  DTCPAY = 'dtcpay'
}

export enum InvoiceStatus {
  CREATED = 'created',
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum InvoiceSettlementStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  SETTLED = 'settled'
}

export interface TaxDetails {
  percentage?: number
  amount?: string
}

export interface InvoiceItem {
  name: string
  currency: string
  quantity: number
  amount: string
  tax?: TaxDetails
}

export interface InvoiceMetadata {
  note: string
  tags?: string[]
  settlementStatus?: InvoiceSettlementStatus
}

export interface CounterpartyMetadata {
  name: string
  email?: string
  address?: string
}

export interface DtcpaySourceMetadata {
  qr: string
  amount: string
  blockchain: string
  cryptocurrency: string
  exchangeRate: string
  expiry: Date
  paidAt?: Date
  transactionHash?: string
}

export interface InvoiceDetails {
  subtotal?: string
  taxTotal?: string
  items: InvoiceItem[]
}
