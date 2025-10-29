import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  MoreThanOrEqual,
  Repository
} from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { NftQueryParams } from '../../../nfts/interfaces'
import { BaseEntityService } from '../base.entity-service'
import { NftGainLossMetadata, NftTrait, NftTransactionMetadata } from './interfaces'
import { Nft } from './nft.entity'

@Injectable()
export class NftsEntityService extends BaseEntityService<Nft> {
  constructor(
    @InjectRepository(Nft)
    private nftsRepository: Repository<Nft>
  ) {
    super(nftsRepository)
  }

  getBySourceIdAndOrganizationId(sourceId: string, organizationId: string) {
    return this.nftsRepository.findOne({
      where: { sourceId, organization: { id: organizationId } }
    })
  }

  async upsertNft(params: {
    name: string
    tokenId: string
    sourceId: string
    blockchainId: string
    imageUrl: string
    acquiredAt: Date
    nftCollectionId: string
    walletId: string
    organizationId: string
    traits: NftTrait[]
    rarityRank: string
    transactionMetadata: NftTransactionMetadata
    sourceAdditionalId?: string
    quantityId?: number
  }) {
    const nftTemplate: DeepPartial<Nft> = {
      name: params.name,
      tokenId: params.tokenId,
      sourceId: params.sourceId,
      sourceAdditionalId: params.sourceAdditionalId,
      quantityId: params.quantityId,
      blockchainId: params.blockchainId,
      imageUrl: params.imageUrl,
      acquiredAt: params.acquiredAt,
      nftCollection: { id: params.nftCollectionId },
      wallet: { id: params.walletId },
      organization: { id: params.organizationId },
      transactionMetadata: params.transactionMetadata,
      traits: params.traits,
      rarityRank: params.rarityRank
    }

    const exist = await this.nftsRepository.findOne({
      where: {
        sourceId: params.sourceId,
        sourceAdditionalId: params.sourceAdditionalId,
        quantityId: params.quantityId,
        organization: {
          id: params.organizationId
        }
      }
    })

    if (exist) {
      return this.nftsRepository.update(exist.id, nftTemplate)
    } else {
      return this.nftsRepository.save(nftTemplate)
    }
  }

  softDeleteNft(params: { sourceId: string; organizationId: string }) {
    const whereConditions: FindOptionsWhere<Nft> = {
      sourceId: params.sourceId,
      organization: { id: params.organizationId }
    }
    return this.nftsRepository.softDelete(whereConditions)
  }

  getAllByOrganizationIdBatched(organizationId: string, skip?: number, take?: number) {
    return this.nftsRepository.find({
      where: {
        organization: {
          id: organizationId
        }
      },
      relations: {
        nftCollection: true
      },
      skip,
      take
    })
  }

  updateGainLossMetadataById(id: string, gainLossMetadata: NftGainLossMetadata) {
    return this.nftsRepository.update(id, { gainLossMetadata })
  }

  async getAllNftPaging(
    organizationId,
    options: NftQueryParams,
    select?: FindOptionsSelect<Nft>
  ): Promise<[Nft[], number]> {
    let findNftConditions: FindOptionsWhere<Nft> | FindOptionsWhere<Nft>[] = {
      organization: {
        id: organizationId
      }
    }

    if (options.collectionIds?.length) {
      findNftConditions.nftCollection = { id: In(options.collectionIds) }
    }

    if (options.walletIds?.length) {
      findNftConditions.wallet = { id: In(options.walletIds) }
    }

    if (options.blockchainIds?.length) {
      findNftConditions.blockchainId = In(options.blockchainIds)
    }

    if (options.search) {
      findNftConditions = [
        {
          ...findNftConditions,
          name: ILike(`%${options.search}%`)
        },
        {
          ...findNftConditions,
          nftCollection: {
            id: options.collectionIds?.length ? In(options.collectionIds) : null,
            name: ILike(`%${options.search}%`)
          }
        },
        {
          ...findNftConditions,
          tokenId: ILike(`%${options.search}%`)
        }
      ]
    }

    const findOptions: FindManyOptions<Nft> = {
      select,
      where: findNftConditions,
      order: { name: Direction.ASC },
      relations: {
        nftCollection: true,
        wallet: true
      }
    }

    if (Object.keys(options).includes('page') && Object.keys(options).includes('size')) {
      findOptions.skip = options.page * options.size
      findOptions.take = options.size
    }

    const [items, totalItems] = await this.nftsRepository.findAndCount(findOptions)

    return [items, totalItems]
  }

  async getNftAggregateData(organizationId, options: NftQueryParams, select?: FindOptionsSelect<Nft>): Promise<Nft[]> {
    let findNftConditions: FindOptionsWhere<Nft> | FindOptionsWhere<Nft>[] = {
      organization: {
        id: organizationId
      }
    }

    if (options.collectionIds?.length) {
      findNftConditions.nftCollection = { id: In(options.collectionIds) }
    }

    if (options.walletIds?.length) {
      findNftConditions.wallet = { id: In(options.walletIds) }
    }

    if (options.blockchainIds?.length) {
      findNftConditions.blockchainId = In(options.blockchainIds)
    }

    if (options.search?.length) {
      findNftConditions = [
        {
          name: ILike(`%${options.search}%`),
          ...findNftConditions
        },
        {
          nftCollection: {
            name: ILike(`%${options.search}%`)
          },
          ...findNftConditions
        },
        {
          tokenId: ILike(`%${options.search}%`),
          ...findNftConditions
        }
      ]
    }

    return this.nftsRepository.find({
      select,
      where: findNftConditions,
      relations: {
        nftCollection: true,
        wallet: true
      }
    })
  }

  getCollectionIdsByOrganizationId(organizationId: string) {
    return this.nftsRepository
      .createQueryBuilder('nft')
      .select('DISTINCT nft.nft_collection_id', 'collectionId')
      .where('nft.organization_id = :organizationId', { organizationId })
      .getRawMany()
  }

  getByPublicIdAndOrganizationId(publicId: string, organizationId: string): Promise<Nft> {
    return this.nftsRepository.findOne({
      where: {
        publicId,
        organization: {
          id: organizationId
        }
      },
      relations: {
        nftCollection: true,
        wallet: true
      }
    })
  }

  getBySourceIdAndSourceAdditionalIdAndOrganizationId(params: {
    sourceId: string
    sourceAdditionalId: string
    organizationId: string
  }) {
    const where: FindOptionsWhere<Nft> = {
      sourceId: params.sourceId,
      sourceAdditionalId: params.sourceAdditionalId,
      organization: { id: params.organizationId }
    }
    return this.nftsRepository.find({ where })
  }

  getByCollectionIdAndOrganizationId(
    collectionId: string,
    organizationId: string,
    relations?: FindOptionsRelations<Nft>
  ): Promise<Nft[]> {
    return this.nftsRepository.find({
      where: {
        nftCollection: {
          id: collectionId
        },
        organization: {
          id: organizationId
        }
      },
      relations,
      order: { tokenId: Direction.ASC }
    })
  }

  deleteNftsByWalletIdAndOrganizationId(walletId: string, organizationId: string) {
    const where: FindOptionsWhere<Nft> = {
      wallet: { id: walletId },
      organization: { id: organizationId }
    }
    return this.nftsRepository.softDelete(where)
  }

  deleteBySourceIdAndSourceAdditionalIdAndQuantityIdAndOrganizationId(params: {
    sourceId: string
    sourceAdditionalId: string
    quantityId: number
    organizationId: string
  }) {
    const where: FindOptionsWhere<Nft> = {
      sourceId: params.sourceId,
      sourceAdditionalId: params.sourceAdditionalId,
      organization: { id: params.organizationId },
      quantityId: MoreThanOrEqual(params.quantityId)
    }
    return this.nftsRepository.softDelete(where)
  }
}
