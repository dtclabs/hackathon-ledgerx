// https://docs.request.finance/invoices#fetching-an-invoice
export enum RequestFinanceInvoiceStatus {
  PAID = 'paid',
  OPEN = 'open',
  ACCEPTED = 'accepted',
  DECLARED_PAID = 'declaredPaid',
  CANCELED = 'canceled',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  DRAFT = 'draft'
}

export const RequestFinanceInvoiceStatusGroups = {
  TERMINAL_STATE: [
    RequestFinanceInvoiceStatus.PAID,
    RequestFinanceInvoiceStatus.CANCELED,
    RequestFinanceInvoiceStatus.REJECTED
  ],
  NON_TERMINAL_STATE: [
    RequestFinanceInvoiceStatus.OPEN,
    RequestFinanceInvoiceStatus.ACCEPTED,
    RequestFinanceInvoiceStatus.DECLARED_PAID,
    RequestFinanceInvoiceStatus.SCHEDULED,
    RequestFinanceInvoiceStatus.DRAFT
  ]
}

export enum RequestFinanceInvoiceRole {
  SELLER = 'seller',
  BUYER = 'buyer'
}
