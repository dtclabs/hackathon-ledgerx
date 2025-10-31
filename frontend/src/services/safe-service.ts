/* eslint-disable no-useless-constructor */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import SafeServiceClient, { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

export class SafeService {
  provider: ethers.providers.JsonRpcProvider
  etherAdapter: EthersAdapter
  signer: ethers.providers.JsonRpcSigner
  safeService: SafeServiceClient

  constructor(rpcUrl: string, safeUrl: string) {
    this.initialize(rpcUrl, safeUrl)
  }

  initialize(rpcUrl: string, safeUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    this.signer = this.provider.getSigner()
    this.etherAdapter = new EthersAdapter({
      ethers,
      signer: this.signer
    })
    this.safeService = new SafeServiceClient({
      txServiceUrl: safeUrl,
      ethAdapter: this.etherAdapter
    })
  }

  updateUrls(rpcUrl: string, safeUrl: string) {
    this.initialize(rpcUrl, safeUrl)
  }
}

export class ExtendedSafeService extends SafeService {
  constructor(rpcUrl: string, safeUrl: string) {
    super(rpcUrl, safeUrl)
  }

  async getSafesByOwner({ address }: any) {
    let result = null
    try {
      result = await this.safeService.getSafesByOwner(address)
    } catch (err) {
      console.log('ERROR FETCHING SAFE OWNER: ', err)
    }
    return result
  }

  async getTransactionInfo({ safeTxHash }: any) {
    let result: any | null = null
    try {
      result = await this.safeService.getTransaction(safeTxHash)
    } catch (err) {
      console.log('ERROR FETCHING TX INFO : ', err)
    }
    return result
  }

  async confirmTransaction({ safeTxHash, signature }: { safeTxHash: string; signature: string }) {
    let result = null
    try {
      result = await this.safeService.confirmTransaction(safeTxHash, signature)
    } catch (err) {
      console.log('ERROR CONFIRMING TRANSACTION: ', err)
    }
    return result
  }

  async getSafeInfo({ address }: any): Promise<SafeInfoResponse | null> {
    let result: SafeInfoResponse | null = null
    try {
      result = await this.safeService.getSafeInfo(address)
    } catch (err) {
      console.log('ERROR FETCHING SAFE INFO: ', err)
    }
    return result
  }
}
