/* eslint-disable prefer-template */
// Shorten to words based on countryLocale - For short forms like M(million) for US, L (lakh) for IN etc.
export const currencyToWord = (
  number: string,
  threshold = 1000000,
  countryLocale = 'US',
  maximumFractionDigits = 1
) => {
  if (parseFloat(number) > threshold) {
    try {
      return Intl.NumberFormat(`en-${countryLocale}`, {
        notation: 'compact',
        maximumFractionDigits
      }).format(parseFloat(number))
    } catch (err) {
      return number
    }
  } else {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(parseFloat(number))
  }
}

// Shorten to words using US always. This is currently for cryptocurrency
export const numToWord = (number: string, threshold = 1000000, maximumFractionDigits = 5) => {
  if (parseFloat(number) > threshold) {
    try {
      return Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits
      }).format(parseFloat(number))
    } catch (err) {
      return number
    }
  } else {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(parseFloat(number))
  }
}

// Format with comma and country convention- This is for tooltip on hover for fiat currency
export const formatNumberWithCommasBasedOnLocale = (number: string, countryLocale: string) => {
  try {
    return new Intl.NumberFormat(`en-${countryLocale}`, {
      maximumSignificantDigits: 8
    }).format(parseFloat(number))
  } catch {
    return number
  }
}

export const toNearestDecimal = (number: string, countryLocale = 'US', maximumFractionDigits = 8) => {
  try {
    return new Intl.NumberFormat(`en-${countryLocale}`, {
      maximumFractionDigits
    }).format(parseFloat(number))
  } catch {
    return number
  }
}

export const formatNumberString = (input) => {
  // Check if the input is empty or not a number
  if (input === '' || Number.isNaN(Number(input))) {
    return input
  }

  // Split the input into integer and decimal parts
  const parts = input.split('.')
  let integerPart = parts[0]
  const decimalPart = parts[1]

  // Format the integer part with commas
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Construct the formatted result
  let formattedResult = integerPart

  if (decimalPart !== undefined) {
    formattedResult += '.' + decimalPart
  }

  return formattedResult
}
