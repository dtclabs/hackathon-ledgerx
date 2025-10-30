/* eslint-disable no-else-return */
export const calculateInvoiceTotal = (_items) => {
  let total = 0
  if (_items && _items.length > 0) {
    _items.forEach((item, index) => {
      // @ts-ignore
      const quantity = item?.quantity ?? 0
      // @ts-ignore
      const unitPrice = item?.unitPrice ?? 0
      // @ts-ignore
      total += quantity * unitPrice
    })
  }
  return total !== 0 ? total : 0
}

export const INVOICE_SESSION_STORAGE = {
  CREATED: 'CREATED_INVOICE_ID',
  CREATED_INVOICE_NUMBER: 'CREATED_INVOICE_NUMBER',
  LIST: 'SESSION_INVOICES'
}

export const STATUS_COLOR_MAP = {
  pending: 'gray',
  paid: 'success',
  settled: 'success',
  cancelled: 'error',
  expired: 'error'
}

export const INVOICE_STATUS_MAP = {
  created: 'created',
  pending: 'pending',
  paid: 'paid',
  cancelled: 'cancelled',
  expired: 'expired'
}

export const SETTLEMENT_STATUS = {
  pending: 'pending',
  settled: 'settled',
  cancelled: 'cancelled'
}

export const calculateTotalAmount = ({ quantity, unitPrice }) => {
  const result = (quantity ?? 0) * (unitPrice ?? 0)
  return Number.isNaN(result) ? 0 : result
}

export const calculateInvoiceItemByTax = ({ quantity, unitPrice, taxType, tax }) => {
  if (!taxType || taxType === 'none' || taxType === 'inclusive') {
    const totalAmount = calculateTotalAmount({ quantity, unitPrice })
    return totalAmount
  } else if (taxType === 'exclusive') {
    const totalAmount = calculateTotalAmount({ quantity, unitPrice })
    const taxableAmount = (totalAmount * tax) / 100
    return totalAmount + taxableAmount
  }
  return 0
}

export const calculateAllFieldsTotalAmount = (_fields) => {
  let total = 0

  _fields?.forEach((field, index) => {
    const quantity = field.quantity ?? 0
    const unitPrice = field.amount ?? 0
    total += parseFloat(quantity) * parseFloat(unitPrice)
  })

  return Number.isNaN(total) ? 0 : total
}

export const calculateAllFieldsTaxTotalAmount = (_fields) => {
  let total = 0

  _fields?.forEach((field, index) => {
    const quantity = field.quantity ?? 0
    const unitPrice = field.amount ?? 0

    const itemTotal = parseFloat(quantity) * parseFloat(unitPrice)
    const taxTotal = (itemTotal * (field?.tax?.amount ?? field.tax)) / 100
    total += taxTotal
  })

  return Number.isNaN(total) ? 0 : total
}

export const calculateInvoiceTotalByTax = (_items, taxType) => {
  if (!taxType || taxType === 'none') {
    const totalAmount = calculateAllFieldsTotalAmount(_items)
    return {
      subtotal: totalAmount,
      taxTotal: 0,
      total: totalAmount
    }
  } else if (taxType === 'exclusive') {
    const totalAmount = calculateAllFieldsTotalAmount(_items)
    const taxTotal = calculateAllFieldsTaxTotalAmount(_items)
    return {
      subtotal: totalAmount,
      taxTotal,
      total: totalAmount + taxTotal
    }
  } else if (taxType === 'inclusive') {
    const totalAmount = calculateAllFieldsTotalAmount(_items)
    const taxTotal = calculateAllFieldsTaxTotalAmount(_items)
    return {
      subtotal: totalAmount,
      taxTotal,
      total: totalAmount
    }
  }
  return {
    subtotal: 0,
    taxTotal: 0,
    total: 0
  }
}
