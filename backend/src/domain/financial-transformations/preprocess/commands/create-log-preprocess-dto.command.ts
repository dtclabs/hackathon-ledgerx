import { Injectable } from '@nestjs/common'
import { numberToHex } from 'web3-utils'
import { ContractConfiguration } from '../../../../shared/entity-services/contract-configurations/contract-configuration.entity'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { EvmLog } from '../../../../shared/entity-services/ingestion/evm/evm-log.entity'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import { ingestionUtils } from '../../ingestion/ingestion.utils'
import {
  CreateEvmPreprocessDtoParams,
  CreatePreprocessDtoCommand,
  PreprocessTypeOrderEnum
} from '../strategies/interfaces'

const Web3EthAbi = require('web3-eth-abi')

@Injectable()
export class CreateLogPreprocessDtoCommand implements CreatePreprocessDtoCommand {
  constructor(
    private readonly dataProviderFactory: IngestionDataProviderFactory,
    private readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    private readonly logger: LoggerService
  ) {}

  async execute(params: CreateEvmPreprocessDtoParams): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const results: CreateFinancialTransactionPreprocessDto[] = []

    const provider = this.dataProviderFactory.getProvider(params.blockchainId)

    const evmLogs = await provider.getTransactionLogs(params)

    const contractConfigurations = await this.contractConfigurationsEntityService.getByBlockchain(params.blockchainId)

    for (const evmLog of evmLogs) {
      if (evmLog.fromAddress !== params.walletAddress && evmLog.toAddress !== params.walletAddress) {
        // Skip logs that are not related to the wallet
        continue
      }

      const cryptocurrency = currencyHelper.getCryptocurrencyByContractAddress(
        params.cryptocurrencies,
        params.blockchainId,
        evmLog.contractAddress
      )

      if (!cryptocurrency) {
        continue
      }

      const contractConfiguration = contractConfigurations.find((c) =>
        ingestionUtils.isLogMatchEvmConfiguration(evmLog, c)
      )

      const hexValue: string = this.getHexAmount(contractConfiguration, evmLog)

      const amount = currencyHelper.formatHexWadAmountForCryptocurrency(hexValue, cryptocurrency, params.blockchainId)

      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: `${params.transactionHash}:${params.blockchainId}:log:${evmLog.logIndex}`,
        typeOrder: PreprocessTypeOrderEnum.ERC20_LOG_TYPE_ORDER,
        order: evmLog.logIndex,
        hash: params.transactionHash,
        blockchainId: params.blockchainId,
        fromAddress: evmLog.fromAddress ?? evmLog.contractAddress,
        toAddress: evmLog.toAddress ?? evmLog.contractAddress,
        initiatorAddress: params.receipt.fromAddress,
        cryptocurrency: cryptocurrency,
        cryptocurrencyAmount: amount.toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(evmLog.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }
      results.push(dto)
    }

    return results
  }

  getHexAmount(contractConfiguration: ContractConfiguration, evmLog: EvmLog): string {
    if (!contractConfiguration) {
      return evmLog.data
    }

    if (!contractConfiguration.metadata) {
      return evmLog.data
    }
    // see https://github.com/web3/web3.js/issues/3806
    const topics = [evmLog.topic1, evmLog.topic2, evmLog.topic3]
    const valueMap: { [key: string]: string } = Web3EthAbi.decodeLog(
      contractConfiguration.metadata.abi,
      evmLog.data,
      topics.filter((t) => !!t)
    )
    if (valueMap) {
      const value = valueMap[contractConfiguration.metadata.parameterName]
      if (value) {
        return numberToHex(value)
      } else {
        throw new Error(`Could not decode log ${evmLog.transactionHash}:${evmLog.logIndex}`)
      }
    } else {
      throw new Error(`Could not decode log ${evmLog.transactionHash}:${evmLog.logIndex}`)
    }
  }
}
