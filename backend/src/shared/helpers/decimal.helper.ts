import Decimal from 'decimal.js'

export const decimalHelper = {
  formatWithDecimals
}

function formatWithDecimals(input: Decimal.Value, decimal: Decimal.Value): Decimal {
  const inputDecimal = new Decimal(input)
  const decimalValue = Decimal.pow(10, decimal)
  return inputDecimal.div(decimalValue)
}
