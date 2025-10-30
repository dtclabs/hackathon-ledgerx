import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Decimal from 'decimal.js'
import {
  DeepPartial,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  Like,
  MoreThan,
  Not,
  Raw,
  Repository,
  SelectQueryBuilder
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { Direction, PaginationResponse } from '../../../core/interfaces'
import { FinancialTransactionQueryParams } from '../../../financial-transactions/interfaces'
import { NOT_NULL_API_STRING, NULL_API_STRING } from '../../constants'
import { dateHelper } from '../../helpers/date.helper'
import { LoggerService } from '../../logger/logger.service'
import { FinancialTransactionChildAnnotationEntityService } from '../annotations/resource-annotations/financial-transaction-child-annotations.entity-service'
import { BaseEntityService } from '../base.entity-service'
import { CryptoWrappedMapping } from '../crypto-wrapped-mappings/crypto-wrapped-mapping.entity'
import { CryptoWrappedMappingsEntityService } from '../crypto-wrapped-mappings/crypto-wrapped-mappings.entity.service'
import { TaxLotSale } from '../gains-losses/tax-lot-sale.entity'
import { Wallet } from '../wallets/wallet.entity'
import { WalletsEntityService } from '../wallets/wallets.entity-service'
import {
  FinancialTransactionChildGnosisMetadata,
  FinancialTransactionChildMetadata
} from './financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from './financial-transaction-child.entity'
import { FinancialTransactionFile } from './financial-transaction-files.entity'
import { FinancialTransactionParent } from './financial-transaction-parent.entity'
import { FinancialTransactionPreprocess } from './financial-transaction-preprocess.entity'
import {
  CreateFinancialTransactionChildDto,
  CreateFinancialTransactionParentDto,
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionChildMetadataDirection,
  FinancialTransactionChildMetadataStatus,
  FinancialTransactionChildMetadataSubstatus,
  FinancialTransactionChildMetadataType,
  FinancialTransactionParentActivity,
  FinancialTransactionParentExportStatus,
  FinancialTransactionPreprocessStatus
} from './interfaces'

@Injectable()
export class FinancialTransactionsEntityService extends BaseEntityService<FinancialTransactionParent> {
  constructor(
    @InjectRepository(FinancialTransactionParent)
    private financialTransactionParentRepository: Repository<FinancialTransactionParent>,
    @InjectRepository(FinancialTransactionChild)
    private financialTransactionChildRepository: Repository<FinancialTransactionChild>,
    @InjectRepository(FinancialTransactionChildMetadata)
    private financialTransactionChildMetadataRepository: Repository<FinancialTransactionChildMetadata>,
    @InjectRepository(FinancialTransactionPreprocess)
    private financialTransactionPreprocessRepository: Repository<FinancialTransactionPreprocess>,
    @InjectRepository(FinancialTransactionFile)
    private financialTransactionFileRepository: Repository<FinancialTransactionFile>,
    private walletsService: WalletsEntityService,
    private cryptoWrappedMappingsEntityService: CryptoWrappedMappingsEntityService,
    private financialTransactionChildAnnotationEntityService: FinancialTransactionChildAnnotationEntityService,
    private logger: LoggerService
  ) {
    super(financialTransactionParentRepository)
  }

  async getAllChildPaging(
    options: FinancialTransactionQueryParams,
    organizationId: string
  ): Promise<PaginationResponse<FinancialTransactionChild>> {
    const size = options.size || 10
    const page = options.page || 0
    const [items, totalItems] = await this.getAllTxQuery(options, organizationId, false, page, size).getManyAndCount()

    return PaginationResponse.from({
      totalItems,
      currentPage: page,
      items,
      limit: size
    })
  }

  async getAllChildren(
    options: FinancialTransactionQueryParams,
    organizationId: string,
    page: number,
    pageSize: number
  ): Promise<FinancialTransactionChild[]> {
    const query = this.getAllTxQuery(options, organizationId, true, page, pageSize)
    return await query.getMany()
  }

  getChildrenByAddressesAndBlockchainId(params: {
    addresses: string[]
    blockchainId: string
    organizationId: string
    skip: number
    take: number
    startingId?: string | null
  }) {
    // TODO: Need deeper thinking how to handle when transaction is still syncing status
    const individualWhereConditions: FindOptionsWhere<FinancialTransactionChild> = {
      financialTransactionChildMetadata: {
        status: In([FinancialTransactionChildMetadataStatus.SYNCED, FinancialTransactionChildMetadataStatus.SYNCING])
      },
      blockchainId: params.blockchainId,
      organizationId: params.organizationId
    }

    if (params.startingId) {
      individualWhereConditions.id = MoreThan(params.startingId)
    }

    const whereConditions: FindOptionsWhere<FinancialTransactionChild>[] = [
      {
        ...individualWhereConditions,
        fromAddress: In(params.addresses),
        financialTransactionChildMetadata: { direction: FinancialTransactionChildMetadataDirection.OUTGOING }
      },
      {
        ...individualWhereConditions,
        toAddress: In(params.addresses),
        financialTransactionChildMetadata: { direction: FinancialTransactionChildMetadataDirection.INCOMING }
      }
    ]

    return this.financialTransactionChildRepository.find({
      where: whereConditions,
      relations: { financialTransactionChildMetadata: true, cryptocurrency: true, financialTransactionParent: true },
      skip: params.skip,
      take: params.take,
      order: {
        valueTimestamp: Direction.ASC,
        hash: Direction.ASC,
        financialTransactionChildMetadata: { direction: Direction.ASC },
        id: Direction.ASC
      }
    })
  }

  getChildrenByAddressAndBlockchainIdAndCryptocurrencyId(params: {
    address: string
    blockchainId: string
    cryptocurrencyId: string
    organizationId: string
    skip: number
    take: number
    startTime?: Date
    endTime?: Date
  }) {
    const individualWhereConditions: FindOptionsWhere<FinancialTransactionChild> = {
      financialTransactionChildMetadata: {
        status: In([FinancialTransactionChildMetadataStatus.SYNCED, FinancialTransactionChildMetadataStatus.SYNCING])
      },
      cryptocurrency: { id: params.cryptocurrencyId },
      blockchainId: params.blockchainId,
      organizationId: params.organizationId
    }

    if (params.startTime || params.endTime) {
      individualWhereConditions.valueTimestamp = Raw((alias) =>
        params.startTime && params.endTime
          ? `(${alias} >= '${params.startTime}' AND ${alias} <= '${params.endTime}')`
          : params.startTime
          ? `(${alias} >= '${params.startTime}')`
          : `(${alias} <= '${params.endTime}')`
      )
    }

    const whereConditions: FindOptionsWhere<FinancialTransactionChild>[] = [
      {
        ...individualWhereConditions,
        fromAddress: params.address,
        financialTransactionChildMetadata: { direction: FinancialTransactionChildMetadataDirection.OUTGOING }
      },
      {
        ...individualWhereConditions,
        toAddress: params.address,
        financialTransactionChildMetadata: { direction: FinancialTransactionChildMetadataDirection.INCOMING }
      }
    ]

    return this.financialTransactionChildRepository.find({
      where: whereConditions,
      relations: {
        financialTransactionChildMetadata: { correspondingChartOfAccount: true },
        cryptocurrency: true,
        financialTransactionParent: true
      },
      skip: params.skip,
      take: params.take,
      order: {
        valueTimestamp: Direction.ASC,
        financialTransactionChildMetadata: { direction: Direction.ASC },
        id: Direction.ASC
      }
    })
  }

  private getAllTxQuery(
    options: FinancialTransactionQueryParams,
    organizationId: string,
    isForExport,
    page: number,
    pageSize: number
  ): SelectQueryBuilder<FinancialTransactionChild> {
    const order = options.order || 'fn_tx_child.valueTimestamp'
    const direction = options.direction || Direction.DESC

    const orderBy = { [order]: direction }

    let whereQuery = 'fn_tx_child.organization_id = :organizationId'

    if (options.blockchainIds?.length) {
      whereQuery += ' AND fn_tx_child.blockchain_id IN (:...blockchainIds)'
    }
    if (options.startTime) {
      whereQuery += ' AND fn_tx_child.value_timestamp >= :startTime'
    }
    if (options.endTime) {
      whereQuery += ' AND fn_tx_child.value_timestamp <= :endTime'
    }
    if (options.walletAddresses?.length) {
      whereQuery += ' AND ('

      whereQuery +=
        '(fn_tx_child.from_address IN (:...walletAddresses) AND fn_tx_child_metadata.direction = :outgoingDirection)'
      whereQuery += ' OR '
      whereQuery +=
        '(fn_tx_child.to_address IN (:...walletAddresses) AND fn_tx_child_metadata.direction = :incomingDirection)'

      whereQuery += ')'
    }
    if (options.fromWalletAddresses?.length) {
      whereQuery +=
        ' AND fn_tx_child.from_address IN (:...fromAddresses) AND fn_tx_child_metadata.direction = :outgoingDirection)'
    }
    if (options.toWalletAddresses?.length) {
      whereQuery +=
        ' AND fn_tx_child.to_address IN (:...toAddresses) AND fn_tx_child_metadata.direction = :incomingDirection)'
    }
    if (options.fromAddresses?.length) {
      whereQuery += ' AND fn_tx_child.from_address IN (:...fromAddresses)'
    }
    if (options.toAddresses?.length) {
      whereQuery += ' AND fn_tx_child.to_address IN (:...toAddresses)'
    }
    if (options.childTypes?.length) {
      whereQuery += ' AND fn_tx_child_metadata.type = ANY(:types)'
    }
    if (options.activities?.length) {
      whereQuery += ' AND fn_tx_parent.activity = ANY(:activities)'
    }
    if (options.exportStatuses?.length) {
      whereQuery += ' AND fn_tx_parent.export_status = ANY(:exportStatuses)'
    }
    if (options.assetIds?.length) {
      whereQuery += ' AND crypto.public_id IN (:...assetIds)'
    }
    if (options.search) {
      options.search = options.search.toLowerCase()
      whereQuery += ' AND ( fn_tx_child.hash like :search OR fn_tx_child.public_id like :search )'
    }

    const hasNoAnnotation = options.annotations?.includes(NULL_API_STRING)
    const annotationPublicIds = options.annotations?.filter((annotation) => annotation !== NULL_API_STRING)
    if (annotationPublicIds?.length) {
      if (hasNoAnnotation) {
        whereQuery += ' AND (annotationFilter.public_id IN (:...annotations) OR childAnnotationsFilter.id IS NULL)'
      } else {
        whereQuery += ' AND annotationFilter.public_id IN (:...annotations)'
      }
    } else if (hasNoAnnotation) {
      whereQuery += ' AND childAnnotationsFilter.id IS NULL'
    }

    const isCorrespondingCoaSet = options.correspondingChartOfAccountIds?.includes(NULL_API_STRING)
    const chartOfAccountPublicIds = options.correspondingChartOfAccountIds?.filter((coa) => coa !== NULL_API_STRING)
    if (chartOfAccountPublicIds?.length) {
      whereQuery += ' AND coa.public_id IN (:...chartOfAccounts)'
    } else if (isCorrespondingCoaSet) {
      whereQuery += ` AND ( fn_tx_child_metadata.corresponding_coa_id IS NULL AND NOT (fn_tx_child_metadata.type = 'fee' OR fn_tx_child_metadata.type like '%internal' OR fn_tx_child_metadata.type like '%group'))`
    }

    const hasInvoices = options.invoices?.includes(NOT_NULL_API_STRING)
    if (hasInvoices) {
      whereQuery += ' AND invoice.id IS NOT NULL'
    }

    if (options.substatuses?.length) {
      whereQuery += ' AND fn_tx_child_metadata.substatuses && (:substatuses)'
    }

    if (options.childStatuses?.length) {
      whereQuery += ' AND fn_tx_child_metadata.status = ANY(:childStatuses)'
    }

    if (options.fromFiatAmount) {
      whereQuery += ' AND fn_tx_child_metadata.fiat_amount::DECIMAL >= :fromFiatAmount'
    }

    if (options.toFiatAmount) {
      whereQuery += ' AND fn_tx_child_metadata.fiat_amount::DECIMAL <= :toFiatAmount'
    }

    const params = {
      organizationId: organizationId,
      blockchainIds: options.blockchainIds,
      startTime: options.startTime,
      endTime: options.endTime,
      walletAddresses: options.walletAddresses,
      fromWalletAddresses: options.fromWalletAddresses,
      toWalletAddresses: options.toWalletAddresses,
      fromAddresses: options.fromAddresses,
      toAddresses: options.toAddresses,
      types: options.childTypes,
      activities: options.activities,
      exportStatuses: options.exportStatuses,
      substatuses: options.substatuses,
      childStatuses: options.childStatuses,
      assetIds: options.assetIds,
      search: `%${options.search ?? ''}%`,
      annotations: annotationPublicIds,
      chartOfAccounts: chartOfAccountPublicIds,
      fromFiatAmount: options.fromFiatAmount?.toNumber(),
      toFiatAmount: options.toFiatAmount?.toNumber(),
      outgoingDirection: FinancialTransactionChildMetadataDirection.OUTGOING,
      incomingDirection: FinancialTransactionChildMetadataDirection.INCOMING
    }

    const queryBuilder = this.financialTransactionChildRepository
      .createQueryBuilder('fn_tx_child')
      .leftJoinAndSelect('fn_tx_child.financialTransactionChildMetadata', 'fn_tx_child_metadata')
      .leftJoinAndSelect('fn_tx_child_metadata.category', 'category')
      .leftJoinAndSelect('fn_tx_child_metadata.correspondingChartOfAccount', 'coa')
      .innerJoinAndSelect('fn_tx_child.financialTransactionParent', 'fn_tx_parent')
      .leftJoinAndSelect('fn_tx_parent.invoices', 'invoice')
      .innerJoinAndSelect('fn_tx_child.cryptocurrency', 'crypto')
      .innerJoinAndSelect('crypto.addresses', 'crypto_addresses')
      .leftJoinAndSelect('fn_tx_child.financialTransactionChildAnnotations', 'childAnnotationsFilter') // Filter needs to be first
      .leftJoinAndSelect('childAnnotationsFilter.annotation', 'annotationFilter')
      .leftJoinAndSelect('fn_tx_child.financialTransactionChildAnnotations', 'childAnnotations')
      .leftJoinAndSelect('childAnnotations.annotation', 'annotation')
      .addSelect(
        `(CASE WHEN fn_tx_child_metadata.type = '${FinancialTransactionChildMetadataType.FEE}' THEN 1 ELSE 0 END)`,
        'is_fee'
      )
      .where(whereQuery, params)
      .orderBy(orderBy)
      .addOrderBy('is_fee')
      .addOrderBy('fn_tx_child.id', Direction.ASC)
      .take(pageSize)
      .skip(page * pageSize)

    if (isForExport) {
      return queryBuilder
    } else {
      //we need that for calculating totalItems for pagination purposes
      return queryBuilder.innerJoinAndSelect('fn_tx_parent.financialTransactionChild', 'fn_tx_parent_children')
    }
  }

  getAllChildrenFromAddressWithMissingPrice(params: {
    address: string
    blockchainId: string
    organizationId: string
    skip: number
    take: number
  }): Promise<FinancialTransactionChild[]> {
    const individualWhereConditions: FindOptionsWhere<FinancialTransactionChild> = {
      financialTransactionChildMetadata: {
        fiatAmountPerUnit: IsNull()
      },
      organizationId: params.organizationId,
      blockchainId: params.blockchainId
    }

    const whereConditions: FindOptionsWhere<FinancialTransactionChild>[] = [
      { ...individualWhereConditions, fromAddress: params.address },
      { ...individualWhereConditions, toAddress: params.address }
    ]

    return this.financialTransactionChildRepository.find({
      where: whereConditions,
      relations: { financialTransactionChildMetadata: true, cryptocurrency: true },
      skip: params.skip,
      take: params.take,
      order: {
        valueTimestamp: 'DESC'
      }
    })
  }

  getAllChildrenFromOrganization(
    organizationId: string,
    skip: number,
    take: number,
    relations: FindOptionsRelations<FinancialTransactionChild> = {}
  ): Promise<FinancialTransactionChild[]> {
    return this.financialTransactionChildRepository.find({
      where: { organizationId },
      relations: relations,
      order: {
        valueTimestamp: 'DESC'
      },
      skip,
      take
    })
  }

  getAllChildrenFromAddress(params: {
    address: string
    blockchainIds?: string[]
    organizationId: string
    relations: FindOptionsRelations<FinancialTransactionChild>
  }): Promise<FinancialTransactionChild[]> {
    const individualWhereConditions: FindOptionsWhere<FinancialTransactionChild> = {
      organizationId: params.organizationId,
      blockchainId: params.blockchainIds ? In(params.blockchainIds) : undefined
    }

    const whereConditions: FindOptionsWhere<FinancialTransactionChild>[] = [
      { ...individualWhereConditions, fromAddress: params.address },
      { ...individualWhereConditions, toAddress: params.address }
    ]

    return this.financialTransactionChildRepository.find({
      where: whereConditions,
      relations: params.relations,
      order: {
        valueTimestamp: 'DESC'
      }
    })
  }

  getAllChildrenFromOrganizationWithToAddressAndBlockchainId(params: {
    organizationId: string
    toAddress: string
    blockchainId: string
    relations?: FindOptionsRelations<FinancialTransactionChild>
  }): Promise<FinancialTransactionChild[]> {
    const whereConditions: FindOptionsWhere<FinancialTransactionChild> = {
      organizationId: params.organizationId,
      toAddress: params.toAddress,
      blockchainId: params.blockchainId
    }

    return this.financialTransactionChildRepository.find({
      where: whereConditions,
      relations: params.relations,
      order: {
        valueTimestamp: 'DESC'
      }
    })
  }

  getAllChildrenByOrganizationIdAndIds(
    organizationId: string,
    ids: string[],
    relations?: FindOptionsRelations<FinancialTransactionChild>
  ): Promise<FinancialTransactionChild[]> {
    return this.financialTransactionChildRepository.find({
      where: { organizationId, id: In(ids) },
      relations,
      order: {
        valueTimestamp: 'DESC'
      }
    })
  }

  getAllChildrenByOrganizationIdAndPublicIds(
    organizationId: string,
    publicIds: string[],
    relations?: FindOptionsRelations<FinancialTransactionChild>
  ): Promise<FinancialTransactionChild[]> {
    return this.financialTransactionChildRepository.find({
      where: { organizationId, publicId: In(publicIds) },
      relations
    })
  }

  getParentById(
    id: string,
    relations: FindOptionsRelations<FinancialTransactionParent>
  ): Promise<FinancialTransactionParent> {
    return this.financialTransactionParentRepository.findOne({ where: { id }, relations })
  }

  getParentsByOrganizationId(
    organizationId: string,
    select: FindOptionsSelect<FinancialTransactionParent>
  ): Promise<FinancialTransactionParent[]> {
    return this.financialTransactionParentRepository.find({ select, where: { organizationId } })
  }

  getParentsByOrganizationIdAndIds(
    organizationId: string,
    ids: string[],
    select: FindOptionsSelect<FinancialTransactionParent>
  ): Promise<FinancialTransactionParent[]> {
    return this.financialTransactionParentRepository.find({ select, where: { organizationId, id: In(ids) } })
  }

  getParentsByOrganizationIdAndPublicIds(
    organizationId: string,
    publicIds: string[],
    select?: FindOptionsSelect<FinancialTransactionParent>,
    relations?: FindOptionsRelations<FinancialTransactionParent>
  ): Promise<FinancialTransactionParent[]> {
    return this.financialTransactionParentRepository.find({
      select,
      where: { organizationId, publicId: In(publicIds) },
      relations
    })
  }

  getParentsByOrganizationIdAndExportStatuses(
    organizationId: string,
    exportStatuses: FinancialTransactionParentExportStatus[],
    select: FindOptionsSelect<FinancialTransactionParent>
  ): Promise<FinancialTransactionParent[]> {
    return this.financialTransactionParentRepository.find({
      select,
      where: { organizationId, exportStatus: In(exportStatuses) }
    })
  }

  getParentsByOrganizationIdAndActivity(
    organizationId: string,
    activities: FinancialTransactionParentActivity[],
    childStartingId: string
  ): Promise<FinancialTransactionParent[]> {
    return this.financialTransactionParentRepository.find({
      where: {
        organizationId,
        activity: In(activities),
        financialTransactionChild: {
          id: MoreThan(childStartingId)
        }
      },
      relations: { financialTransactionChild: { financialTransactionChildMetadata: true } }
    })
  }

  async upsertChild(dto: CreateFinancialTransactionChildDto) {
    const financialTransactionChild = await FinancialTransactionChild.createFromDto(dto)

    try {
      const exist = await this.financialTransactionChildRepository.findOne({
        where: { publicId: financialTransactionChild.publicId, organizationId: dto.organizationId },
        relations: { financialTransactionChildMetadata: true }
      })

      if (!exist) {
        const child = await this.financialTransactionChildRepository.save(financialTransactionChild)
        const metadata = FinancialTransactionChildMetadata.createFromDtoAndChild(dto, child)
        await this.financialTransactionChildMetadataRepository.save(metadata)

        child.financialTransactionChildMetadata = metadata
        return child
      } else {
        const metadata = exist.financialTransactionChildMetadata
        const partialMetadata: Partial<FinancialTransactionChildMetadata> = {}
        if (metadata.type !== dto.type) {
          partialMetadata.type = dto.type
        }

        if (metadata.gainLossInclusionStatus !== dto.gainLossInclusionStatus) {
          partialMetadata.gainLossInclusionStatus = dto.gainLossInclusionStatus
        }

        if (Object.keys(partialMetadata).length) {
          await this.financialTransactionChildMetadataRepository.update(metadata.id, partialMetadata)
        }
      }

      return exist
    } catch (e) {
      this.logger.error('financialTransactionChild save error:', financialTransactionChild, e)
      throw e
    }
  }

  getChildWithMetadataById(id: string) {
    return this.financialTransactionChildRepository.findOne({
      where: { id: id },
      relations: { cryptocurrency: true, financialTransactionChildMetadata: true }
    })
  }

  getChildById(id: string, relations?: FindOptionsRelations<FinancialTransactionChild>) {
    return this.financialTransactionChildRepository.findOne({
      where: { id },
      relations
    })
  }

  getChildWithAllRelationsById(id: string) {
    return this.financialTransactionChildRepository.findOne({
      where: { id: id },
      relations: {
        financialTransactionChildMetadata: {
          category: true,
          correspondingChartOfAccount: true
        },
        financialTransactionParent: {
          financialTransactionChild: true
        },
        cryptocurrency: {
          addresses: true
        }
      }
    })
  }

  updateParent(id: string, financialTransactionParent: DeepPartial<FinancialTransactionParent>) {
    return this.financialTransactionParentRepository.update(id, financialTransactionParent)
  }

  updateChildMetadata(id: string, metadata: QueryDeepPartialEntity<FinancialTransactionChildMetadata>) {
    return this.financialTransactionChildMetadataRepository.update(id, metadata)
  }

  getChildMetadataCountByTypeUpdatedByUser(organizationId: string, type: FinancialTransactionChildMetadataType) {
    return this.financialTransactionChildMetadataRepository.count({
      where: {
        financialTransactionChild: { organizationId },
        type,
        correspondingChartOfAccountUpdatedBy: Like('account_%')
      }
    })
  }

  getChildMetadataCountByCounterpartyFromOrToAddressesUpdatedByUser(params: {
    organizationId: string
    addresses: string[]
    direction: FinancialTransactionChildMetadataDirection
  }) {
    params.addresses = params.addresses.map((addr) => addr.toLowerCase())

    if (params.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
      return this.financialTransactionChildMetadataRepository.count({
        where: {
          financialTransactionChild: {
            organizationId: params.organizationId,
            fromAddress: In(params.addresses)
          },
          direction: FinancialTransactionChildMetadataDirection.INCOMING,
          type: FinancialTransactionChildMetadataType.DEPOSIT,
          correspondingChartOfAccountUpdatedBy: Like('account_%')
        }
      })
    } else {
      return this.financialTransactionChildMetadataRepository.count({
        where: {
          financialTransactionChild: {
            organizationId: params.organizationId,
            toAddress: In(params.addresses)
          },
          direction: FinancialTransactionChildMetadataDirection.OUTGOING,
          type: FinancialTransactionChildMetadataType.WITHDRAWAL,
          correspondingChartOfAccountUpdatedBy: Like('account_%')
        }
      })
    }
  }

  async updateChildMetadataByOrganizationAndType(
    organizationId: string,
    type: FinancialTransactionChildMetadataType,
    updateData: QueryDeepPartialEntity<FinancialTransactionChildMetadata>
  ) {
    const childMetadataList = await this.financialTransactionChildMetadataRepository.find({
      select: { id: true },
      where: {
        financialTransactionChild: { organizationId },
        type
      }
    })
    if (childMetadataList?.length > 0) {
      return this.financialTransactionChildMetadataRepository.update(
        childMetadataList.map((child) => child.id),
        updateData
      )
    }
  }

  async updateChildMetadataByCounterpartyFromOrToAddresses(params: {
    organizationId: string
    addresses: string[]
    updateData: QueryDeepPartialEntity<FinancialTransactionChildMetadata>
  }) {
    params.addresses = params.addresses.map((addr) => addr.toLowerCase())
    const incomingChildMetadataList = await this.financialTransactionChildMetadataRepository.find({
      select: { id: true },
      where: {
        financialTransactionChild: {
          organizationId: params.organizationId,
          fromAddress: In(params.addresses)
        },
        direction: FinancialTransactionChildMetadataDirection.INCOMING,
        type: FinancialTransactionChildMetadataType.DEPOSIT
      }
    })

    if (incomingChildMetadataList?.length > 0) {
      await this.financialTransactionChildMetadataRepository.update(
        incomingChildMetadataList.map((child) => child.id),
        params.updateData
      )
    }

    const outgoingChildMetadataList = await this.financialTransactionChildMetadataRepository.find({
      select: { id: true },
      where: {
        financialTransactionChild: {
          organizationId: params.organizationId,
          toAddress: In(params.addresses)
        },
        direction: FinancialTransactionChildMetadataDirection.OUTGOING,
        type: FinancialTransactionChildMetadataType.WITHDRAWAL
      }
    })

    if (outgoingChildMetadataList?.length > 0) {
      await this.financialTransactionChildMetadataRepository.update(
        outgoingChildMetadataList.map((outgoing) => outgoing.id),
        params.updateData
      )
    }
  }

  updateChildMetadataByChildId(childId: string, metadata: Partial<FinancialTransactionChildMetadata>) {
    return this.financialTransactionChildMetadataRepository.update(
      { financialTransactionChild: { id: childId } },
      metadata
    )
  }

  updateChildIdWithStatus(id: string, status: FinancialTransactionChildMetadataStatus) {
    return this.financialTransactionChildMetadataRepository.update(
      { financialTransactionChild: { id: id } },
      { status: status }
    )
  }

  async createOrUpdateParent(dto: CreateFinancialTransactionParentDto) {
    const financialTransactionParent = FinancialTransactionParent.createFromDto(dto)

    try {
      const exist = await this.financialTransactionParentRepository.findOne({
        where: {
          publicId: financialTransactionParent.publicId,
          organizationId: dto.organizationId
        }
      })
      if (!exist) {
        return this.financialTransactionParentRepository.save(financialTransactionParent)
      } else {
        if (exist.activity !== dto.activity) {
          await this.financialTransactionParentRepository.update(exist.id, { activity: dto.activity })
          exist.activity = dto.activity
        }
      }
      return exist
    } catch (e) {
      this.logger.error('financialTransactionParent create error: ', financialTransactionParent, e)
      throw e
    }
  }

  updateParentIdWithExportStatusAndReason(
    id: string,
    exportStatus: FinancialTransactionParentExportStatus,
    exportStatusReason?: string
  ) {
    return this.financialTransactionParentRepository.update(id, {
      exportStatus,
      exportStatusReason: exportStatusReason ?? null
    })
  }

  updateParentIdWithRemark(id: string, remark?: string) {
    return this.financialTransactionParentRepository.update(id, {
      remark: remark ?? null
    })
  }

  updateParentByOrganizationWithExportStatusAndReason(
    organizationId: string,
    exportStatus: FinancialTransactionParentExportStatus,
    exportStatusReason?: string
  ) {
    return this.financialTransactionParentRepository.update({ organizationId }, { exportStatus, exportStatusReason })
  }

  async upsertPreprocess(dto: CreateFinancialTransactionPreprocessDto) {
    const financialTransactionPreprocess = FinancialTransactionPreprocess.createFromDto(dto)

    try {
      const exist = await this.financialTransactionPreprocessRepository.findOne({
        where: { uniqueId: financialTransactionPreprocess.uniqueId }
      })
      return exist ? exist : this.financialTransactionPreprocessRepository.save(financialTransactionPreprocess)
    } catch (e) {
      this.logger.error('FinancialTransactionPreprocess create error ', financialTransactionPreprocess, e)
      return
    }
  }

  getPreprocessHashesByAddressAndChainAndStatus(params: {
    address: string
    blockchainId: string
    status: FinancialTransactionPreprocessStatus
    startingId: string
    skip: number
    take: number
  }): Promise<FinancialTransactionPreprocess[]> {
    params.address = params.address.toLowerCase()

    const individualWhereConditions: FindOptionsWhere<FinancialTransactionPreprocess> = {
      status: params.status,
      blockchainId: params.blockchainId
    }

    if (params.startingId) {
      individualWhereConditions.id = MoreThan(params.startingId)
    }

    const whereConditions: FindOptionsWhere<FinancialTransactionPreprocess>[] = [
      { ...individualWhereConditions, fromAddress: params.address },
      { ...individualWhereConditions, toAddress: params.address }
    ]

    return this.financialTransactionPreprocessRepository.find({
      select: { id: true, hash: true },
      where: whereConditions,
      skip: params.skip,
      take: params.take,
      order: { valueTimestamp: Direction.ASC, id: Direction.ASC }
    })
  }

  getPreprocessTransactionsByHash(
    hash: string,
    status: FinancialTransactionPreprocessStatus
  ): Promise<FinancialTransactionPreprocess[]> {
    return this.financialTransactionPreprocessRepository.find({
      where: { hash, status },
      relations: { cryptocurrency: true },
      order: { id: Direction.ASC }
    })
  }

  getParentByHashAndOrganization(hash: string, organizationId: string) {
    return this.financialTransactionParentRepository.findOne({
      where: { hash: hash, organizationId: organizationId },
      relations: {
        financialTransactionChild: {
          financialTransactionChildMetadata: {
            category: true,
            correspondingChartOfAccount: true
          },
          cryptocurrency: true
        }
      }
    })
  }

  getParentByHashAndOrganizationAndBlockchainId(hash: string, organizationId: string, blockchainId) {
    return this.financialTransactionParentRepository.findOne({
      where: { hash, organizationId, blockchainId }
    })
  }

  getChildrenByHashAndOrganizationId(params: {
    hash: string
    address: string
    organizationId: string
    blockchainId: string
  }) {
    const individualWhereConditions: FindOptionsWhere<FinancialTransactionChild> = {
      hash: params.hash,
      organizationId: params.organizationId,
      blockchainId: params.blockchainId
    }

    const whereConditions: FindOptionsWhere<FinancialTransactionChild>[] = [
      {
        ...individualWhereConditions,
        fromAddress: params.address,
        financialTransactionChildMetadata: { direction: FinancialTransactionChildMetadataDirection.OUTGOING }
      },
      {
        ...individualWhereConditions,
        toAddress: params.address,
        financialTransactionChildMetadata: { direction: FinancialTransactionChildMetadataDirection.INCOMING }
      }
    ]

    return this.financialTransactionChildRepository.find({
      where: whereConditions,
      relations: {
        financialTransactionChildMetadata: { category: true, correspondingChartOfAccount: true },
        cryptocurrency: true,
        financialTransactionChildAnnotations: { annotation: true }
      }
    })
  }

  getChildWithMetadataByOrganizationIdAndPublicId(params: { publicId: string; organizationId: string }) {
    return this.financialTransactionChildRepository.findOne({
      where: {
        publicId: params.publicId,
        organizationId: params.organizationId
      },
      relations: {
        financialTransactionChildMetadata: true
      }
    })
  }

  getChildByOrganizationIdAndPublicId(params: {
    publicId: string
    organizationId: string
    relations?: FindOptionsRelations<FinancialTransactionChild>
  }) {
    return this.financialTransactionChildRepository.findOne({
      where: {
        publicId: params.publicId,
        organizationId: params.organizationId
      },
      relations: params.relations
    })
  }

  getCryptocurrenciesByAddressesAndBlockchainAndOrganization(
    addresses: string[],
    blockchainId: string,
    organizationId: string,
    lastCompletedFinancialTransactionChildId: string | null
  ) {
    let whereQuery = 'child.organization_id = :organizationId AND child.blockchain_id = :blockchainId'

    if (lastCompletedFinancialTransactionChildId) {
      whereQuery += ' AND child.id > :lastCompletedFinancialTransactionChildId'
    }

    whereQuery += ' AND (child.from_address IN (:...addresses) OR child.to_address IN (:...addresses))'

    return this.financialTransactionChildRepository
      .createQueryBuilder('child')
      .select(['child.cryptocurrency_id'])
      .loadAllRelationIds({ relations: ['cryptocurrency'] })
      .where(whereQuery, {
        organizationId,
        blockchainId,
        addresses,
        lastCompletedFinancialTransactionChildId
      })
      .distinctOn(['child.cryptocurrency_id'])
      .getRawMany()
  }

  async saveFile(file: FinancialTransactionFile) {
    return this.financialTransactionFileRepository.save(file)
  }

  async getFileByOrganizationIdAndPublicId(param: { organizationId: string; childPublicId: string; publicId: string }) {
    const child = await this.getChildByOrganizationIdAndPublicId({
      organizationId: param.organizationId,
      publicId: param.childPublicId
    })

    if (!child) {
      return null
    }

    return this.financialTransactionFileRepository.findOne({
      where: {
        publicId: param.publicId,
        organizationId: param.organizationId,
        financialTransactionChildId: child.id
      }
    })
  }

  getParentActivity(params: {
    fromDtoList: (CreateFinancialTransactionChildDto | FinancialTransactionChild)[]
    toDtoList: (CreateFinancialTransactionChildDto | FinancialTransactionChild)[]
    cryptoWrappedMapping: CryptoWrappedMapping[]
  }): FinancialTransactionParentActivity {
    const fromDtoListWithoutGasFee: (CreateFinancialTransactionChildDto | FinancialTransactionChild)[] = []
    const gasFeeDtoList: (CreateFinancialTransactionChildDto | FinancialTransactionChild)[] = []

    for (const fromDto of params.fromDtoList) {
      // When the type is gas fee, the toAddress will be null
      if (!fromDto.toAddress) {
        gasFeeDtoList.push(fromDto)
      } else {
        fromDtoListWithoutGasFee.push(fromDto)
      }
    }

    const fromWithoutGasFeeCount = fromDtoListWithoutGasFee.length
    const toCount = params.toDtoList.length

    // Originally the default should be contract_interaction.
    // But there is an edge case for gnosis transaction when the line item are from different wallet
    // https://etherscan.io/tx/0x1406d53f9748ed7481c25b4e3c767367d53737742acd9c342d2cca0179e980d7
    let activity = FinancialTransactionParentActivity.TRANSFER
    // if (fromWithoutGasFeeCount > 0 || toCount > 0) {
    //   activity = FinancialTransactionParentActivity.TRANSFER
    // }

    if (fromWithoutGasFeeCount === 1 && toCount === 1) {
      const fromDto = fromDtoListWithoutGasFee.at(0)
      const toDto = params.toDtoList.at(0)

      const wrapParentTypeOrNull = this.getWrapParentTypeOrNull({
        fromDto: fromDto,
        toDto: toDto,
        cryptoWrappedMapping: params.cryptoWrappedMapping
      })

      if (wrapParentTypeOrNull) {
        activity = wrapParentTypeOrNull
      } else if (fromDto.cryptocurrency?.id !== toDto.cryptocurrency?.id) {
        activity = FinancialTransactionParentActivity.SWAP
      }
    }

    return activity
  }

  // The transaction should only 1 have incoming and 1 outgoing
  getWrapParentTypeOrNull(params: {
    fromDto: CreateFinancialTransactionChildDto | FinancialTransactionChild
    toDto: CreateFinancialTransactionChildDto | FinancialTransactionChild
    cryptoWrappedMapping: CryptoWrappedMapping[]
  }) {
    if (params.fromDto.fromAddress !== params.toDto.toAddress) {
      return null
    }

    if (params.fromDto.cryptocurrencyAmount !== params.toDto.cryptocurrencyAmount) {
      return null
    }

    const cryptocurrencies = [].concat(params.fromDto.cryptocurrency.id).concat(params.toDto.cryptocurrency.id)
    const cryptoWrappedMapping = params.cryptoWrappedMapping.find(
      (cryptoWrappedMapping) =>
        cryptocurrencies.includes(cryptoWrappedMapping.cryptocurrency.id) &&
        cryptocurrencies.includes(cryptoWrappedMapping.wrappedCryptocurrency.id)
    )
    if (!cryptoWrappedMapping) {
      return null
    }

    if (params.fromDto.cryptocurrency.id === cryptoWrappedMapping.cryptocurrency.id) {
      return FinancialTransactionParentActivity.WRAP
    }

    if (params.fromDto.cryptocurrency.id === cryptoWrappedMapping.wrappedCryptocurrency.id) {
      return FinancialTransactionParentActivity.UNWRAP
    }

    return null
  }

  getChildWithDeleted(childId: string) {
    return this.financialTransactionChildRepository.findOne({ where: { id: childId }, withDeleted: true })
  }

  generatePartialChildMetadataForCostBasisUpdate(params: {
    childId: string
    taxLotSales: TaxLotSale[]
    updatedBy: string
  }): Partial<FinancialTransactionChildMetadata> {
    const partialMetadata: Partial<FinancialTransactionChildMetadata> = {}

    const costBasis = params.taxLotSales.reduce(
      (sum, curr) => Decimal.add(sum, Decimal.mul(curr.costBasisPerUnit, curr.soldAmount)),
      new Decimal(0)
    )

    // const child = await this.getChildWithMetadataById(params.childId)

    partialMetadata.costBasis = costBasis.toString()
    partialMetadata.costBasisUpdatedAt = dateHelper.getUTCTimestamp()
    partialMetadata.costBasisUpdatedBy = params.updatedBy
    // partialMetadata.gainLoss = Decimal.sub(child.financialTransactionChildMetadata.fiatAmount, costBasis).toString()

    return partialMetadata
  }

  generatePartialChildMetadataForPriceUpdate(params: {
    cryptocurrencyAmount: string
    pricePerUnit?: Decimal
    totalPrice?: Decimal
    fiatCurrency: string
    updatedBy: string
  }) {
    if (!params.pricePerUnit && !params.totalPrice) {
      const errorMessage = 'Price update needs to have pricePerUnit or totalPrice'
      this.logger.error(errorMessage)
      throw new BadRequestException(errorMessage)
    }
    const partialMetadata: Partial<FinancialTransactionChildMetadata> = {}
    const tempDate = dateHelper.getUTCTimestamp()

    if (params.pricePerUnit) {
      partialMetadata.fiatAmountPerUnit = params.pricePerUnit.toString()
      partialMetadata.fiatAmount = Decimal.mul(
        partialMetadata.fiatAmountPerUnit,
        params.cryptocurrencyAmount
      ).toString()
    } else {
      partialMetadata.fiatAmountPerUnit = Decimal.div(params.totalPrice, params.cryptocurrencyAmount).toString()
      partialMetadata.fiatAmount = params.totalPrice.toString()
    }

    partialMetadata.fiatCurrency = params.fiatCurrency

    partialMetadata.fiatAmountUpdatedBy = params.updatedBy
    partialMetadata.fiatAmountUpdatedAt = tempDate
    partialMetadata.fiatAmountPerUnitUpdatedBy = params.updatedBy
    partialMetadata.fiatAmountPerUnitUpdatedAt = tempDate

    return partialMetadata
  }

  generatePartialChildMetadataForWipingCostBasis(updatedBy: string): Partial<FinancialTransactionChildMetadata> {
    const partialMetadata: Partial<FinancialTransactionChildMetadata> = {}
    partialMetadata.costBasis = null
    partialMetadata.costBasisUpdatedAt = dateHelper.getUTCTimestamp()
    partialMetadata.costBasisUpdatedBy = updatedBy
    partialMetadata.gainLoss = null
    return partialMetadata
  }

  addSubstatusToChildMetadata(
    substatus: FinancialTransactionChildMetadataSubstatus,
    metadata: Partial<FinancialTransactionChildMetadata>
  ) {
    if (!metadata.substatuses) {
      metadata.substatuses = []
    }
    if (!metadata.substatuses.includes(substatus)) {
      metadata.substatuses.push(substatus)
    }
  }

  removeSubstatusFromChildMetadata(
    substatus: FinancialTransactionChildMetadataSubstatus,
    metadata: Partial<FinancialTransactionChildMetadata>
  ) {
    if (metadata?.substatuses && metadata.substatuses.includes(substatus)) {
      metadata.substatuses.splice(metadata.substatuses.indexOf(substatus), 1)
    }
  }

  // async changeChildStatus(params: {
  //   organizationId: string
  //   childId: string
  //   childMetadataId: string
  //   status: FinancialTransactionChildMetadataStatus
  // }) {
  //   const child = await this.financialTransactionChildRepository.findOne({ where: { id: params.childId } })
  //   const metadata = await this.financialTransactionChildMetadataRepository.findOne({
  //     where: { id: params.childMetadataId }
  //   })

  //   let updateChildMetadata: Partial<FinancialTransactionChildMetadata> = {}
  //   let toRecalculateGainLoss = false

  //   if (params.status === FinancialTransactionChildMetadataStatus.IGNORED) {
  //     if (metadata.status !== FinancialTransactionChildMetadataStatus.SYNCED) {
  //       this.logger.log('Transaction is not in the right state to be ignored', metadata.status)
  //       throw new BadRequestException('Transaction is not in the right state to be ignored')
  //     }
  //     toRecalculateGainLoss = true

  //     updateChildMetadata = this.generatePartialChildMetadataForWipingCostBasis('service_gain_loss_workflow')

  //     updateChildMetadata.status = FinancialTransactionChildMetadataStatus.IGNORED
  //   } else if (params.status === FinancialTransactionChildMetadataStatus.SYNCED) {
  //     if (metadata.status !== FinancialTransactionChildMetadataStatus.IGNORED) {
  //       throw new BadRequestException('Cannot un-ignore a transaction that is not ignored')
  //     }

  //     updateChildMetadata = {
  //       status: FinancialTransactionChildMetadataStatus.SYNCED
  //     }
  //     toRecalculateGainLoss = true
  //   }

  //   await this.updateChildMetadata(metadata.id, updateChildMetadata)

  //   if (toRecalculateGainLoss) {
  //     const fromWallet = await this.walletsService.getByOrganizationIdAndAddress(
  //       params.organizationId,
  //       child.fromAddress,
  //       { walletGroup: true }
  //     )

  //     const toWallet = await this.walletsService.getByOrganizationIdAndAddress(params.organizationId, child.toAddress, {
  //       walletGroup: true
  //     })

  //     const blockchainIds = await this.blockchainsService.getEnabledBlockchainPublicIds()
  //     if (fromWallet?.walletGroup?.id) {
  //       for (const blockchainId of blockchainIds) {
  //         this.eventEmitter.emit(
  //           FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_RESYNC_GAIN_LOSS_FOR_WALLET_GROUP,
  //           ResyncGainLossForGroupEventParams.map({ walletGroupId: fromWallet.walletGroup.id, blockchainId })
  //         )
  //       }
  //     }

  //     if (toWallet?.walletGroup?.id && toWallet.walletGroup.id !== fromWallet?.walletGroup?.id) {
  //       for (const blockchainId of blockchainIds) {
  //         this.eventEmitter.emit(
  //           FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_RESYNC_GAIN_LOSS_FOR_WALLET_GROUP,
  //           ResyncGainLossForGroupEventParams.map({ walletGroupId: toWallet.walletGroup.id, blockchainId })
  //         )
  //       }
  //     }
  //   }
  // }

  // Steps:
  // 1. Skip if counterparty is another wallet
  // 2. SoftDelete FinancialTransactionChildMetadata entry
  // 3. SoftDelete FinancialTransactionChild entry
  // 4. SoftDelete parent or update parent activity
  // 5. Trigger gain loss workflow update for the group + chain (upstream)
  async deleteByOrganizationIdAndAddress(params: { organizationId: string; wallet: Wallet }) {
    if (!params.wallet.address || !params.wallet.walletGroup?.id) {
      this.logger.error('deleteByOrganizationIdAndAddress require a valid wallet with address and groupId', params)
    }

    const wallets = await this.walletsService.getAllByOrganizationId(params.organizationId, { walletGroup: true })
    const remainingAddresses = new Set<string>()
    for (const wallet of wallets) {
      if (wallet.address !== params.wallet.address.toLowerCase()) {
        remainingAddresses.add(wallet.address)
      }
    }

    const children = await this.getAllChildrenFromAddress({
      organizationId: params.organizationId,
      address: params.wallet.address,
      relations: { financialTransactionChildMetadata: true, financialTransactionParent: true }
    })

    const affectedWalletAddresses = new Set<string>()
    const deletedParentIds = new Set<string>()

    for (const child of children) {
      // The transactions are not deleted only if the counterparty is another wallet and of the opposite leg of the transaction
      if (
        child.fromAddress === params.wallet.address &&
        remainingAddresses.has(child.toAddress) &&
        (child.financialTransactionChildMetadata.type === FinancialTransactionChildMetadataType.DEPOSIT_INTERNAL ||
          child.financialTransactionChildMetadata.type === FinancialTransactionChildMetadataType.DEPOSIT_GROUP)
      ) {
        affectedWalletAddresses.add(child.toAddress)
        continue
      }

      if (
        child.toAddress === params.wallet.address &&
        remainingAddresses.has(child.fromAddress) &&
        (child.financialTransactionChildMetadata.type === FinancialTransactionChildMetadataType.WITHDRAWAL_INTERNAL ||
          child.financialTransactionChildMetadata.type === FinancialTransactionChildMetadataType.WITHDRAWAL_GROUP)
      ) {
        affectedWalletAddresses.add(child.fromAddress)
        continue
      }

      await this.financialTransactionChildAnnotationEntityService.softDeleteByResourceIds({
        resourceIds: [child.id],
        deletedBy: `system_delete_wallet_flow`
      })
      await this.financialTransactionChildMetadataRepository.softDelete({ financialTransactionChild: { id: child.id } })
      await this.financialTransactionChildRepository.softDelete(child.id)
      deletedParentIds.add(child.financialTransactionParent.id)
    }

    for (const deletedParentId of deletedParentIds) {
      const parent = await this.financialTransactionParentRepository.findOne({
        where: { id: deletedParentId },
        relations: {
          financialTransactionChild: true
        }
      })

      if (!parent.financialTransactionChild?.length) {
        await this.financialTransactionParentRepository.softDelete(parent.id)
      } else {
        const fromCountList = parent.financialTransactionChild.filter((child) =>
          remainingAddresses.has(child.fromAddress)
        )
        const toCountList = parent.financialTransactionChild.filter((child) => remainingAddresses.has(child.toAddress))
        const cryptoWrappedMapping = await this.cryptoWrappedMappingsEntityService.getAll()

        const parentActivity = this.getParentActivity({
          fromDtoList: fromCountList,
          toDtoList: toCountList,
          cryptoWrappedMapping
        })
        await this.financialTransactionParentRepository.update(parent.id, { activity: parentActivity })
      }
    }

    return affectedWalletAddresses
  }

  // Steps:
  // 1. SoftDelete FinancialTransactionChildMetadata entry
  // 2. SoftDelete FinancialTransactionChild entry
  // 3. SoftDelete parent
  // 4. Trigger full sync for all wallets (upstream)
  async deleteByWalletAndTurnedOffBlockchains(params: {
    organizationId: string
    wallet: Wallet
    turnedOffBlockchains: string[]
  }) {
    if (!params.wallet.address || !params.wallet.walletGroup?.id) {
      this.logger.error('deleteByOrganizationIdAndAddress require a valid wallet with address and groupId', params)
    }

    const wallets = await this.walletsService.getAllByOrganizationId(params.organizationId, { walletGroup: true })
    const remainingAddresses = new Set<string>()
    for (const wallet of wallets) {
      if (wallet.address !== params.wallet.address.toLowerCase()) {
        remainingAddresses.add(wallet.address)
      }
    }

    const children = await this.getAllChildrenFromAddress({
      organizationId: params.organizationId,
      address: params.wallet.address,
      blockchainIds: params.turnedOffBlockchains,
      relations: { financialTransactionChildMetadata: true, financialTransactionParent: true }
    })

    const deletedParentIds = new Set<string>()

    for (const child of children) {
      // delete all transactions. Full sync will be triggered separately and re-create them
      await this.financialTransactionChildMetadataRepository.softDelete({ financialTransactionChild: { id: child.id } })
      await this.financialTransactionChildRepository.softDelete(child.id)
      deletedParentIds.add(child.financialTransactionParent.id)
    }

    for (const deletedParentId of deletedParentIds) {
      await this.financialTransactionParentRepository.softDelete(deletedParentId)
    }
  }

  async getFilesByOrganizationIdAndChildPublicId(param: { organizationId: string; childPublicId: string }) {
    const child = await this.getChildByOrganizationIdAndPublicId({
      organizationId: param.organizationId,
      publicId: param.childPublicId
    })

    if (!child) {
      return []
    }

    return this.financialTransactionFileRepository.find({
      where: {
        organizationId: param.organizationId,
        financialTransactionChildId: child.id
      }
    })
  }

  async getChildByHashAndOrganization(hash: string, organizationId: string): Promise<FinancialTransactionChild[]> {
    return this.financialTransactionChildRepository.find({
      where: {
        hash: ILike(hash),
        organizationId
      },
      relations: {
        financialTransactionChildMetadata: {
          category: true,
          correspondingChartOfAccount: true
        }
      }
    })
  }

  async getAllUnpopulatedGnosisChild(params: { organizationId: string; address: string; blockchainId: string }) {
    return this.financialTransactionChildRepository.find({
      where: {
        organizationId: params.organizationId,
        blockchainId: params.blockchainId,
        fromAddress: params.address.toLowerCase(),
        financialTransactionChildMetadata: {
          gnosisMetadata: IsNull()
        }
      },
      relations: {
        financialTransactionChildMetadata: true
      }
    })
  }

  async softDeleteFinancialTransactionChildren(children: FinancialTransactionChild[]) {
    const metadataIds = children.map((child) => child.financialTransactionChildMetadata.id)
    await this.financialTransactionChildMetadataRepository.softDelete(metadataIds)

    const ids = children.map((child) => child.id)
    await this.financialTransactionFileRepository.softDelete({ financialTransactionChildId: In(ids) })
    await this.financialTransactionChildRepository.softDelete(ids)
  }

  softDeleteFinancialTransactionPreprocesses(transactions: FinancialTransactionPreprocess[]) {
    const ids = transactions.map((txn) => txn.id)
    return this.financialTransactionPreprocessRepository.softDelete(ids)
  }

  softDeleteFile(id: string) {
    return this.financialTransactionFileRepository.softDelete(id)
  }

  updateGnosisChildMetadata(id: string, gnosisMetadata: FinancialTransactionChildGnosisMetadata) {
    return this.financialTransactionChildMetadataRepository.update(id, {
      gnosisMetadata
    })
  }

  async getChildMetaDataByCategory(organizationId: string, category_id: string) {
    return this.financialTransactionChildMetadataRepository
      .createQueryBuilder('financial_transaction_child_metadata')
      .leftJoinAndSelect('financial_transaction_child_metadata.financialTransactionChild', 'ftc_data')
      .where('ftc_data.organizationId = :organizationId', { organizationId: organizationId })
      .where(
        'financial_transaction_child_metadata.category_id = :category_id and financial_transaction_child_metadata.deleted_at is null',
        { category_id: category_id }
      )
      .getOne()
  }

  getChildrenByNullChartOfAccount(organizationId: string, financialTransactionChildIds?: string[]) {
    // ORM Bug hence we need to use raw sql -> https://github.com/typeorm/typeorm/issues/8890

    let whereConditions = `fn_tx_child.deleted_at is null AND fn_tx_child.organization_id = :organizationId AND fn_tx_child_metadata.corresponding_coa_id is null`

    if (financialTransactionChildIds?.length > 0) {
      whereConditions += ` AND fn_tx_child.id IN (:...financialTransactionChildIds)`
    }

    return this.financialTransactionChildRepository
      .createQueryBuilder('fn_tx_child')
      .leftJoinAndSelect('fn_tx_child.financialTransactionChildMetadata', 'fn_tx_child_metadata')
      .leftJoinAndSelect('fn_tx_child_metadata.correspondingChartOfAccount', 'coa')
      .innerJoinAndSelect('fn_tx_child.cryptocurrency', 'crypto')
      .innerJoinAndSelect('fn_tx_child.financialTransactionParent', 'parent')
      .where(whereConditions, {
        organizationId: organizationId,
        financialTransactionChildIds: financialTransactionChildIds
      })
      .getMany()
  }

  async getCountByFinancialTrnx(organizationId: number) {
    try {
      const correspondingChartOfAccount = await this.financialTransactionChildMetadataRepository
        .createQueryBuilder('financial_transaction_child_metadata')
        .innerJoinAndSelect('financial_transaction_child_metadata.correspondingChartOfAccount', 'ftcmCOA')
        .leftJoinAndSelect('financial_transaction_child_metadata.financialTransactionChild', 'ftc')
        .select('COUNT(financial_transaction_child_metadata.id)', 'count')
        .addSelect('ftcmCOA.public_id', 'public_id')
        .addSelect('ftcmCOA.name', 'name')
        .addSelect('ftcmCOA.code', 'code')
        .addSelect('ftcmCOA.type', 'type')
        .addSelect('ftcmCOA.description', 'description')
        .where('ftc.organization_id = :organizationId', {
          organizationId: organizationId
        })
        .groupBy('ftcmCOA.id')
        .getRawMany()
      return correspondingChartOfAccount
    } catch (error) {
      this.logger.error('getCountByFinancialTrnx has errors', { organizationId }, error)
      throw Error(error)
    }
  }

  updateChildMetadataByCorrespondingCOAUpdatedById(
    correspondingChartOfAccountUpdatedBy: string,
    partialData: QueryDeepPartialEntity<FinancialTransactionChildMetadata>
  ) {
    return this.financialTransactionChildMetadataRepository.update(
      { correspondingChartOfAccountUpdatedBy },
      partialData
    )
  }

  getChildrenWithCoaByOrganizationId(organizationId: string) {
    return this.financialTransactionChildRepository.find({
      where: {
        organizationId,
        financialTransactionChildMetadata: {
          correspondingChartOfAccount: {
            id: Not(IsNull())
          }
        }
      },
      relations: { financialTransactionChildMetadata: { correspondingChartOfAccount: true } }
    })
  }

  getTransactionsCountByCOAId(COAId: string) {
    return this.financialTransactionChildMetadataRepository.count({
      where: {
        correspondingChartOfAccount: {
          id: COAId
        }
      }
    })
  }

  replaceMetadataCOAId(previousCOAId: string, newCOAId: string) {
    const newMetadata: QueryDeepPartialEntity<FinancialTransactionChildMetadata> = {}
    newMetadata.correspondingChartOfAccount = newCOAId ? { id: newCOAId } : null

    return this.financialTransactionChildMetadataRepository.update(
      { correspondingChartOfAccount: { id: previousCOAId } },
      newMetadata
    )
  }

  getChildrenByValueDateBatched(params: { date: Date; skip: number; take: number }) {
    const dateComponent = dateHelper.getDateComponentFromDateTimestamp(params.date)

    return this.financialTransactionChildRepository.find({
      where: { valueTimestamp: Raw((alias) => `DATE(${alias}) = '${dateComponent}'`) },
      relations: { financialTransactionChildMetadata: true, cryptocurrency: true, financialTransactionParent: true },
      skip: params.skip,
      take: params.take
    })
  }
}
