import { Injectable } from '@nestjs/common'
import { BlockchainsEntityService } from '../../../../shared/entity-services/blockchains/blockchains.entity-service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { EvmGetContractAddressesFromLogsParams } from '../../../../shared/entity-services/ingestion/evm/interfaces'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'

@Injectable()
export class GetAndCreateCryptocurrenciesCommand {
  constructor(
    private readonly dataProviderFactory: IngestionDataProviderFactory,
    private readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    private readonly blockchainsEntityService: BlockchainsEntityService,
    private readonly logger: LoggerService
  ) {}

  async execute(params: EvmGetContractAddressesFromLogsParams): Promise<Cryptocurrency[]> {
    const nativeCoin = await this.cryptocurrenciesService.getCoinByBlockchain(params.blockchainId)

    const dataProviderService = this.dataProviderFactory.getProvider(params.blockchainId)

    const contractAddresses = await dataProviderService.getContractAddresses(params)
    const cryptocurrencies = await this.cryptocurrenciesService.getByAddressesAndBlockchain(
      contractAddresses,
      params.blockchainId
    )

    const cryptocurrenciesToCreate = contractAddresses.filter(
      (address) => !cryptocurrencies.find((token) => token.addresses.find((a) => a.address === address))
    )

    const newCryptocurrencies = await this.createCryptocurrencies(cryptocurrenciesToCreate, params.blockchainId)

    return [nativeCoin, ...cryptocurrencies, ...newCryptocurrencies]
  }

  async createCryptocurrencies(erc20TokensToCreate: string[], blockchainId: string): Promise<Cryptocurrency[]> {
    const cryptocurrencies: Cryptocurrency[] = []
    for (const contractAddress of erc20TokensToCreate) {
      try {
        let cryptocurrency = await this.cryptocurrenciesService.createNewErc20Token(contractAddress, blockchainId)
        if (cryptocurrency) {
          cryptocurrencies.push(cryptocurrency)
        }
      } catch (e) {
        this.logger.error('Error in creating token', contractAddress, e)
      }
    }

    return cryptocurrencies
  }
}
