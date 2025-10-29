import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { HttpService } from '@nestjs/axios'
import { Alchemy, AssetTransfersCategory, Network, SortingOrder, TokenBalanceType } from 'alchemy-sdk'
import {
  AssetTransfersWithMetadataParams,
  AssetTransfersWithMetadataResponse,
  AssetTransfersWithMetadataResult,
  TokenBalance
} from 'alchemy-sdk/dist/src/types/types'
import { BigNumber } from 'ethers'
import { hexToNumber, hexToNumberString, numberToHex } from 'web3-utils'
import { TransactionResponse, TransactionResponsePaginated } from '../interfaces'
import { AddressBalance } from '../types/balance'
import { FeatureMapType } from '../types/feature-key.type'
import { AlchemySyncMetaData } from '../types/sync-meta-data.type'
import { alchemyUtils } from './alchemy.utils'
import { lastValueFrom } from 'rxjs'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { AlchemyResponse } from './interfaces'
import { SupportedBlockchains } from '../../../shared/entity-services/blockchains/interfaces'
import { setTimeout } from 'timers/promises'
import { LoggerService } from '../../../shared/logger/logger.service'

export class AlchemyAdapter {
  private readonly NETWORK: Network
  private API_URL: string
  private API_URL_MAP: { [blockchainId: string]: string } = {
    [SupportedBlockchains.ETHEREUM_MAINNET]: 'https://eth-mainnet.g.alchemy.com/v2/',
    [SupportedBlockchains.GOERLI]: 'https://eth-goerli.g.alchemy.com/v2/',
    [SupportedBlockchains.ARBITRUM_ONE]: 'https://arb-mainnet.g.alchemy.com/v2/',
    [SupportedBlockchains.SEPOLIA]: 'https://eth-sepolia.g.alchemy.com/v2/',
    [SupportedBlockchains.OPTIMISM]: 'https://opt-mainnet.g.alchemy.com/v2/'
  }
  private static BALANCE_CACHE: Map<string, string> = new Map()
  private static readonly MAX_CACHE_SIZE = 100

  readonly MAX_BATCH_SIZE = 100
  client: Alchemy

  constructor(
    private readonly keys: FeatureMapType,
    private readonly httpService: HttpService,
    blockchainId: string,
    private readonly loggerService: LoggerService
  ) {
    this.NETWORK = alchemyUtils.getNetworkByChainId(blockchainId)
    this.client = alchemyUtils.getAlchemyClient(this.NETWORK, this.keys.INGESTION)
    this.API_URL = this.API_URL_MAP[blockchainId] + this.keys.INGESTION
  }

  async getTransactionsByAddress(
    address: string,
    meta: AlchemySyncMetaData,
    validatorFn: (hash: string) => Promise<{ loadInternal: boolean; loadReceipt: boolean }>
  ): Promise<TransactionResponsePaginated> {
    const transfers = await this.client.core.getAssetTransfers({
      toAddress: meta.direction === 'to' ? address : undefined,
      fromAddress: meta.direction === 'from' ? address : undefined,
      fromBlock: meta.fromBlock || undefined,
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.INTERNAL],
      toBlock: 'latest',
      maxCount: this.MAX_BATCH_SIZE,
      withMetadata: true,
      excludeZeroValue: false,
      pageKey: meta.nextPageId || undefined,
      order: SortingOrder.DESCENDING
    })
    const transactions = this.groupBy(transfers.transfers, (transfer) => transfer.hash)

    const response: TransactionResponse[] = []
    for (const hash in transactions) {
      const transactionResponse = await this.getTransactionResponse(transactions[hash], validatorFn)
      response.push(transactionResponse)
    }

    return {
      nextPageId: transfers.pageKey,
      order: SortingOrder.DESCENDING,
      direction: meta.direction,
      lastBlock: this.getLastBlockNumber(transfers.transfers),
      firstBlock: this.getFirstBlockNumber(transfers.transfers),
      response
    }
  }

  private async getTransactionResponse(
    transfers: AssetTransfersWithMetadataResult[],
    validatorFn: (hash: string) => Promise<{
      loadInternal: boolean
      loadReceipt: boolean
    }>
  ) {
    // We are getting first event, we need to collect all context as possible
    //TODO: we can optimize that by getting receipt and internal transfers only if we haven't got it before
    const transfer = transfers[0]

    const { loadInternal, loadReceipt } = await validatorFn(transfer.hash)

    let getReceiptTask: Promise<TransactionReceipt> = Promise.resolve(null)
    if (transfer && loadReceipt) {
      getReceiptTask = this.getTransactionReceipt(transfer.hash)
    }

    //We are getting all internal transfers for address forwarding case.
    //example: https://etherscan.io/tx/0x7f4a9c0551ebaea77dbffdc2750df89bfe90d882b0e96446167a3abecb76b349
    let getInternalTask: AssetTransfersWithMetadataResult[] = null
    if (transfer && loadInternal) {
      getInternalTask = await this.getInternalTransactionsByTxHash({
        txHash: transfer.hash,
        blockNumber: transfer.blockNum
      })
    }

    // We need external transfer for solving issue with internal transfers.
    // When there is possibility that one wallet overrides TXs from another wallet during preprocess
    // see for more details https://app.clickup.com/t/86794rtq3
    // We are loading External transfer only of there are none (this is for reducing amounts of calls)
    let getExternalTransferTask: AssetTransfersWithMetadataResult = null
    const isAnyExternalTransfer = transfers.some((transfer) => transfer.category === AssetTransfersCategory.EXTERNAL)
    if (transfer && !isAnyExternalTransfer) {
      getExternalTransferTask = await this.getExternalTransferByHash({
        txHash: transfer.hash,
        blockNumber: transfer.blockNum
      })
    }

    const [receipt, internal, external] = await Promise.all([getReceiptTask, getInternalTask, getExternalTransferTask])

    const transactionResponse: TransactionResponse = {
      hash: transfer.hash,
      blockNumber: transfer.blockNum,
      blockTimestamp: transfer.metadata.blockTimestamp,
      receipt,
      transfers: transfers,
      internal,
      external
    }
    return transactionResponse
  }

  groupBy<T, K extends keyof any>(list: T[], getKey: (item: T) => K): Record<K, T[]> {
    return list.reduce((previous, currentItem) => {
      const group = getKey(currentItem)
      if (!previous[group]) {
        previous[group] = []
      }
      previous[group].push(currentItem)
      return previous
    }, {} as Record<K, T[]>)
  }

  getLastBlockNumber(transfers: AssetTransfersWithMetadataResult[]): string | null {
    return transfers.reduce((prev: string, current) => {
      if (!prev) {
        return current.blockNum
      }
      return this.isBiggerNumber(prev, current) ? prev : current.blockNum
    }, null)
  }

  private isBiggerNumber(prev: string, current: AssetTransfersWithMetadataResult) {
    const prevBlock = hexToNumber(prev)
    const currentBlock = hexToNumber(current.blockNum)

    return prevBlock > currentBlock
  }

  getFirstBlockNumber(transfers: AssetTransfersWithMetadataResult[]): string | null {
    return transfers.reduce((prev: string, current) => {
      if (!prev) {
        return current.blockNum
      }
      return this.isBiggerNumber(prev, current) ? current.blockNum : prev
    }, null)
  }

  public async getInternalTransactionsByTxHash(params: {
    txHash: string
    blockNumber: string
  }): Promise<AssetTransfersWithMetadataResult[]> {
    const transfers = await this.getAssetTransfers({
      toBlock: params.blockNumber,
      fromBlock: params.blockNumber,
      category: [AssetTransfersCategory.INTERNAL],
      withMetadata: true,
      excludeZeroValue: true,
      order: SortingOrder.DESCENDING
    })

    return transfers.transfers.filter((transfer) => transfer.hash === params.txHash)
  }

  public async getBalance(address: string): Promise<AddressBalance[]> {
    const tokenBalances = await this.getAllTokenBalances(address)
    const nativeCoinBalance = await this.client.core.getBalance(address)

    const balances: AddressBalance[] = []

    //Alchemy returns tokens address even if balance is 0, so we exclude them
    if (!nativeCoinBalance.isZero()) {
      balances.push({
        tokenAddress: null,
        balance: nativeCoinBalance.toString()
      })
    }

    for (const tokenBalance of tokenBalances) {
      if (tokenBalance.tokenBalance === '0x') {
        //   Very old tokens (probably unsupported anymore) can have "0x" value as balance (invalid format for hex), we are skipping them.
        continue
      }
      const balance = BigNumber.from(tokenBalance.tokenBalance)

      balances.push({
        tokenAddress: tokenBalance.contractAddress,
        balance: balance.toString()
      })
    }

    return balances
  }

  public async getAllTokenBalances(address: string): Promise<TokenBalance[]> {
    const recursive = async (pageKey?: string) => {
      const totalBalances: TokenBalance[] = []
      const tokenBalancesResponse = await this.client.core.getTokenBalances(address, {
        pageKey: pageKey || undefined,
        type: TokenBalanceType.ERC20
      })
      totalBalances.push(...tokenBalancesResponse.tokenBalances)
      if (tokenBalancesResponse.pageKey) {
        totalBalances.push(...(await recursive(tokenBalancesResponse.pageKey)))
      }
      return totalBalances
    }

    return recursive()
  }

  public getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    return this.client.core.getTransactionReceipt(txHash)
  }

  async getExternalTransferByHash(params: {
    txHash: string
    blockNumber: string
  }): Promise<AssetTransfersWithMetadataResult | null> {
    const recursiveForPagination = async (pageKey?: string) => {
      const transfersResponse = await this.getAssetTransfers({
        toBlock: params.blockNumber,
        fromBlock: params.blockNumber,
        category: [AssetTransfersCategory.EXTERNAL],
        withMetadata: true,
        excludeZeroValue: true,
        order: SortingOrder.DESCENDING,
        pageKey: pageKey || undefined
      })
      const externalTransfer = transfersResponse.transfers.find((transfer) => transfer.hash === params.txHash)

      if (externalTransfer) {
        return externalTransfer
      }

      if (transfersResponse.pageKey) {
        return recursiveForPagination(transfersResponse.pageKey)
      }

      return null
    }
    return recursiveForPagination()
  }

  async getTransactionReceiptViaAPI(txHash: string): Promise<TransactionReceipt> {
    const requestBody = {
      id: 1,
      jsonrpc: '2.0',
      params: [txHash],
      method: 'eth_getTransactionReceipt'
    }

    const alchemyApiResponse = await lastValueFrom<AxiosResponse<AlchemyResponse<TransactionReceipt>>>(
      this.httpService.post(this.API_URL, requestBody)
    )

    return alchemyApiResponse?.data?.result ?? null
  }

  public async getBalanceByBlockNumberViaAPI(address: string, blockNumber: number): Promise<string> {
    const cacheKey = `${address}-${blockNumber}`

    if (!AlchemyAdapter.BALANCE_CACHE.has(cacheKey)) {
      const blockNumberInHex = numberToHex(blockNumber)

      const requestBody = {
        id: 1,
        jsonrpc: '2.0',
        params: [address, blockNumberInHex],
        method: 'eth_getBalance'
      }

      const alchemyApiResponse = await lastValueFrom<AxiosResponse<AlchemyResponse<string>>>(
        this.httpService.post(this.API_URL, requestBody)
      )

      if (!alchemyApiResponse?.data?.result) {
        throw new Error('Alchemy get balance API error ' + JSON.stringify(alchemyApiResponse?.data))
      }

      // Check if the cache size exceeds the maximum limit and remove the oldest entry (first element in the Map)
      if (AlchemyAdapter.BALANCE_CACHE.size >= AlchemyAdapter.MAX_CACHE_SIZE) {
        const oldestKey = AlchemyAdapter.BALANCE_CACHE.keys().next().value
        AlchemyAdapter.BALANCE_CACHE.delete(oldestKey)
      }

      const balance = hexToNumberString(alchemyApiResponse?.data?.result)

      AlchemyAdapter.BALANCE_CACHE.set(cacheKey, balance)
    }

    return AlchemyAdapter.BALANCE_CACHE.get(cacheKey)
  }

  async getAssetTransfers(
    params: AssetTransfersWithMetadataParams,
    counter = 0
  ): Promise<AssetTransfersWithMetadataResponse> {
    try {
      const requestBody = {
        id: 1,
        jsonrpc: '2.0',
        params: [
          {
            ...params,
            maxCount: numberToHex(params.maxCount)
          }
        ],
        method: 'alchemy_getAssetTransfers'
      }
      const alchemyApiResponse = await lastValueFrom<
        AxiosResponse<AlchemyResponse<AssetTransfersWithMetadataResponse>>
      >(this.httpService.post(this.API_URL, requestBody))
      return alchemyApiResponse?.data?.result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        // Not found error
        if (axiosError?.response?.status === 429) {
          if (counter > 5) {
            throw error
          }
          this.loggerService.info(`Rate limit exceeded, retrying in 600ms. Attempt ${counter}`)
          await setTimeout(600)
          return this.getAssetTransfers(params, ++counter)
        }
      }
      throw error
    }
  }
}
