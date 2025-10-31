/* eslint-disable no-useless-constructor */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
import { ethers } from 'ethers'
import { toChecksumAddress } from 'ethereumjs-util'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { WalletActionRejected } from '@/shared/error-types'
import { SafeSignature, SafeTransaction, TransactionOptions, TransactionResult } from '@gnosis.pm/safe-core-sdk-types'
import Safe from '@gnosis.pm/safe-core-sdk'

export interface ISafeCreateTransaction {
  transactionData: any
  options?: any
  onlyCalls?: any
}

interface ISafeService {
  library: any
}

interface IInitializeSafe {
  safeAddress: string
}

export interface IExecuteTransaction {
  safeTransaction: SafeTransaction
  options?: TransactionOptions
}

export interface ISignSafeTransaction {
  safeTransaction: SafeTransaction
  signingMethod?: 'eth_sign' | 'eth_signTypedData'
}

export interface ISignSafeTransactionHash {
  hash: string
}

const sepoliaContractNetworks: any = {
  11155111: {
    multiSendAddress: '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526',
    safeMasterCopyAddress: '0x41675C099F32341bf84BFc5382aF534df5C7461a',
    safeProxyFactoryAddress: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
    multiSendCallOnlyAddress: '0x9641d764fc13c8B624c04430C7356C1C7C8102e2'
  }
}

class SafeSdkService {
  private provider: ethers.providers.JsonRpcProvider
  etherAdapter: EthersAdapter
  signer: ethers.providers.JsonRpcSigner
  safeSdk: Safe
  safeAddress: string

  constructor({ library }: ISafeService) {
    const signer = library.getSigner()
    const ethAdapter = new EthersAdapter({
      ethers,
      signer
    })

    this.etherAdapter = ethAdapter
  }

  async initialize({ safeAddress }: IInitializeSafe) {
    console.log('Intializing Safe SDK Service')
    try {
      const id = await this.etherAdapter.getChainId()
      const contractNetworks = id === 11155111 ? sepoliaContractNetworks : undefined
      console.log('Safe SDK Service - Creating Safe')
      this.safeAddress = safeAddress
      this.safeSdk = await Safe.create({
        ethAdapter: this.etherAdapter,
        safeAddress: toChecksumAddress(safeAddress),
        ...(contractNetworks && { contractNetworks })
      })
      console.log('Safe SDK Service - Safe Created')
    } catch (error) {
      throw new Error('Safe SDK Error')
    }
  }
}

export class SafeSdk extends SafeSdkService {
  constructor({ library }: ISafeService) {
    super({ library })
  }

  async createTransaction({ transactionData, options, onlyCalls }: ISafeCreateTransaction): Promise<SafeTransaction> {
    let result = null
    try {
      result = await this.safeSdk.createTransaction({
        safeTransactionData: transactionData,
        ...(onlyCalls && onlyCalls),
        options: {
          ...options
        }
      })
    } catch (err) {
      throw new Error('Safe SDK - Error creating transaction')
    }
    return result
  }

  async getTransactionHash(transaction: SafeTransaction) {
    try {
      return await this.safeSdk.getTransactionHash(transaction)
    } catch (err) {
      throw new Error('Safe SDK - Error creating transaction')
    }
  }

  async executeTransaction({ safeTransaction, options }: IExecuteTransaction): Promise<TransactionResult> {
    try {
      return await this.safeSdk.executeTransaction(safeTransaction, options)
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        throw new WalletActionRejected('Safe SDK - User rejected transaction', 'Safe SDK - User rejected transaction')
      } else {
        throw new Error('Safe SDK - Error creating transaction')
      }
    }
  }

  async signTransaction({ safeTransaction, signingMethod }: ISignSafeTransaction): Promise<SafeTransaction> {
    try {
      return await this.safeSdk.signTransaction(safeTransaction, signingMethod)
    } catch (err: any) {
      if (err.code === 4001) {
        throw new WalletActionRejected('Safe SDK - User rejected transaction', 'Safe SDK - User rejected transaction')
      } else {
        throw new Error('Safe SDK - Error signing transaction - signTransaction')
      }
    }
  }

  async signTransactionHash({ hash }: ISignSafeTransactionHash): Promise<SafeSignature> {
    try {
      return await this.safeSdk.signTransactionHash(hash)
    } catch (err: any) {
      if (err.code === 4001) {
        throw new WalletActionRejected('Safe SDK - User rejected transaction', 'Safe SDK - User rejected transaction')
      } else {
        throw new Error('Safe SDK - Error signing transaction - signTransactionHash')
      }
    }
  }
}
