import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { hexToNumberString } from 'web3-utils'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessSpecialAccount,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { ArbitrumReceipt } from '../../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-receipt.entity'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import {
  CreateEvmPreprocessDtoParams,
  CreatePreprocessDtoCommand,
  PreprocessTypeOrderEnum
} from '../strategies/interfaces'

@Injectable()
export class CreateFeePreprocessDtoCommand implements CreatePreprocessDtoCommand {
  constructor() {}

  async execute(params: CreateEvmPreprocessDtoParams): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const results: CreateFinancialTransactionPreprocessDto[] = []

    const cryptocurrencyCoin = currencyHelper.getCryptocurrencyCoin(params.cryptocurrencies, params.blockchainId)

    if (!cryptocurrencyCoin) {
      throw new Error(`Cryptocurrency coin not found for blockchain ${params.blockchainId}`)
    }

    const cryptocurrencyAmount = this.calculateFee(params)

    const amount = currencyHelper.formatAmountForCryptocurrency(
      cryptocurrencyAmount.toString(),
      cryptocurrencyCoin,
      params.blockchainId
    )

    if (!amount.isZero()) {
      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: `${params.transactionHash}:${params.blockchainId}:fee`,
        typeOrder: PreprocessTypeOrderEnum.FEE_TYPE_ORDER,
        order: 0,
        hash: params.transactionHash,
        blockchainId: params.blockchainId,
        fromAddress: params.receipt.fromAddress,
        toAddress: FinancialTransactionPreprocessSpecialAccount.GAS_FEE_ACCOUNT,
        initiatorAddress: params.receipt.fromAddress,
        cryptocurrency: cryptocurrencyCoin,
        cryptocurrencyAmount: amount.toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(params.receipt.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }
      results.push(dto)
    }

    return results
  }

  protected calculateFee(params: CreateEvmPreprocessDtoParams): Decimal {
    let cryptocurrencyAmount: Decimal
    // FeeStats is only for arbitrum
    const feeStats = (params.receipt as ArbitrumReceipt).feeStats
    if (feeStats) {
      const l1Calldata = new Decimal(hexToNumberString(feeStats.paid.l1Calldata))
      const l1Transaction = new Decimal(hexToNumberString(feeStats.paid.l1Transaction))
      const l2Computation = new Decimal(hexToNumberString(feeStats.paid.l2Computation))
      const l2Storage = new Decimal(hexToNumberString(feeStats.paid.l2Storage))
      return Decimal.sum(l1Calldata, l1Transaction, l2Computation, l2Storage)
    } else {
      const gasUsed = new Decimal(hexToNumberString(params.receipt.gasUsed))
      const gasPrice = new Decimal(hexToNumberString(params.receipt.gasPrice))
      return gasUsed.mul(gasPrice)
    }
  }
}
