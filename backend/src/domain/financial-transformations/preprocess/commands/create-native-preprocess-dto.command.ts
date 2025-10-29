import { Injectable } from '@nestjs/common'
import { hexToNumberString } from 'web3-utils'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import {
  CreateEvmPreprocessDtoParams,
  CreatePreprocessDtoCommand,
  PreprocessTypeOrderEnum
} from '../strategies/interfaces'

@Injectable()
export class CreateNativePreprocessDtoCommand implements CreatePreprocessDtoCommand {
  constructor(private readonly dataProviderFactory: IngestionDataProviderFactory) {}

  async execute(params: CreateEvmPreprocessDtoParams): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const results: CreateFinancialTransactionPreprocessDto[] = []
    const provider = this.dataProviderFactory.getProvider(params.blockchainId)

    const cryptocurrencyCoin = currencyHelper.getCryptocurrencyCoin(params.cryptocurrencies, params.blockchainId)

    if (!cryptocurrencyCoin) {
      throw new Error(`Cryptocurrency coin not found for blockchain ${params.blockchainId}`)
    }

    const amount = currencyHelper.formatAmountForCryptocurrency(
      hexToNumberString(params.receipt.value),
      cryptocurrencyCoin,
      params.blockchainId
    )

    if (!amount.isZero()) {
      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: `${params.transactionHash}:${params.blockchainId}:external`,
        typeOrder: PreprocessTypeOrderEnum.NATIVE_TYPE_ORDER,
        order: 0,
        hash: params.transactionHash,
        blockchainId: params.blockchainId,
        fromAddress: params.receipt.fromAddress,
        toAddress: params.receipt.toAddress,
        initiatorAddress: params.receipt.fromAddress,
        cryptocurrency: cryptocurrencyCoin,
        cryptocurrencyAmount: amount.toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(params.receipt.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }

      // https://arbiscan.io/tx/0xd921c06aa336c2fbd5d064c6654a4a546d5724f239d90e6eef45d702da2e044f
      // Arbitrum createRetryableTicket function from ArbRetryableTx is assumed to move the value to the from address
      if (
        params.blockchainId === 'arbitrum_one' &&
        params.receipt.toAddress === '0x000000000000000000000000000000000000006e'
      ) {
        dto.toAddress = params.receipt.fromAddress
        dto.fromAddress = params.receipt.toAddress
      }

      results.push(dto)
    }

    const evmTraces = await provider.getTransactionTraces(params)

    for (const evmTrace of evmTraces) {
      const traceAmount = currencyHelper.formatAmountForCryptocurrency(
        evmTrace.value,
        cryptocurrencyCoin,
        params.blockchainId
      )
      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: `${params.transactionHash}:${params.blockchainId}:internal:${evmTrace.traceIndex}`,
        typeOrder: PreprocessTypeOrderEnum.INTERNAL_TYPE_ORDER,
        order: evmTrace.traceIndex,
        hash: params.transactionHash,
        blockchainId: params.blockchainId,
        fromAddress: evmTrace.fromAddress,
        toAddress: evmTrace.toAddress,
        initiatorAddress: params.receipt.fromAddress,
        cryptocurrency: cryptocurrencyCoin,
        cryptocurrencyAmount: traceAmount.toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(evmTrace.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }
      results.push(dto)
    }

    return results
  }
}
