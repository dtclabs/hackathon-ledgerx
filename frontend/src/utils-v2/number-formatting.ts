export const formatNumberByLocale = (value: number | string, locale: string): string => {
  try {
    const formattedValue = new Intl.NumberFormat(locale).format(Number(value))
    return formattedValue
  } catch (error) {
    // Add logger here
    console.error(`Error formatting number: ${(error as Error).message}`)
    return '0'
  }
}
