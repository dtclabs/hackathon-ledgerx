import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../shared/logger/logger.service'
import { GainsLossesEntityService } from '../../shared/entity-services/gains-losses/gains-losses.entity-service'
import { BlockchainsEntityService } from '../../shared/entity-services/blockchains/blockchains.entity-service'

@Injectable()
export class TaxLotsDomainService {
  constructor(
    private logger: LoggerService,
    private gainsLossesService: GainsLossesEntityService,
    private blockchainsEntityService: BlockchainsEntityService
  ) {}

  async getAvailableAndUniqueSoldTaxLots(params?: {
    walletIds?: string[]
    organizationId?: string
    blockchainIds?: string[]
    nameOrSymbol?: string
    nameOrSymbolOrAddress?: string
    cryptocurrencyIds?: string[]
  }) {
    const blockchainIds = await this.blockchainsEntityService.getEnabledIdsFromOrDefaultIfEmpty(params.blockchainIds)
    const availableTaxLots = await this.gainsLossesService.getAvailableTaxLots({
      organizationId: params.organizationId,
      blockchainIds: blockchainIds,
      nameOrSymbol: params.nameOrSymbol,
      nameOrSymbolOrAddress: params.nameOrSymbolOrAddress,
      walletIds: params.walletIds,
      cryptocurrencyIds: params.cryptocurrencyIds
    })
    const soldTaxLots = await this.gainsLossesService.getOneSoldTaxLotForCryptocurrency({
      organizationId: params.organizationId,
      blockchainIds: blockchainIds,
      nameOrSymbol: params.nameOrSymbol,
      nameOrSymbolOrAddress: params.nameOrSymbolOrAddress,
      walletIds: params.walletIds,
      cryptocurrencyIds: params.cryptocurrencyIds
    })

    const uniqueSoldTaxLots = soldTaxLots.filter(
      (soldLot) =>
        !availableTaxLots.find(
          (availableLot) =>
            availableLot.cryptocurrency.id === soldLot.cryptocurrency.id &&
            availableLot.blockchainId === soldLot.blockchainId
        )
    )

    return [...availableTaxLots, ...uniqueSoldTaxLots]
  }
}
