// import { SafeEventEmitterProvider } from '@web3auth/base'
import { ethers } from 'ethers'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
// import { IWalletProvider } from './walletProvider'

const ethProvider = (provider) => {
  const getAccounts = async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider)
      const signer = ethersProvider.getSigner()

      // Get user's Ethereum public address
      const address = await signer.getAddress()
      return [address]
    } catch (error) {
      sentryCaptureException(error)
      console.log('error', error)
      return null
    }
  }

  const getBalance = async () => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider)
      const signer = ethersProvider.getSigner()

      // Get user's Ethereum public address
      const address = await signer.getAddress()

      // Get user's balance in ether
      const balance = ethers.utils.formatEther(
        await ethersProvider.getBalance(address) // Balance is in wei
      )
      return balance
    } catch (error) {
      sentryCaptureException(error)
      console.error('Error', error)
      return null
    }
  }

  const sign = async (message: string) => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider)
      const signer = ethersProvider.getSigner()
      const res = await signer.signMessage(message)

      return res
    } catch (error) {
      sentryCaptureException(error)
      console.error('Error', error)
      return null
    }
  }

  return { getAccounts, getBalance, sign }
}

export default ethProvider
