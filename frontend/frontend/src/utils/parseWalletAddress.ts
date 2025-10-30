import { captureException as sentryCaptureException } from '@sentry/nextjs'

export const parseWalletAddress = (_address) => {
  try {
    const firstFive = _address.slice(0, 5)
    const lastFour = _address.slice(-4)
    return `${firstFive}...${lastFour}`
  } catch (err) {
    sentryCaptureException(err)
    return '-'
  }
}

export default parseWalletAddress
