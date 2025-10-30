import { BadRequestException, Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { TaxLotsDomainService } from '../domain/tax-lots/tax-lots.domain.service'
import { PricesService } from '../prices/prices.service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { GainsLossesEntityService } from '../shared/entity-services/gains-losses/gains-losses.entity-service'
import { TaxLotStatus } from '../shared/entity-services/gains-losses/interfaces'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import {
  AssetBalanceQueryParams,
  AssetResponseDto,
  TaxLotQueryParams,
  TaxLotResponseDto,
  ToCreateAssetResponseDto
} from './interfaces'

@Injectable()
export class AssetsDomainService {
  constructor(
    private logger: LoggerService,
    private gainsLossesService: GainsLossesEntityService,
    private walletsService: WalletsEntityService,
    private pricesService: PricesService,
    private cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private taxLotsDomainService: TaxLotsDomainService,
    private blockchainsEntityService: BlockchainsEntityService
  ) {}

  async getAssetsForOrganization(
    organizationId: string,
    blockchainIds: string[],
    nameOrSymbol?: string,
    nameOrSymbolOrAddress?: string,
    walletPublicIds: string[] = null,
    cryptocurrencyPublicIds: string[] = null
  ): Promise<AssetResponseDto[]> {
    // Check if we're in development mode and have Solana blockchains
    const hasSolanaBlockchains = blockchainIds?.some(id => id.includes('solana'))
    
    if (process.env.NODE_ENV === 'development' && hasSolanaBlockchains) {
      this.logger.debug('Development mode - returning test Solana assets')
      
      const testAssets = [
        {
          cryptocurrency: {
            publicId: 'bonk-public-id',
            name: 'Bonk',
            symbol: 'BONK',
            coingeckoId: 'bonk',
            addresses: [
              {
                address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
                blockchainId: 'solana'
              }
            ]
          },
          blockchainId: 'solana',
          totalUnits: '15000000.00',
          totalCostBasis: '150.00',
          currentFiatPrice: '0.00001',
          fiatCurrency: 'USD',
          totalCurrentFiatValue: '150.00'
        },
        {
          cryptocurrency: {
            publicId: 'usdc-public-id',
            name: 'USD Coin',
            symbol: 'USDC',
            coingeckoId: 'usd-coin',
            addresses: [
              {
                address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                blockchainId: 'solana'
              }
            ]
          },
          blockchainId: 'solana',
          totalUnits: '2500.50',
          totalCostBasis: '2500.50',
          currentFiatPrice: '1.00',
          fiatCurrency: 'USD',
          totalCurrentFiatValue: '2500.50'
        },
        {
          cryptocurrency: {
            publicId: 'sol-public-id',
            name: 'Solana',
            symbol: 'SOL',
            coingeckoId: 'solana',
            addresses: [
              {
                address: 'So11111111111111111111111111111111111111112',
                blockchainId: 'solana'
              }
            ]
          },
          blockchainId: 'solana',
          totalUnits: '12.50',
          totalCostBasis: '1950.00',
          currentFiatPrice: '168.00',
          fiatCurrency: 'USD',
          totalCurrentFiatValue: '2100.00'
        },
        {
          cryptocurrency: {
            publicId: 'jup-public-id',
            name: 'Jupiter',
            symbol: 'JUP',
            coingeckoId: 'jupiter-exchange-solana',
            addresses: [
              {
                address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
                blockchainId: 'solana'
              }
            ]
          },
          blockchainId: 'solana',
          totalUnits: '850.75',
          totalCostBasis: '400.00',
          currentFiatPrice: '0.50',
          fiatCurrency: 'USD',
          totalCurrentFiatValue: '425.38'
        }
      ]
      
      // Apply filters if provided
      let filteredAssets = testAssets
      
      if (nameOrSymbol) {
        const searchTerm = nameOrSymbol.toLowerCase()
        filteredAssets = testAssets.filter(asset => 
          asset.cryptocurrency.name.toLowerCase().includes(searchTerm) ||
          asset.cryptocurrency.symbol.toLowerCase().includes(searchTerm)
        )
      }
      
      if (nameOrSymbolOrAddress) {
        const searchTerm = nameOrSymbolOrAddress.toLowerCase()
        filteredAssets = filteredAssets.filter(asset => 
          asset.cryptocurrency.name.toLowerCase().includes(searchTerm) ||
          asset.cryptocurrency.symbol.toLowerCase().includes(searchTerm) ||
          asset.cryptocurrency.addresses.some(addr => addr.address.toLowerCase().includes(searchTerm))
        )
      }
      
      return filteredAssets.map(asset => ({
        ...asset,
        cryptocurrency: {
          ...asset.cryptocurrency,
          image: null,
          isVerified: true,
          addresses: asset.cryptocurrency.addresses.map(addr => ({
            ...addr,
            type: 'mint_address',
            decimal: 9
          }))
        }
      })) as unknown as AssetResponseDto[]
    }
    
    let walletIds: string[] = []
    if (walletPublicIds?.length > 0) {
      const wallets = await this.walletsService.getByOrganizationAndPublicIds(organizationId, walletPublicIds)
      if (wallets?.length > 0) {
        walletIds = wallets.map((item) => item.id)
      } else {
        throw new BadRequestException('walletIds do not match to any wallet in the organization')
      }
    }

    let cryptocurrencyIds: string[] = []
    if (cryptocurrencyPublicIds?.length > 0) {
      const cryptocurrencies = await this.cryptocurrenciesEntityService.getAllByPublicIds(cryptocurrencyPublicIds)
      cryptocurrencyIds = cryptocurrencies.map((item) => item.id)
    }

    const taxLots = await this.taxLotsDomainService.getAvailableAndUniqueSoldTaxLots({
      walletIds,
      organizationId,
      blockchainIds,
      nameOrSymbol,
      nameOrSymbolOrAddress,
      cryptocurrencyIds
    })

    const toCreateAssetList: { [cryptocurrencyAddressId: string]: ToCreateAssetResponseDto } = {}

    for (const lot of taxLots) {
      const addressId = lot.cryptocurrency.addresses.find((c) => c.blockchainId === lot.blockchainId).id

      let dto: ToCreateAssetResponseDto = toCreateAssetList[addressId]

      if (!dto) {
        const currentFiatPrice = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
          lot.cryptocurrency,
          lot.costBasisFiatCurrency
        )

        dto = ToCreateAssetResponseDto.create({
          cryptocurrency: lot.cryptocurrency,
          blockchainId: lot.blockchainId,
          fiatCurrency: lot.costBasisFiatCurrency,
          totalUnits: '0',
          totalCostBasis: '0',
          currentFiatPrice: currentFiatPrice.toString()
        })
      }

      toCreateAssetList[addressId] = dto

      if (lot.status === TaxLotStatus.SOLD) {
        continue
      }

      dto.totalUnits = Decimal.add(dto.totalUnits, lot.amountAvailable).toString()
      dto.totalCostBasis = Decimal.add(
        dto.totalCostBasis,
        Decimal.mul(lot.amountAvailable, lot.costBasisPerUnit)
      ).toString()
    }

    const assetResponseDtos: AssetResponseDto[] = []

    for (const toCreate in toCreateAssetList) {
      assetResponseDtos.push(AssetResponseDto.map(toCreateAssetList[toCreate]))
    }

    return assetResponseDtos
  }

  async getPaginatedTaxLotsForAsset(organizationId: string, assetPublicId: string, options: TaxLotQueryParams) {
    let wallets: Wallet[] = null
    let walletIds: string[] = null

    if (options.walletIds?.length) {
      wallets = await this.walletsService.getByOrganizationAndPublicIds(organizationId, options.walletIds)

      if (wallets?.length) {
        walletIds = wallets.map((wallet) => wallet.id)
      } else {
        throw new BadRequestException("walletGroupPublicIds do not match to any 'Wallet Group' in the organization")
      }
    }

    if (!wallets) {
      wallets = await this.walletsService.getAllByOrganizationId(organizationId)
    }

    const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()

    const paginatedTaxLots = await this.gainsLossesService.getAllTaxLotsAndCount(
      organizationId,
      assetPublicId,
      options,
      walletIds,
      options.blockchainId,
      options.status
    )

    return {
      ...paginatedTaxLots,
      items: paginatedTaxLots.items?.map((source) => TaxLotResponseDto.map(source, wallets, enabledBlockchainIds))
    }
  }

  async getCryptocurrenciesByOrganizationAndWalletPublicIds(organizationId: string, params: AssetBalanceQueryParams) {
    let wallets: Wallet[] = []
    if (params.walletIds?.length) {
      wallets = await this.walletsService.getByOrganizationAndPublicIds(organizationId, params.walletIds)
    }

    const taxLots = await this.taxLotsDomainService.getAvailableAndUniqueSoldTaxLots({
      walletIds: wallets.map((wallet) => wallet.id),
      organizationId,
      blockchainIds: params.blockchainIds
    })

    //get unique cryptocurrencies from taxLots by cryptocurrency id
    const uniqueCryptocurrencies: Cryptocurrency[] = taxLots.reduce((acc, taxLot) => {
      if (!acc.find((item) => item.id === taxLot.cryptocurrency.id)) {
        acc.push(taxLot.cryptocurrency)
      }
      return acc
    }, [])

    return uniqueCryptocurrencies.map((cryptocurrency) => CryptocurrencyResponseDto.map(cryptocurrency))
  }

  // TODO: Descoped until end of April 2023
  // async getRevalueResponseDto(
  //   cryptocurrencyPublicId: string,
  //   organizationId: string,
  //   revalueAt: Date,
  //   newPricePerUnit: string,
  // ): Promise<RevalueResponseDto> {
  //   const cryptocurrency = await this.cryptocurrencyService.findByPublicId(cryptocurrencyPublicId)
  //   const { revalueTaxLotsGroup } = await this.gainsLossesService.getRevalueTaxLotsAndSale(
  //     organizationId,
  //     revalueAt,
  //   )
  //
  //   const revalueTaxLotResponseDtos: RevalueTaxLotResponseDto[] = []
  //
  //   for (const lot of Object.values(revalueTaxLotsGroup)) {
  //     const previousFiatValue = Decimal.mul(lot.amountAvailable, lot.costBasisPerUnit)
  //     const newFiatValue = Decimal.mul(lot.amountAvailable, newPricePerUnit)
  //     const unrealisedGainLoss = Decimal.sub(newFiatValue, previousFiatValue)
  //
  //     const revalueTaxLotResponseDto: RevalueTaxLotResponseDto = RevalueTaxLotResponseDto.map({
  //       publicId: lot.publicId,
  //       affectedAmount: lot.amountAvailable,
  //       previousFiatValue: previousFiatValue.toString(),
  //       newFiatValue: newFiatValue.toString(),
  //       unrealisedGainLoss: unrealisedGainLoss.toString()
  //     })
  //
  //     revalueTaxLotResponseDtos.push(revalueTaxLotResponseDto)
  //   }
  //
  //   return RevalueResponseDto.map({
  //     cryptocurrency,
  //     fiatCurrency: 'usd',
  //     revalueTaxLotResponseDtos: revalueTaxLotResponseDtos
  //   })
  // }
  //
  // async executeRevalue(
  //   cryptocurrencyPublicId: string,
  //   organizationId: string,
  //   revalueAt: Date,
  //   newPricePerUnit: string,
  //   accountId: string
  // ) {
  //   const cryptocurrency = await this.cryptocurrencyService.findByPublicId(cryptocurrencyPublicId)
  //   const { revalueTaxLotsGroup, taxLotSaleGroup } = await this.gainsLossesService.getRevalueTaxLotsAndSale(
  //     organizationId,
  //     revalueAt,
  //   )
  //
  //   for (const lot of Object.values(revalueTaxLotsGroup)) {
  //     await this.gainsLossesService
  //     const previousFiatValue = Decimal.mul(lot.amountAvailable, lot.costBasisPerUnit)
  //     const newFiatValue = Decimal.mul(lot.amountAvailable, newPricePerUnit)
  //     const unrealisedGainLoss = Decimal.sub(newFiatValue, previousFiatValue)
  //
  //     const revalueTaxLotResponseDto: RevalueTaxLotResponseDto = {
  //       publicId: lot.publicId,
  //       affectedAmount: lot.amountAvailable,
  //       previousFiatValue: previousFiatValue.toString(),
  //       newFiatValue: newFiatValue.toString(),
  //       unrealisedGainLoss: unrealisedGainLoss.toString()
  //     }
  //
  //     // revalueTaxLotResponseDtos.push(revalueTaxLotResponseDto)
  //   }
  // }
}
