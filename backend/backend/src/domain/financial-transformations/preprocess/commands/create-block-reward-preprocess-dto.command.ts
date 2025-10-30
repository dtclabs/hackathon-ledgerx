import { Injectable } from '@nestjs/common'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessSpecialAccount,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import {
  CreateEvmBlockRewardPreprocessDtoParams,
  CreatePreprocessDtoCommand,
  PreprocessTypeOrderEnum
} from '../strategies/interfaces'

@Injectable()
export class CreateBlockRewardPreprocessDtoCommand implements CreatePreprocessDtoCommand {
  constructor() {}

  async execute(params: CreateEvmBlockRewardPreprocessDtoParams): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const results: CreateFinancialTransactionPreprocessDto[] = []

    if (!params.nativeCoin) {
      throw new Error(`Cryptocurrency coin not found for blockchain ${params.blockchainId}`)
    }

    const amount = currencyHelper.formatAmountForCryptocurrency(
      params.evmBlockReward.blockReward,
      params.nativeCoin,
      params.blockchainId
    )

    const dto: CreateFinancialTransactionPreprocessDto = {
      forPublicIdGeneration: `${params.evmBlockReward.blockNumber}:${params.blockchainId}:block-reward`,
      typeOrder: PreprocessTypeOrderEnum.FEE_TYPE_ORDER,
      order: 0,
      hash: params.evmBlockReward.blockNumber.toString(),
      blockchainId: params.blockchainId,
      fromAddress: FinancialTransactionPreprocessSpecialAccount.BLOCK_REWARD_ACCOUNT,
      toAddress: params.walletAddress,
      initiatorAddress: params.walletAddress, // Temporally added like this
      cryptocurrency: params.nativeCoin,
      cryptocurrencyAmount: amount.toString(),
      valueTimestamp: dateHelper.getUTCTimestampFrom(params.evmBlockReward.blockTimestamp),
      status: FinancialTransactionPreprocessStatus.COMPLETED
    }
    results.push(dto)

    return results
  }
}
