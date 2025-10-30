import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { CreateFinancialTransactionPreprocessDto } from '../../../../shared/entity-services/financial-transactions/interfaces'
import { EvmBlockReward } from '../../../../shared/entity-services/ingestion/evm/evm-block-reward.entity'
import { EvmReceipt } from '../../../../shared/entity-services/ingestion/evm/evm-receipt.entity'
import { PreprocessRawTask } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'

export interface PreprocessStrategy {
  execute(task: PreprocessRawTask): Promise<void>
}

export interface GetTransactionsParams {
  address: string
  blockchainId: string
  startingBlockNumber: number
}

export interface CreatePreprocessDtoCommand {
  execute(
    params: CreateEvmPreprocessDtoParams | CreateEvmBlockRewardPreprocessDtoParams
  ): Promise<CreateFinancialTransactionPreprocessDto[]>
}

export enum PreprocessTypeOrderEnum {
  NATIVE_TYPE_ORDER = 0,
  INTERNAL_TYPE_ORDER = 1,
  ERC20_LOG_TYPE_ORDER = 2,
  FEE_TYPE_ORDER = 3
}

export interface CreateEvmPreprocessDtoParams {
  transactionHash: string
  blockchainId: string
  walletAddress: string
  receipt: EvmReceipt
  cryptocurrencies: Cryptocurrency[]
}

export interface CreateEvmBlockRewardPreprocessDtoParams {
  blockchainId: string
  walletAddress: string
  nativeCoin: Cryptocurrency
  evmBlockReward: EvmBlockReward
}
