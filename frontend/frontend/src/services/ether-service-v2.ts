/* eslint-disable class-methods-use-this */
/* eslint-disable class-methods-use-this */
import { ethers, Contract, utils } from 'ethers'
import { ErrorCreatingContractInstance } from '@/shared/error-types'
// https://docs.cloud.coinbase.com/wallet-sdk/v2.0.0/docs/web3-react

export interface ISwitchNetwork {
  chainName: string
  chainId: string
  rpcUrls?: string[]
  nativeCurrency?: {
    decimals: number
    symbol: string
  }
}
class EthersServiceV2 {
  provider: ethers.providers.Web3Provider

  constructor(provider: any) {
    this.provider = new ethers.providers.Web3Provider(provider)
  }

  async getCurrentAccount(): Promise<string> {
    const accounts = await this.provider.listAccounts()
    return accounts[0] // Assuming the user is connected with at least one account
  }

  async switchNetwork({ chainName, chainId, rpcUrls, nativeCurrency }: ISwitchNetwork): Promise<void> {
    const formattedChainId = utils.hexValue(parseFloat(chainId))

    try {
      await this.provider.send('wallet_switchEthereumChain', [{ chainId: formattedChainId }])
    } catch (_switchError: any) {
      // Chain is not added to wallet - Request to add
      if (_switchError.code === 4902) {
        try {
          console.log('Adding network')
          await this.provider.send('wallet_addEthereumChain', [
            { chainId: formattedChainId, chainName, rpcUrls, nativeCurrency }
          ])
        } catch (_addError) {
          console.error('Error adding network', _addError)
        }
      } else if (_switchError.code === -32002) {
        console.log('WOOOO', _switchError.code)
        throw new Error('User has a pending network switch request', _switchError)
      }

      throw new Error('Unhandled error switching network', _switchError)
  
    }
  }

  async getContract({ contractAddress, ERC20_ABI, library }) {
    try {
      const contract = new Contract(contractAddress, ERC20_ABI, library)
      return contract
    } catch {
      throw new ErrorCreatingContractInstance(
        'Error creating contract',
        'Error creating contract instance in Ethers Service v2'
      )
    }
  }

  async isEoaWallet({ address }) {
    try {
      const code = await this.provider.getCode(address)
      if (code && code.length > 2) {
        return false
      }
      return true
    } catch {
      throw new Error('Error checking wallet type')
    }
  }

  async getTransaction({ transactionHash }) {
    try {
      const result = await this.provider.getTransaction(transactionHash)

      return result
    } catch {
      throw new Error('Error checking wallet type')
    }
  }

  async getTransactionReceipt({ transactionHash }) {
    try {
      const result = await this.provider.getTransactionReceipt(transactionHash)

      return result
    } catch {
      throw new Error('Error checking wallet type')
    }
  }
}

export default EthersServiceV2
