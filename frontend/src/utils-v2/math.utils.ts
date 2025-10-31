export const sumStringAndDecimalArray = (arr) => {
  // Determine the maximum number of decimal places in the input
  const maxDecimals = arr.reduce((max, item) => {
    const decimalPart = item.split('.')[1]
    const numDecimals = decimalPart ? decimalPart.length : 0
    return Math.max(max, numDecimals)
  }, 0)

  // Calculate the sum using reduce
  const sum = arr.reduce((acc, current) => {
    const num = Number(current)
    return !Number.isNaN(num) ? acc + num : acc
  }, 0)

  // Format the sum to the maximum number of decimal places found
  return sum.toFixed(maxDecimals)
}
