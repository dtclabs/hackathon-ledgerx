import { Injectable, NotFoundException } from '@nestjs/common'
import Decimal from 'decimal.js'
import { Direction, PaginationResponse } from '../core/interfaces'
import { NftQueryParams } from '../nfts/interfaces'
import { NftsControllerService } from '../nfts/nfts.controller.service'
import { PricesService } from '../prices/prices.service'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { NftCollection } from '../shared/entity-services/nft-collections/nft-collection.entity'
import { NftCollectionsEntityService } from '../shared/entity-services/nft-collections/nft-collections.entity-service'
import { NftsEntityService } from '../shared/entity-services/nfts/nfts.entity-service'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { NftCollectionDto } from './interfaces'

@Injectable()
export class NftCollectionsControllerService {
  constructor(
    private nftCollectionsEntityService: NftCollectionsEntityService,
    private nftsEntityService: NftsEntityService,
    private readonly nftsControllerService: NftsControllerService,
    private readonly organizationSettingsEntityService: OrganizationSettingsEntityService,
    private readonly pricesService: PricesService,
    private readonly cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private readonly contactsEntityService: ContactsEntityService
  ) {}

  async getAllNftCollectionPaging(query: NftQueryParams, organizationId: string) {
    const [collectionIds, walletIds, blockchainIds] = await this.nftsControllerService.validateNftFilters(
      organizationId,
      query
    )

    const { size, page, ...newQuery } = query

    const [allCollectionIds] = await this.nftsEntityService.getAllNftPaging(
      organizationId,
      { ...newQuery, collectionIds, walletIds, blockchainIds },
      {
        nftCollection: { id: true }
      }
    )

    const filteredCollectionIds = new Set<string>(allCollectionIds.map((collectionId) => collectionId.nftCollection.id))
    const [nftCollections, totalItems] = await this.nftCollectionsEntityService.getByIdsPaging(
      size || 10,
      page || 0,
      Array.from(filteredCollectionIds)
    )

    const nftCollectionDtos: NftCollectionDto[] = await this.convertDaoToDtos(nftCollections, organizationId)

    return PaginationResponse.from({
      totalItems,
      currentPage: page,
      items: nftCollectionDtos,
      limit: size
    })
  }

  async getByPublicIdAndOrganizationId(publicId: string, organizationId: string) {
    const nftCollection = await this.nftCollectionsEntityService.getByPublicId(publicId)

    if (!nftCollection) {
      throw new NotFoundException('Invalid NFT Collection id')
    }

    const nft = await this.nftsEntityService.getByCollectionIdAndOrganizationId(nftCollection.id, organizationId)

    if (!nft) {
      throw new NotFoundException('Invalid NFT Collection id')
    }

    const nftCollectionDtos: NftCollectionDto[] = await this.convertDaoToDtos([nftCollection], organizationId)

    return nftCollectionDtos.at(0)
  }

  async convertDaoToDtos(nftCollections: NftCollection[], organizationId: string): Promise<NftCollectionDto[]> {
    const nftCollectionDtos: NftCollectionDto[] = []

    const fiatCurrency = (
      await this.organizationSettingsEntityService.getByOrganizationId(organizationId, { fiatCurrency: true })
    ).fiatCurrency.alphabeticCode

    const cryptocurrencyMap: { [cryptocurrencyId: string]: Cryptocurrency } = {}
    //Always insert ethereum
    const ethCryptocurrency = await this.cryptocurrenciesEntityService.getCoinByBlockchain('ethereum')
    cryptocurrencyMap[ethCryptocurrency.id] = ethCryptocurrency

    const cryptocurrencyPriceMap: { [cryptocurrencyId: string]: Decimal } = {}

    const contactDtoMap = await this.contactsEntityService.getGroupedContactDtosByAddressPerOrganization(organizationId)

    for (const nftCollection of nftCollections) {
      const nfts = await this.nftsEntityService.getByCollectionIdAndOrganizationId(nftCollection.id, organizationId, {
        wallet: true
      })

      const cryptocurrencyIdSet: Set<string> = new Set<string>()

      nfts.map((nft) => cryptocurrencyIdSet.add(nft.transactionMetadata?.costBasisCryptocurrencyId))
      if (nftCollection.floorPriceAggregate?.floorPrices?.length) {
        nftCollection.floorPriceAggregate.floorPrices.map((floorPrice) =>
          cryptocurrencyIdSet.add(floorPrice.cryptocurrencyId)
        )
      }

      for (const cryptocurrencyId of Array.from(cryptocurrencyIdSet)) {
        if (!cryptocurrencyMap[cryptocurrencyId]) {
          cryptocurrencyMap[cryptocurrencyId] = await this.cryptocurrenciesEntityService.getById(cryptocurrencyId)
        }

        if (!cryptocurrencyPriceMap[cryptocurrencyId]) {
          cryptocurrencyPriceMap[cryptocurrencyId] = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
            cryptocurrencyMap[cryptocurrencyId],
            fiatCurrency
          )
        }
      }

      nftCollectionDtos.push(
        NftCollectionDto.map({
          nftCollection,
          nfts,
          fiatCurrency,
          cryptocurrencyMap,
          cryptocurrencyPriceMap,
          contactDtoMap
        })
      )
    }

    return nftCollectionDtos
  }

  async getAllByOrganizationId(organizationId: string): Promise<NftCollection[]> {
    const nfts = await this.nftsEntityService.getAllByOrganizationIdBatched(organizationId)

    const filteredCollectionIds = new Set<string>(nfts.map((nft) => nft.nftCollection.id))
    return this.nftCollectionsEntityService.getByIds(Array.from(filteredCollectionIds), {
      name: Direction.ASC
    })
  }
}
