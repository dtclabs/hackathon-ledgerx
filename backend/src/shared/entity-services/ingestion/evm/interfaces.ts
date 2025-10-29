import { FeeStats } from './arbitrum/arbitrum-receipt.entity'
import { EtherscanReceipt, EtherscanTransaction } from '../../../../domain/block-explorers/etherscan/interfaces'

export interface EvmLogCreateParams {
  contractAddress: string
  blockHash: string
  blockNumber: string
  blockTimestamp: string
  blockchainId: string
  transactionHash: string
  logIndex: number
  topic0: string
  topic1: string
  topic2: string
  topic3: string
  data: string
  initiatorAddress: string
  fromAddress: string
  toAddress: string
}

export interface EvmTraceCreateParams {
  value: string
  blockNumber: number
  blockTimestamp: string
  blockchainId: string
  transactionHash: string
  fromAddress: string
  toAddress: string
  callType: string
  errorCode: string
  gas: string
  gasUsed: string
  input: string
  status: string
  traceId: string
  traceIndex: number
}

export interface EvmReceiptCreateParams {
  blockHash: string
  blockNumber: number
  blockTimestamp: string
  blockchainId: string
  transactionHash: string
  fromAddress: string
  toAddress: string
  gasUsed: string
  gasPrice: string
  status: string
  contractAddress: string
  transactionIndex: string
  input: string
  nonce: string
  value: string
  type: string
  feeStats?: FeeStats
  raw: {
    receipt: EtherscanReceipt
    transaction: EtherscanTransaction
  }
}

export interface OptimismEvmReceiptCreateParams extends EvmReceiptCreateParams {
  l1Fee: string
  l1FeeScalar: string
  l1GasPrice: string
  l1GasUsed: string
}

export interface EvmTransactionDetailCreateParams {
  hash: string
  blockchainId: string
  methodId?: string
  functionName?: string
  errorDescription?: string
}

export interface EvmAddressTransactionCreateParams {
  transactionHash: string
  blockNumber: number
  blockchainId: string
  address: string
  contractConfigurationId: string
}

export interface EvmBlockRewardCreateParams {
  validatedByAddress: string
  blockNumber: number
  blockTimestamp: string
  blockchainId: string
  blockReward: string
}

export interface EvmAddressTransactionGetByBatchParams {
  address: string
  contractConfigurationId: string
  blockchainId: string
  pageSize: number
}

export interface EvmTransactionEntitiesGetParams {
  transactionHash: string
  blockchainId: string
}

export interface EvmTransactionEntitiesGetByBatchesParams {
  address: string
  blockchainId: string
  limit: number
  skip: number
  startingBlockNumber: number
}

export interface EvmGetTransactionHashesResult {
  blockNumber: number
  transactionHash: string
}

export interface EvmGetContractAddressesFromLogsParams {
  address: string
  blockchainId: string
  transactionHashes: string[]
}

export interface EvmGetBlockRewardParams {
  validatedByAddress: string
  blockchainId: string
}

export enum EvmTraceStatusEnum {
  FAILED = '1',
  SUCCESS = '0'
}

export enum EvmReceiptStatusEnum {
  FAILED = '0x0',
  SUCCESS = '0x1'
}
