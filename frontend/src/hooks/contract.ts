import { BigNumber, ethers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

export const isAllowed = async (
  tokenContract: Contract | null,
  myAddress?: string | null,
  disperse?: string | null
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  try {
    const allowance = tokenContract && (await tokenContract?.functions.allowance(myAddress as string, disperse))
    const isAllowance = allowance && BigNumber.from(allowance?.toString())
    return isAllowance && isAllowance._hex !== '0x00'
  } catch (error) {
    sentryCaptureException(error)
    return false
  }
}
