import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { randomUUID } from 'crypto'
import { lastValueFrom } from 'rxjs'
import { setTimeout } from 'timers/promises'
import { padLeft } from 'web3-utils'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { BlockReward } from '../interfaces'
import {
  EtherscanBlockReward,
  EtherscanBlockRewardForAddress,
  EtherscanExternalTransaction,
  EtherscanInternalTransaction,
  EtherscanLog,
  EtherscanReceipt,
  EtherscanResponse,
  EtherscanTransaction,
  EtherscanTransactionStatus
} from './interfaces'
import { SupportedBlockchains } from '../../../shared/entity-services/blockchains/interfaces'

export class EtherscanAdapter {
  private API_URL: string
  private static API_URL_MAP: { [blockchainId: string]: string } = {
    [SupportedBlockchains.ETHEREUM_MAINNET]: 'https://api.etherscan.io/api',
    [SupportedBlockchains.GOERLI]: 'https://api-goerli.etherscan.io/api',
    [SupportedBlockchains.POLYGON_MAINNET]: 'https://api.polygonscan.com/api',
    [SupportedBlockchains.BSC_MAINNET]: 'https://api.bscscan.com/api',
    [SupportedBlockchains.ARBITRUM_ONE]: 'https://api.arbiscan.io/api',
    [SupportedBlockchains.SEPOLIA]: 'https://api-sepolia.etherscan.io/api',
    [SupportedBlockchains.OPTIMISM]: 'https://api-optimistic.etherscan.io/api',
    [SupportedBlockchains.GNOSIS_CHAIN]: 'https://api.gnosisscan.io/api'
  }
  private static REQUESTS_COUNT_PER_BLOCKCHAIN: { [blockchainId: string]: number } = {}
  private static LAST_MILLISECOND_PER_BLOCKHAIN: { [blockchainId: string]: number } = {}
  private static LOCKS: { [blockchainId: string]: string } = {}
  private static LOCKS_DEFAULT_AVAILABLE_VALUE = ''
  // Their rate limit is not as simple as 1000 millisecond interval, the numbers below is after manual testing to achieve stability
  private static readonly ETHERSCAN_MILLISECONDS_RATE_LIMIT_INTERVAL = 1500

  constructor(
    private readonly apiKey: string,
    private readonly httpService: HttpService,
    private readonly blockchainId: string,
    private readonly requestPerSecond: number
  ) {
    this.API_URL = EtherscanAdapter.API_URL_MAP[blockchainId]
    if (!EtherscanAdapter.REQUESTS_COUNT_PER_BLOCKCHAIN[blockchainId]) {
      EtherscanAdapter.REQUESTS_COUNT_PER_BLOCKCHAIN[blockchainId] = 0
    }
    if (!EtherscanAdapter.LAST_MILLISECOND_PER_BLOCKHAIN[blockchainId]) {
      EtherscanAdapter.LAST_MILLISECOND_PER_BLOCKHAIN[blockchainId] = Date.now()
    }
    if (!EtherscanAdapter.LOCKS[blockchainId]) {
      EtherscanAdapter.LOCKS[blockchainId] = EtherscanAdapter.LOCKS_DEFAULT_AVAILABLE_VALUE
    }
  }

  private async wait(): Promise<void> {
    if (EtherscanAdapter.LOCKS[this.blockchainId] === EtherscanAdapter.LOCKS_DEFAULT_AVAILABLE_VALUE) {
      const uniqueIdPerRequest = randomUUID()
      EtherscanAdapter.LOCKS[this.blockchainId] = uniqueIdPerRequest
      await setTimeout(30)
      if (EtherscanAdapter.LOCKS[this.blockchainId] === uniqueIdPerRequest) {
        try {
          const now = Date.now()
          const lastMillisecond = EtherscanAdapter.LAST_MILLISECOND_PER_BLOCKHAIN[this.blockchainId]

          // Reset count when a new second starts
          if (now > lastMillisecond + EtherscanAdapter.ETHERSCAN_MILLISECONDS_RATE_LIMIT_INTERVAL) {
            EtherscanAdapter.REQUESTS_COUNT_PER_BLOCKCHAIN[this.blockchainId] = 1
            EtherscanAdapter.LAST_MILLISECOND_PER_BLOCKHAIN[this.blockchainId] = now
          } else {
            EtherscanAdapter.REQUESTS_COUNT_PER_BLOCKCHAIN[this.blockchainId]++
          }

          if (EtherscanAdapter.REQUESTS_COUNT_PER_BLOCKCHAIN[this.blockchainId] > this.requestPerSecond) {
            // Sleep until the next interval to reset the counter
            await setTimeout(EtherscanAdapter.ETHERSCAN_MILLISECONDS_RATE_LIMIT_INTERVAL)
            EtherscanAdapter.REQUESTS_COUNT_PER_BLOCKCHAIN[this.blockchainId] = 1
            EtherscanAdapter.LAST_MILLISECOND_PER_BLOCKHAIN[this.blockchainId] = Date.now()
          }
        } finally {
          // Release the lock at the end
          EtherscanAdapter.LOCKS[this.blockchainId] = EtherscanAdapter.LOCKS_DEFAULT_AVAILABLE_VALUE
        }
      } else {
        // If other function manage to get the lock first, wait for a short time and try again
        await setTimeout(100)
        await this.wait()
      }
    } else {
      // If lock is present, wait for a short time and try again
      await setTimeout(100)
      await this.wait()
    }
  }

  async getLogs(configuration: {
    contractAddress?: string
    topic0: string
    topic1: string | null
    topic2: string | null
    topic3: string | null
    page: number
    offset: number
    fromBlock?: number
  }): Promise<EtherscanLog[]> {
    if (!configuration.topic0) {
      throw new Error(`Topic0 is required`)
    }

    await this.wait()

    const contractAddressParams = configuration.contractAddress ? `&address=${configuration.contractAddress}` : ''
    const pageParams = `&page=${configuration.page ?? 1}&offset=${configuration.offset ?? 1000}`
    const fromBlockParams = configuration.fromBlock ? `&fromBlock=${configuration.fromBlock}` : ''
    const topic0Params = `&topic0=${configuration.topic0}`
    const topicParams = this.getTopicParams({
      topic1: configuration.topic1,
      topic2: configuration.topic2,
      topic3: configuration.topic3
    })

    const url = `${this.API_URL}?module=logs&action=getLogs&apikey=${this.apiKey}${contractAddressParams}${pageParams}${fromBlockParams}${topic0Params}${topicParams}`
    const axiosResponse = await lastValueFrom<AxiosResponse<EtherscanResponse<EtherscanLog[]>>>(
      this.httpService.get(url)
    )
    return this.handleResponse(axiosResponse.data)
  }

  getTopicParams(configuration: { topic1: string | null; topic2: string | null; topic3: string | null }) {
    const topic1Params = configuration.topic1 ? `&topic1=${padLeft(configuration.topic1, 64)}` : ''
    const topic2Params = configuration.topic2 ? `&topic2=${padLeft(configuration.topic2, 64)}` : ''
    const topic3Params = configuration.topic3 ? `&topic3=${padLeft(configuration.topic3, 64)}` : ''

    let additionalParams = ''
    if (configuration.topic1 && configuration.topic2) {
      additionalParams += `&topic1_2_opr=or`
    }
    if (configuration.topic1 && configuration.topic3) {
      additionalParams += `&topic1_3_opr=or`
    }
    if (configuration.topic2 && configuration.topic3) {
      additionalParams += `&topic2_3_opr=or`
    }

    return `${topic1Params}${topic2Params}${topic3Params}${additionalParams}`
  }

  async getTransactionStatus(transactionHash: string): Promise<EtherscanTransactionStatus> {
    await this.wait()

    const url = `${this.API_URL}?module=transaction&action=getstatus&txhash=${transactionHash}&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<
      AxiosResponse<EtherscanResponse<EtherscanTransactionStatus>>
    >(this.httpService.get(url))
    return this.handleResponse(etherscanTransactionStatus.data)
  }

  async getTransactionReceipt(transactionHash: string): Promise<EtherscanReceipt> {
    await this.wait()

    const url = `${this.API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${transactionHash}&apikey=${this.apiKey}`
    const etherscanReceipt = await lastValueFrom<AxiosResponse<EtherscanResponse<EtherscanReceipt>>>(
      this.httpService.get(url)
    )
    return this.handleResponse(etherscanReceipt.data)
  }

  async getTransactionByHash(transactionHash: string): Promise<EtherscanTransaction> {
    await this.wait()

    const url = `${this.API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${this.apiKey}`
    const etherscanTransaction = await lastValueFrom<AxiosResponse<EtherscanResponse<EtherscanTransaction>>>(
      this.httpService.get(url)
    )
    return this.handleResponse(etherscanTransaction.data)
  }

  async getTransactionInternalsByTransactionHash(transactionHash: string): Promise<EtherscanInternalTransaction[]> {
    await this.wait()

    const url = `${this.API_URL}?module=account&action=txlistinternal&txhash=${transactionHash}&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<
      AxiosResponse<EtherscanResponse<EtherscanInternalTransaction[]>>
    >(this.httpService.get(url))
    return this.handleResponse(etherscanTransactionStatus.data)
  }

  async getTransactionExternalsByAddress(params: {
    address: string
    fromBlock: number
    page: number
    offset: number
  }): Promise<EtherscanExternalTransaction[]> {
    await this.wait()

    const fromBlockParams = params.fromBlock ? `&startblock=${params.fromBlock}` : ''
    const url = `${this.API_URL}?module=account&action=txlist&address=${params.address}${fromBlockParams}&page=${params.page}&offset=${params.offset}&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<
      AxiosResponse<EtherscanResponse<EtherscanExternalTransaction[]>>
    >(this.httpService.get(url))
    return this.handleResponse(etherscanTransactionStatus.data)
  }

  async getTransactionInternalsByAddress(params: {
    address: string
    fromBlock: number
    page: number
    offset: number
  }): Promise<EtherscanInternalTransaction[]> {
    await this.wait()

    const fromBlockParams = params.fromBlock ? `&startblock=${params.fromBlock}` : ''
    const url = `${this.API_URL}?module=account&action=txlistinternal&address=${params.address}${fromBlockParams}&page=${params.page}&offset=${params.offset}&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<
      AxiosResponse<EtherscanResponse<EtherscanInternalTransaction[]>>
    >(this.httpService.get(url))
    return this.handleResponse(etherscanTransactionStatus.data)
  }

  handleResponse<T>(response: EtherscanResponse<T>) {
    if (response.status === '0') {
      const acceptableErrors = ['no transactions found', 'no records found']
      if (acceptableErrors.includes(response.message.toLowerCase().trim())) {
        // Etherscan returns 0 status when there are no records found
        return response.result
      }

      throw new Error(`${response.message}: ${response.result}`)
    }
    return response.result
  }

  async getBlockByNumber(blockNumber: number): Promise<BlockReward> {
    await this.wait()

    const url = `${this.API_URL}?module=block&action=getblockreward&blockno=${blockNumber}&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<AxiosResponse<EtherscanResponse<EtherscanBlockReward>>>(
      this.httpService.get(url)
    )

    const response = this.handleResponse(etherscanTransactionStatus.data)
    return {
      blockNumber: Number.parseInt(response.blockNumber),
      blockReward: response.blockReward,
      blockMiner: response.blockMiner,
      uncleInclusionReward: response.uncleInclusionReward,
      timeStamp: dateHelper.fromUnixTimestampToDate(response.timeStamp).toISOString(),
      uncles: response.uncles
    }
  }

  async getNativeBalance(address: string) {
    await this.wait()

    const url = `${this.API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<AxiosResponse<EtherscanResponse<string>>>(
      this.httpService.get(url)
    )
    return this.handleResponse(etherscanTransactionStatus.data)
  }

  async getTokensBalance(address: string, addressToken: string) {
    await this.wait()

    const url = `${this.API_URL}?module=account&action=tokenbalance&address=${address}&contractaddress=${addressToken}&tag=latest&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<AxiosResponse<EtherscanResponse<string>>>(
      this.httpService.get(url)
    )
    return this.handleResponse(etherscanTransactionStatus.data)
  }

  async getBlockRewards(params: { address: string; offset: number; page: number }) {
    await this.wait()

    const url = `${this.API_URL}?module=account&action=getminedblocks&address=${params.address}&page=${params.page}&offset=${params.offset}&apikey=${this.apiKey}`
    const etherscanTransactionStatus = await lastValueFrom<
      AxiosResponse<EtherscanResponse<EtherscanBlockRewardForAddress[]>>
    >(this.httpService.get(url))
    return this.handleResponse(etherscanTransactionStatus.data)
  }
}
