/* eslint-disable no-useless-constructor */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient, {
  ProposeTransactionProps,
  SafeBalanceResponse,
  SafeInfoResponse,
  SignatureResponse
} from '@gnosis.pm/safe-service-client'
import { NoWalletFound } from '@/shared/error-types'

export class SafeInfoError extends Error {
  readonly type = 'SafeInfoError'

  constructor(message: string) {
    super(message)
    this.name = 'SafeInfoError'
  }
}

export class SafeBalanceError extends Error {
  readonly type = 'SafeBalanceError'

  constructor(message: string) {
    super(message)
    this.name = 'SafeBalanceError'
  }
}

export interface ISafeConfirmTransaction {
  safeTxHash: string
  signature: string
}

interface ISafeClientService {
  rpcUrl: string
  safeUrl: string
}
class SafeClientService {
  provider: ethers.providers.JsonRpcProvider
  etherAdapter: EthersAdapter
  signer: ethers.providers.JsonRpcSigner
  safeClient: SafeServiceClient

  constructor({ rpcUrl, safeUrl }: ISafeClientService) {
    this.initialize({ rpcUrl, safeUrl })
  }

  initialize({ rpcUrl, safeUrl }: ISafeClientService) {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl)
      this.signer = this.provider.getSigner()
      this.etherAdapter = new EthersAdapter({
        ethers,
        signer: this.signer
      })
      this.safeClient = new SafeServiceClient({
        txServiceUrl: safeUrl,
        ethAdapter: this.etherAdapter
      })
    } catch (error) {
      console.log('Safe Client Serivce Error', error)
      throw new Error('Safe Client Serivce Error')
    }
  }

  updateUrls({ rpcUrl, safeUrl }: ISafeClientService) {
    this.initialize({ rpcUrl, safeUrl })
  }
}

export class SafeClient extends SafeClientService {
  constructor({ rpcUrl, safeUrl }: ISafeClientService) {
    super({ rpcUrl, safeUrl })
  }

  async getSafesByOwner({ address }: any) {
    let result = null
    try {
      result = await this.safeClient.getSafesByOwner(address)
    } catch (err) {
      console.log('ERROR FETCHING SAFE OWNER: ', err)
    }
    return result
  }

  async getPendingTransactions({ address }: any) {
    let result = null
    try {
      result = await this.safeClient.getPendingTransactions(address)
    } catch (err) {
      console.log('ERROR FETCHING SAFE TRANSACTIONS: ', err)
    }
    return result
  }

  async getSafeCreationInfo({ address }: any) {
    let result = null
    try {
      result = await this.safeClient.getSafeCreationInfo(address)
    } catch (err) {
      throw new NoWalletFound({ message: 'Error fetching Safe Creation Info', sourceId: null })  
    }
    return result
  }

  async getNextNonce({ address }: any) {
    let result = null
    try {
      result = await this.safeClient.getNextNonce(address)
    } catch (err) {
      console.log('ERROR FETCHING SAFE Nonce: ', err)
    }
    return result
  }

  async getTransactionInfo({ safeTxHash }: any) {
    let result: any | null = null
    try {
      result = await this.safeClient.getTransaction(safeTxHash)
    } catch (err) {
      console.log('ERROR FETCHING TX INFO : ', err)
    }
    return result
  }

  async confirmTransaction({ safeTxHash, signature }: ISafeConfirmTransaction): Promise<SignatureResponse> {
    try {
      return await this.safeClient.confirmTransaction(safeTxHash, signature)
    } catch (err) {
      throw new Error('Error confirming transaction')
    }
  }

  async getSafeInfo({ address }: any): Promise<SafeInfoResponse | null> {
    try {
      return await this.safeClient.getSafeInfo(address)
    } catch (err) {
      throw new SafeInfoError('Error fetching Safe Info')
    }
  }

  async getBalances({ address }: any): Promise<SafeBalanceResponse[] | null> {
    try {
      return await this.safeClient.getBalances(address)
    } catch (err) {
      throw new SafeBalanceError('Error fetching Safe Balances')
    }
  }

  async decodeData({ data }: any): Promise<any | null> {
    try {
      return await this.safeClient.decodeData(data)
    } catch (err) {
      throw new SafeBalanceError('Error Decoding Safe Data')
    }
  }

  async proposeTransaction(data: ProposeTransactionProps): Promise<void> {
    try {
      return await this.safeClient.proposeTransaction(data)
    } catch (err) {
      console.log('ERROR PROPOSING SAFE TRANSACTION: ', err)
      throw new SafeBalanceError('Error Proposing Safe Transaction')
    }
  }
}
