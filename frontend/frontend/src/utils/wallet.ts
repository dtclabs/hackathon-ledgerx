/* eslint-disable react-hooks/rules-of-hooks */
// Set of helper functions to facilitate wallet setup
import { captureException as sentryCaptureException, captureMessage as sentryCaptureMessage } from '@sentry/nextjs'

/**
 * Prompt the user to add BSC as a network on Metamask, or switch to BSC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */

export const setupNetwork = async () => {
  const provider = window.ethereum
  if (provider) {
    const chainId = parseInt('1', 10)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })

      return true
    } catch (error: any) {
      sentryCaptureException(error)
      sentryCaptureMessage('Failed to setup the network in Metamask')
      console.error('Failed to setup the network in Metamask:', error)

      return false
    }
  } else {
    sentryCaptureMessage('Can\'t setup the BSC network on metamask because window.ethereum is undefined')
    console.error("Can't setup the BSC network on metamask because window.ethereum is undefined")
    return false
  }
}
