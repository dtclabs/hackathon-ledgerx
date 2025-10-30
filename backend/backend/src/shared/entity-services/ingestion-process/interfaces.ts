export enum IngestionProcessTypeEnum {
  ALL_TRANSFERS = 'all_transfers',
  CONTRACT_CONFIGURATION = 'contract_configuration',
  NATIVE_TRANSFERS = 'native_transfers',
  BLOCK_REWARDS = 'block_rewards',
  PARSIQ_WALLET_TRANSACTIONS = 'parsiq_wallet_transactions',
  PARSIQ_INTERNAL_AND_TOKEN_TRANSFERS = 'parsiq_internal_and_token_transfers'
}

export type IngestionProcessMetadata =
  | AlchemyIngestionTaskMetadata
  | EtherscanIngestionTaskMetadata
  | EvmNativeIngestionTaskMetadata
  | EvmLogIngestionTaskMetadata
  | EvmBlockRewardMetadata
  | ParsiqPaginationMetadata

export interface AlchemyIngestionTaskMetadata {
  nextPageId: string
  direction: 'to' | 'from'
  fromBlock: string | null
}

export interface EtherscanIngestionTaskMetadata {
  fromBlock: number | null
  page: number
  pageSize: number
}

export interface EvmIngestionPaginationMetadata {
  fromBlock: number | null
  tempBlock: number | null //<Etherscan> for case when page * pageSize > 10000 we need to use this field for request
  page: number
  pageSize: number
}

export interface EvmNativeIngestionTaskMetadata extends EvmIngestionPaginationMetadata {
  external: boolean
  traces: boolean
  saving: boolean
}

export interface EvmLogIngestionTaskMetadata extends EvmIngestionPaginationMetadata {
  logsFrom: boolean
  logsTo: boolean
  saving: boolean
}

export interface EvmBlockRewardMetadata {
  lastBlock: number | null
  page: number
  pageSize: number
}

export interface ParsiqPaginationMetadata {
  fromBlock: number | null
  offset: string
  limit: number
}
