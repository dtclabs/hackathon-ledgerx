import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { catchError, firstValueFrom, lastValueFrom, map, of } from 'rxjs'
import { toChecksumAddress } from 'web3-utils'
import { GnosisService } from '../../../shared/constants'
import { LoggerService } from '../../../shared/logger/logger.service'
import {
  GnosisMultisigResponse,
  GnosisMultisigTransaction,
  GnosisSafeCreation,
  GnosisSafeInfo,
  GnosisTokenBalance,
  GnosisValueDecoded,
  GnosisWalletInfo,
  SafeOwnerState
} from './interfaces'
import axios, { AxiosError } from 'axios'

@Injectable()
export class GnosisProviderService {
  constructor(private httpService: HttpService, private logger: LoggerService) {}

  async getSafeGnosis(params: { blockchainId: string; address: string }): Promise<GnosisWalletInfo | null> {
    const checkSumAddress = toChecksumAddress(params.address)
    const url = `${GnosisService[params.blockchainId]}/v1/safes/${checkSumAddress}`
    return firstValueFrom(
      this.httpService.get(url).pipe(
        map((res) => {
          if (res.data) {
            const owners = res.data.owners
            return {
              blockchainId: params.blockchainId,
              threshold: res.data.threshold,
              nonce: res.data.nonce,
              ownerAddresses: owners.map((owner) => ({ name: '', address: owner, state: SafeOwnerState.CURRENT }))
            } as GnosisWalletInfo
          }
          return null
        }),
        catchError((err) => {
          this.logger.error(`Error getting gnosis safe info for ${params.address}`, err, {
            url,
            checkSumAddress
          })
          return of(null)
        })
      )
    )
  }

  async getBalance(params: { blockchainId: string; address: string }): Promise<GnosisTokenBalance[]> {
    const checkSumAddress = toChecksumAddress(params.address)
    const url = `${GnosisService[params.blockchainId]}/v1/safes/${checkSumAddress}/balances`
    return lastValueFrom(
      this.httpService.get<GnosisTokenBalance[]>(url).pipe(
        map((res) =>
          res.data.map((balance) => ({
            ...balance,
            tokenAddress: balance.tokenAddress?.toLowerCase() ?? null
          }))
        )
      )
    )
  }

  getExecutedMultisigTransaction(params: {
    blockchainId: string
    address: string
    hash: string
  }): Promise<GnosisMultisigTransaction | null> {
    const checkSumAddress = toChecksumAddress(params.address)
    let url = `${
      GnosisService[params.blockchainId]
    }/v1/safes/${checkSumAddress}/multisig-transactions/?transaction_hash=${params.hash}&executed=true`
    return lastValueFrom(
      this.httpService.get<GnosisMultisigResponse>(url).pipe(map((res) => res.data?.results?.[0] ?? null))
    )
  }

  getMultisigTransaction(params: {
    blockchainId: string
    safeHash: string
  }): Promise<GnosisMultisigTransaction | null> {
    try {
      let url = `${GnosisService[params.blockchainId]}/v1/multisig-transactions/${params.safeHash}`
      return lastValueFrom(
        this.httpService.get<GnosisMultisigTransaction | null>(url).pipe(
          map((res) => res.data ?? null),
          catchError((err) => {
            if (axios.isAxiosError(err)) {
              const axiosError = err as AxiosError
              // Not found error
              if (axiosError?.response?.status === 404) {
                return of(null)
              }
            }
            throw err
          })
        )
      )
    } catch (e: Error | AxiosError | any) {
      throw e
    }
  }

  getPendingMultisigTransactions(params: {
    blockchainId: string
    address: string
    nonce?: number
  }): Promise<GnosisMultisigTransaction[]> {
    const checkSumAddress = toChecksumAddress(params.address)
    let url = `${
      GnosisService[params.blockchainId]
    }/v1/safes/${checkSumAddress}/multisig-transactions?trusted=true&executed=false`
    if (params.nonce) {
      url += `&nonce__gte=${params.nonce}`
    }
    return lastValueFrom(this.httpService.get<GnosisMultisigResponse>(url).pipe(map((res) => res.data?.results || [])))
  }

  async isGnosisSafe(params: { blockchainId: string; address: string }) {
    const checkSumAddress = toChecksumAddress(params.address)
    const url = `${GnosisService[params.blockchainId]}/v1/safes/${checkSumAddress}`
    try {
      const response = await lastValueFrom(this.httpService.get<GnosisSafeInfo>(url).pipe(map((res) => res.data)))
      return !!response.address
    } catch (error) {
      return false
    }
  }

  async getCurrentNonce(params: { blockchainId: string; address: string }): Promise<number> {
    const safeGnosis = await this.getSafeGnosis(params)
    return safeGnosis?.nonce
  }

  isOnChainRejection(valueDecoded: GnosisValueDecoded) {
    return !valueDecoded.dataDecoded && valueDecoded.value === '0'
  }

  isNativeTransfer(valueDecoded: GnosisValueDecoded) {
    return !valueDecoded.dataDecoded && valueDecoded.value !== '0'
  }

  async getCreationInfo(params: { blockchainId: string; address: string }) {
    const checkSumAddress = toChecksumAddress(params.address)
    const url = `${GnosisService[params.blockchainId]}/v1/safes/${checkSumAddress}/creation`

    return lastValueFrom(this.httpService.get<GnosisSafeCreation>(url).pipe(map((res) => res.data)))
  }
}
