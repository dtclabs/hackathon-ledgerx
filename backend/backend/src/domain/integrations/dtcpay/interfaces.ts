export interface LoginResponse {
  header: {
    code: ResponseCode
  }
  terminalId: string
  merchantId: string
  merchantInfo: {
    name: string
    country: string
    city: string
    state: string
    postalCode: string
    address: string
  }
  terminalInfo: {
    requestCurrency: Currency
  }
  channels: {
    brand: Brand
    processingCurrency: string
    module: Module
    acqRouteId: number
  }[]
}

export interface QueryPaymentDetailResponse {
  header: {
    code: ResponseCode
  }
  id: number
  brand: Brand
  dtcTimestamp: string
  exchangeRate: number
  gstAmount?: string
  gstRate?: number
  qr: string
  lastUpdatedTime: string
  merchantId: number
  merchantName: string
  module: Module
  processingAmount: string
  processingCurrency: string
  processingFee?: string
  referenceNo: string
  requestCurrency: Currency
  saleAmount?: string
  serviceAmount?: string
  serviceRate?: number
  settlementStatus: SettlementStatus
  state: PaymentTransactionState
  terminalId: number
  tipAmount?: string
  totalAmount: string
  txnExpiry: string
  acqMid: string
  acqTid: string
  receiptNumber?: string
  type: PaymentTransactionType
  truncatedPan?: string
  paymentTransactionActions: {
    isRefundable: boolean
    isVoidable: boolean
    isOverpaidRefundable: boolean
    refundableTotalAmount?: number
  }
}

export interface QueryHistoryResponse {
  header: {
    code: ResponseCode
  }
  page: {
    records: {
      id: number
      brand: Brand
      dtcTimestamp: string
      gstAmount: string
      gstRate: number
      lastUpdatedTime: string
      merchantId: number
      merchantName: string
      processingAmount: string
      processingCurrency: string
      processingFee: string
      referenceNo: string
      requestCurrency: Currency
      saleAmount: string
      serviceAmount: string
      serviceRate: number
      settlementStatus: SettlementStatus
      state: PaymentTransactionState
      terminalId: number
      tipAmount: string
      totalAmount: string
      acqMid: string
      acqTid: string
      receiptNumber: string
      type: PaymentTransactionType
      truncatedPan: string
    }[]
    current: number
    size: number
    total: number
  }
}

export interface GenerateMerchantQrResponse {
  header: {
    code: ResponseCode
  }
  id: number
  type: PaymentTransactionType
  state: PaymentTransactionState
  settlementStatus: SettlementStatus
  merchantId: number
  merchantName: string
  terminalId: number
  brand: Brand
  module: Module
  acqMid: string
  acqTid: string
  requestCurrency: Currency
  totalAmount: string
  saleAmount?: string
  serviceRate?: number
  serviceAmount?: string
  gstRate?: number
  gstAmount?: string
  tipAmount?: string
  exchangeRate: number
  processingCurrency: string
  processingAmount: string
  processingFee?: string
  referenceNo: string
  txnExpiry: string
  dtcTimestamp: string
  lastUpdatedTime: string
  qr: string
}

export enum ResponseCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  METHOD_NOT_ALLOWED = 405,
  DENIED_BY_RISK = 452,
  INVALID_TYPE = 453,
  SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  HOST_ERROR = 520
}

export enum Module {
  WECHAT = 5,
  BITCOIN = 1001,
  ETHEREUM = 1002,
  TRON = 1003,
  POLYGON = 1004
}

export enum Brand {
  UNDEFINED = 0,
  VISA = 1,
  MASTERCARD = 2,
  AMEX = 3,
  JCB = 4,
  DINERS = 5,
  DISCOVER = 6,
  CUP = 7,
  WECHAT_PAY = 101,
  ALIPAY = 102,
  GRAB_PAY = 103,
  PAY_NOW = 104,
  QUICK_PASS = 105,
  BINANCE_PAY = 106,
  CRYPTO_HOSTED = 201
}

export enum PaymentTransactionState {
  PENDING = 0,
  SUCCESS = 200,
  AUTHORIZED = 101,
  REVERSED = 301,
  DENIED = 900,
  REFUNDED = 401,
  CAPTURED = 221,
  EXPIRED = 990
}

export enum PaymentTransactionType {
  TOKENIZE = 0,
  AUTHORIZATION = 100,
  SALE = 200,
  CAPTURE = 220,
  VOID = 300,
  REFUNDED = 400,
  MERCHANT_DYNAMIC_QR = 71001,
  CONSUMER_QR = 72001
}

export enum SettlementStatus {
  PENDING = 0,
  ACQ_SETTLED = 1,
  APPROVED = 2,
  PAID = 3,
  SUBMITTED = 6,
  REJECTED = 8
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST'
}

export enum Currency {
  AUD = 'AUD',
  CNY = 'CNY',
  EUR = 'EUR',
  HKD = 'HKD',
  JPY = 'JPY',
  SGD = 'SGD',
  USD = 'USD',
  USDT = 'USDT',
  BTC = 'BTC',
  ETH = 'ETH',
  TRX = 'TRX',
  GBP = 'GBP',
  USDC = 'USDC'
}

export enum CurrencyCategory {
  FIAT = 0,
  CRYPTO = 1,
  E_MONEY = 2
}
