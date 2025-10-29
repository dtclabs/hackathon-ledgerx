import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { AssetTransfersWithMetadataResult } from 'alchemy-sdk/dist/src/types/types'
import { SortingOrder } from 'alchemy-sdk'
import { TransactionStatus } from '../../shared/entity-services/raw-transactions/interfaces'

export interface TransactionResponse {
  hash: string
  blockNumber: string
  blockTimestamp: string
  receipt: TransactionReceipt
  transfers: AssetTransfersWithMetadataResult[]
  internal?: AssetTransfersWithMetadataResult[]
  external?: AssetTransfersWithMetadataResult
}

export interface TransactionResponsePaginated {
  nextPageId: string
  order: SortingOrder
  direction: string
  lastBlock: string
  firstBlock: string
  response: TransactionResponse[]
}

export interface TransactionResponseExtended extends TransactionResponse {
  transactionStatus: TransactionStatus
  transactionStatusReason: string
}

export interface BlockReward {
  blockNumber: number
  timeStamp: string // ISO timestamp
  blockMiner: string
  blockReward: string
  uncles: unknown[]
  uncleInclusionReward: string
}
