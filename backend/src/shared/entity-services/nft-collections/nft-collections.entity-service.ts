import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  Repository
} from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { BaseEntityService } from '../base.entity-service'
import {
  NftCollectionContractAddress,
  NftCollectionContractStandard,
  NftCollectionFloorPriceAggregate
} from './interfaces'
import { NftCollection } from './nft-collection.entity'

@Injectable()
export class NftCollectionsEntityService extends BaseEntityService<NftCollection> {
  constructor(
    @InjectRepository(NftCollection)
    private nftCollectionsRepository: Repository<NftCollection>
  ) {
    super(nftCollectionsRepository)
  }

  getBySourceId(sourceId: string) {
    return this.nftCollectionsRepository.findOne({
      where: { sourceId }
    })
  }

  async upsertNftCollection(params: {
    name: string
    sourceId: string
    imageUrl: string
    bannerImageUrl: string
    description: string
    contractStandard: NftCollectionContractStandard
    tokenCount: number
    contractAddresses: NftCollectionContractAddress[]
  }) {
    const nftCollectionTemplate: DeepPartial<NftCollection> = {
      name: params.name,
      sourceId: params.sourceId,
      imageUrl: params.imageUrl,
      bannerImageUrl: params.bannerImageUrl,
      description: params.description,
      contractStandard: params.contractStandard,
      tokenCount: params.tokenCount,
      contractAddresses: params.contractAddresses
    }

    const exist = await this.nftCollectionsRepository.findOne({
      where: {
        sourceId: params.sourceId
      }
    })

    if (exist) {
      await this.nftCollectionsRepository.update(exist.id, nftCollectionTemplate)
      return this.findOne({ where: { id: exist.id } })
    } else {
      return this.nftCollectionsRepository.save(nftCollectionTemplate)
    }
  }

  getByIds(collectionIds: string[], order?: FindOptionsOrder<NftCollection>): Promise<NftCollection[]> {
    return this.nftCollectionsRepository.find({ where: { id: In(collectionIds) }, order })
  }

  getByIdsAndFloorUpdatedBefore(
    collectionIds: string[],
    floorPriceUpdatedBefore: Date,
    order?: FindOptionsOrder<NftCollection>
  ): Promise<NftCollection[]> {
    const where: FindOptionsWhere<NftCollection>[] = [
      { id: In(collectionIds), floorPriceUpdatedAt: LessThanOrEqual(floorPriceUpdatedBefore) },
      { id: In(collectionIds), floorPriceUpdatedAt: IsNull() }
    ]
    return this.nftCollectionsRepository.find({
      where,
      order
    })
  }

  getByPublicIds(collectionPublicIds: string[], select?: FindOptionsSelect<NftCollection>): Promise<NftCollection[]> {
    return this.nftCollectionsRepository.find({ select, where: { publicId: In(collectionPublicIds) } })
  }

  updateFloorPricesById(id: string, floorPriceAggregate: NftCollectionFloorPriceAggregate, floorPriceUpdatedAt: Date) {
    return this.nftCollectionsRepository.update(id, { floorPriceAggregate, floorPriceUpdatedAt })
  }

  getByIdsPaging(size: number, page: number, collectionIds: string[]): Promise<[NftCollection[], number]> {
    let findNftCollectionConditions: FindOptionsWhere<NftCollection> | FindOptionsWhere<NftCollection>[] = {
      id: In(collectionIds)
    }

    return this.nftCollectionsRepository.findAndCount({
      where: findNftCollectionConditions,
      skip: page * size,
      take: size,
      order: {
        name: Direction.ASC
      }
    })
  }

  getByPublicId(publicId: string): Promise<NftCollection> {
    return this.nftCollectionsRepository.findOne({ where: { publicId } })
  }
}
