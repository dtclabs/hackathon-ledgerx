import { IPaginated } from '@/slice/slice-global.types'

export interface IInvoiceItem {
  name: string
  currency: string
  quantity: number | null
  amount: string
  tax?: {
    percentage?: number
    amount?: string
  }
}

export interface IInvoice {
  metadata: any
  expiredAt: string
  issuedAt: string
  viewUrl: string
  role: string
  totalAmount: string
  currency: string
  invoiceDetails: {
    items: IInvoiceItem[]
    taxTotal: string
    subtotal: string
  }
  toMetadata: {
    address?: string
    email?: string
    name: string
  }
  fromMetadata: {
    address?: string
    email?: string
    name: string
  }
  invoiceNumber: string
  sourceMetadata: any
  source: string
  status: string
  id: string
}
