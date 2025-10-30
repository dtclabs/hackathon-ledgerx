export interface GetAccessTokenFromCodeRequest {
  grant_type: string
  client_id: string
  client_secret: string
  code: string
  redirect_uri: string
}

export interface GetAccessTokenFromCodeResponse {
  access_token: string
  refresh_token: string
  id_token: string
  scope: string
  expires_in: number // millisecond
  token_type: string
}

export interface GetAccessTokenFromRefreshTokenRequest {
  grant_type: string
  client_id: string
  client_secret: string
  refresh_token: string
}

export interface GetAccessTokenFromRefreshTokenResponse {
  access_token: string
  id_token: string
  scope: string
  expires_in: number // millisecond
  token_type: string
}

export enum TaxType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage'
}

export interface Tax {
  type: string // percentage/fixed
  amount: string
}

interface PaymentInformation {
  paymentAddress: string
  chain: string
}

export enum PaymentOptionType {
  WALLET = 'wallet',
  BANK_ACCOUNT = 'bank-account'
}

interface PaymentOption {
  type: PaymentOptionType // There is no documentation on this, from whats observed is wallet/bank-account
  value: {
    currencies: string[]
    paymentInformation: PaymentInformation
  }
}

export interface RequestInvoiceItem {
  currency: string
  name: string
  quantity: number
  tax: Tax
  unitPrice: string
  discount: string
}

export interface PaymentMetadata {
  txHash: string
  chainName: string
  paymentDate: string
  isManuallyPaid: boolean
}
export interface BuyerInfo {
  email: string
  businessName: string
  firstName: string
  lastName: string
  address: any
  userId: string
}

export interface SellerInfo {
  ccRecipients: string[]
  taxRegistration: string
  email: string
  businessName: string
  firstName: string
  lastName: string
  address: any
  userId: string
}

export interface PaymentTerms {
  dueDate: string
}

export interface InvoiceLinks {
  pay: string
  view: string
  signUpAndPay: string
}

export interface RequestFinanceInvoiceResponse {
  id: string
  paymentCurrency: string
  buyerInfo: BuyerInfo
  sellerInfo: SellerInfo
  paymentAddress: string
  invoiceItems: RequestInvoiceItem[]
  attachments: any[]
  categories: any[]
  paymentTerms: PaymentTerms
  recurringRule: string
  clientId: string
  note: string
  draft: boolean
  invoiceNumber: string
  creationDate: string
  meta: {
    format: string
    version: string
  }
  createdBy: string
  paymentOptions: PaymentOption[]
  type: string
  requestId: string
  status: string
  paymentMetadata: PaymentMetadata
  events: Event[]
  miscellaneous: any
  role: string
  tags: string[]
  invoiceLinks: InvoiceLinks
}

export interface RequestFinanceCurrencyResponse {
  id: string
  symbol: string
  decimals: number
}
