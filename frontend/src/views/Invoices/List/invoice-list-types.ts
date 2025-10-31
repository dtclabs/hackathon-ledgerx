export interface IInvoiceListRowProps {
  original: {
    invoiceNumber: string
    payee: string
    dueDate: string
    issueDate: string
    totalAmountFiat: string
    totalAmountToken: string
    invoiceStatus: string
    settlementStatus: string
  }
}
