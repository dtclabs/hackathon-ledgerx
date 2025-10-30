import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Decimal from 'decimal.js'
import {
  DeleteResult,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  Repository,
  UpdateResult
} from 'typeorm'
import { Direction, PaginationParams } from '../../../core/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { LoggerService } from '../../logger/logger.service'
import { BaseEntityService } from '../base.entity-service'
import {
  CostBasisCalculationMethod,
  CreateTaxLotDto,
  CreateTaxLotSaleDto,
  GetAvailableTaxLotDto,
  TaxLotStatus
} from './interfaces'
import { TaxLotSale, TaxLotSaleAuditMetadata } from './tax-lot-sale.entity'
import { TaxLot, TaxLotAuditMetadata } from './tax-lot.entity'

@Injectable()
export class GainsLossesEntityService extends BaseEntityService<TaxLot> {
  constructor(
    @InjectRepository(TaxLot)
    private taxLotRepository: Repository<TaxLot>,
    @InjectRepository(TaxLotSale)
    private taxLotSaleRepository: Repository<TaxLotSale>,
    private logger: LoggerService
  ) {
    super(taxLotRepository)
  }

  async createOrUpdateTaxLot(dto: CreateTaxLotDto) {
    const auditMetadata: TaxLotAuditMetadata = {
      amountAvailable: dto.amountAvailable,
      updatedAt: dateHelper.getUTCTimestamp(),
      newCostBasisPerUnit: dto.costBasisPerUnit,
      updatedBy: dto.updatedBy,
      previousCostBasisPerUnit: null,
      status: dto.status,
      statusReason: dto.statusReason
    }

    const newTaxLot: TaxLot = TaxLot.createFromDto(dto, auditMetadata)
    const whereCondition: FindOptionsWhere<TaxLot> = { financialTransactionChildId: dto.financialTransactionChildId }
    const exist = await this.taxLotRepository.findOne({
      where: whereCondition
    })

    if (!exist) {
      await this.taxLotRepository.save(newTaxLot)
    } else {
      auditMetadata.amountAvailable = exist.amountAvailable
      auditMetadata.previousCostBasisPerUnit = exist.costBasisPerUnit

      const updateData: Partial<TaxLot> = {
        status: dto.status,
        statusReason: dto.statusReason,
        costBasisAmount: dto.costBasisAmount,
        costBasisPerUnit: dto.costBasisPerUnit,
        previousTaxLotSaleId: dto.previousTaxLotSaleId,
        transferredAt: dto.transferredAt,
        auditMetadataList: (exist.auditMetadataList ?? []).concat(auditMetadata)
      }

      await this.taxLotRepository.update(exist.id, updateData)
    }
  }

  async createOrUpdateInternalTaxLot(dto: CreateTaxLotDto) {
    const auditMetadata: TaxLotAuditMetadata = {
      amountAvailable: dto.amountAvailable,
      updatedAt: dateHelper.getUTCTimestamp(),
      newCostBasisPerUnit: dto.costBasisPerUnit,
      updatedBy: dto.updatedBy,
      previousCostBasisPerUnit: null,
      status: dto.status,
      statusReason: dto.statusReason
    }

    const newTaxLot: TaxLot = TaxLot.createFromDto(dto, auditMetadata)
    const whereCondition: FindOptionsWhere<TaxLot> = {
      financialTransactionChildId: dto.financialTransactionChildId,
      previousTaxLotSaleId: dto.previousTaxLotSaleId
    }
    const exist = await this.taxLotRepository.findOne({
      where: whereCondition
    })

    if (!exist) {
      await this.taxLotRepository.save(newTaxLot)
    } else {
      auditMetadata.amountAvailable = exist.amountAvailable
      auditMetadata.previousCostBasisPerUnit = exist.costBasisPerUnit

      const updateData: Partial<TaxLot> = {
        status: dto.status,
        statusReason: dto.statusReason,
        costBasisAmount: dto.costBasisAmount,
        costBasisPerUnit: dto.costBasisPerUnit,
        previousTaxLotSaleId: dto.previousTaxLotSaleId,
        transferredAt: dto.transferredAt,
        auditMetadataList: (exist.auditMetadataList ?? []).concat(auditMetadata)
      }

      await this.taxLotRepository.update(exist.id, updateData)
    }
  }

  async sellTaxLot(taxLot: TaxLot, soldAmount: string) {
    const update = {}

    const updatedAmount = Decimal.sub(taxLot.amountAvailable, soldAmount)
    update['amountAvailable'] = updatedAmount.toString()

    //TODO: handle case when updatedAmount < 0
    if (updatedAmount.equals(0)) {
      update['status'] = TaxLotStatus.SOLD
    }

    await this.taxLotRepository.update(taxLot.id, update)
  }

  async createTaxLotSale(dto: CreateTaxLotSaleDto) {
    //TODO: error handling
    await this.sellTaxLot(dto.taxLot, dto.soldAmount)

    const exist = await this.taxLotSaleRepository.findOne({
      where: {
        financialTransactionChildId: dto.financialTransactionChildId,
        taxLot: { id: dto.taxLot.id },
        soldAmount: dto.soldAmount
      },
      withDeleted: true
    })

    if (dto.taxLot.costBasisPerUnit === null) {
      this.logger.error(`Cost basis per unit is null for tax lot`, {
        taxLotId: dto.taxLot.id,
        dto
      })
    }

    const taxLotSale: TaxLotSale = TaxLotSale.createFromDto(dto)

    const auditMetadata: TaxLotSaleAuditMetadata = {
      updatedAt: new Date(Date.now()),
      newCostBasisPerUnit: taxLotSale.costBasisPerUnit,
      newCostBasisAmount: taxLotSale.costBasisAmount,
      updatedBy: dto.updatedBy,
      previousCostBasisPerUnit: null,
      previousCostBasisAmount: null
    }

    taxLotSale.auditMetadataList.push(auditMetadata)

    let createdTaxLotSaleId = exist?.id

    if (!exist) {
      createdTaxLotSaleId = (await this.taxLotSaleRepository.save(taxLotSale)).id
    } else {
      if (exist.deletedAt !== null) {
        await this.taxLotSaleRepository.restore(exist.id)
      }
      auditMetadata.previousCostBasisPerUnit = exist.costBasisPerUnit
      auditMetadata.previousCostBasisAmount = exist.costBasisAmount
      const updatedData: Partial<TaxLotSale> = taxLotSale
      updatedData.auditMetadataList = exist.auditMetadataList.concat(auditMetadata)
      await this.taxLotSaleRepository.update(exist.id, updatedData)
    }
    return this.taxLotSaleRepository.findOne({ where: { id: createdTaxLotSaleId }, relations: { taxLot: true } })
  }

  async getAvailableTaxLotsFromDto(dto: GetAvailableTaxLotDto): Promise<TaxLot[]> {
    const allTaxLots = await this.taxLotRepository.find({
      where: {
        purchasedAt: LessThanOrEqual(dto.soldAt),
        status: TaxLotStatus.AVAILABLE,
        cryptocurrency: {
          id: dto.cryptocurrency.id
        },
        blockchainId: dto.blockchainId,
        walletId: dto.walletId,
        organizationId: dto.organizationId
      },
      order: {
        id: Direction.ASC
      }
    })

    if (dto.costBasisCalculationMethod === CostBasisCalculationMethod.FIFO) {
      allTaxLots.sort((a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime())
    } else if (dto.costBasisCalculationMethod === CostBasisCalculationMethod.LIFO) {
      allTaxLots.sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime())
    }

    return allTaxLots
  }

  getTaxLotsByChildId(childId: string, relations: FindOptionsRelations<TaxLot> = {}) {
    return this.taxLotRepository.find({
      where: { financialTransactionChildId: childId },
      relations
    })
  }

  getTaxLotsByPreviousSaleId(previousTaxLotSaleId: string, relations: FindOptionsRelations<TaxLot> = {}) {
    return this.taxLotRepository.find({
      where: { previousTaxLotSaleId },
      relations
    })
  }

  getTaxLotSalesByChildId(childId: string, relations?: FindOptionsRelations<TaxLotSale>) {
    return this.taxLotSaleRepository.find({
      where: {
        financialTransactionChildId: childId
      },
      relations
    })
  }

  getTaxLotSaleById(id: string, relations?: FindOptionsRelations<TaxLotSale>) {
    return this.taxLotSaleRepository.findOne({
      where: { id },
      relations
    })
  }

  async getCostBasisByChildId(childId: string): Promise<Decimal> {
    const taxLotSales = await this.taxLotSaleRepository.find({
      where: {
        financialTransactionChildId: childId
      }
    })

    return taxLotSales.reduce(
      (sum, curr) => Decimal.add(sum, Decimal.mul(curr.costBasisPerUnit, curr.soldAmount)),
      new Decimal(0)
    )
  }

  getAvailableTaxLots(params: {
    organizationId: string
    blockchainIds?: string[]
    nameOrSymbol?: string
    nameOrSymbolOrAddress?: string
    walletIds?: string[]
    cryptocurrencyIds?: string[]
  }) {
    const individualWhereConditions: FindOptionsWhere<TaxLot> = {
      status: TaxLotStatus.AVAILABLE,
      organizationId: params.organizationId
    }

    if (params.blockchainIds?.length) {
      individualWhereConditions.blockchainId = In(params.blockchainIds)
    }

    let whereConditions = { ...individualWhereConditions }

    if (params.cryptocurrencyIds?.length) {
      whereConditions = {
        ...whereConditions,
        cryptocurrency: {
          id: In(params.cryptocurrencyIds)
        }
      }
    }

    if (params.nameOrSymbolOrAddress) {
      whereConditions = {
        ...whereConditions,
        cryptocurrency: [
          {
            symbol: ILike(`%${params.nameOrSymbolOrAddress}%`)
          },
          { name: ILike(`%${params.nameOrSymbolOrAddress}%`) },
          {
            addresses: {
              address: ILike(`%${params.nameOrSymbolOrAddress}%`)
            }
          }
        ]
      }
    } else if (params.nameOrSymbol) {
      whereConditions = {
        ...whereConditions,
        cryptocurrency: [{ symbol: ILike(`%${params.nameOrSymbol}%`) }, { name: ILike(`%${params.nameOrSymbol}%`) }]
      }
    } else {
      whereConditions = {
        ...whereConditions
      }
    }

    if (params.walletIds?.length) {
      whereConditions = {
        ...whereConditions,
        walletId: In(params.walletIds)
      }
    } else {
      whereConditions = {
        ...whereConditions
      }
    }

    return this.taxLotRepository.find({
      where: whereConditions,
      relations: { cryptocurrency: { addresses: true } }
    })
  }

  getOneSoldTaxLotForCryptocurrency(params: {
    organizationId: string
    blockchainIds?: string[]
    nameOrSymbol?: string
    nameOrSymbolOrAddress?: string
    walletIds?: string[]
    cryptocurrencyIds?: string[]
  }) {
    let whereQuery = 'tl.organization_id = :organizationId AND tl.status = :status'

    if (params.blockchainIds?.length) {
      whereQuery += ' AND tl.blockchain_id IN (:...blockchainIds)'
    }

    if (params.nameOrSymbolOrAddress) {
      whereQuery +=
        ' AND (crypto.name ILIKE :nameOrSymbolOrAddress OR crypto.symbol ILIKE :nameOrSymbolOrAddress OR address.address ILIKE :nameOrSymbolOrAddress)'
    } else if (params.nameOrSymbol) {
      whereQuery += ' AND (crypto.name ILIKE :nameOrSymbol OR crypto.symbol ILIKE :nameOrSymbol)'
    }

    if (params.walletIds?.length) {
      whereQuery += ' AND (tl.walletId IN (:...walletIds))'
    }

    if (params.cryptocurrencyIds?.length) {
      whereQuery += ' AND (tl.cryptocurrency_id IN (:...cryptocurrencyIds))'
    }

    const subQuery = this.taxLotRepository
      .createQueryBuilder()
      .subQuery()
      .select('tl.id')
      .from(TaxLot, 'tl')
      .leftJoin('tl.cryptocurrency', 'crypto')
      .leftJoin('crypto.addresses', 'address')
      .where(whereQuery)
      .distinctOn(['tl.cryptocurrency_id', 'tl.blockchain_id'])

    return this.taxLotRepository
      .createQueryBuilder('taxLot')
      .leftJoinAndSelect('taxLot.cryptocurrency', 'cryptocurrency')
      .leftJoinAndSelect('cryptocurrency.addresses', 'address')
      .where(`taxLot.id in ${subQuery.getQuery()}`, {
        organizationId: params.organizationId,
        blockchainIds: params.blockchainIds,
        nameOrSymbol: params.nameOrSymbol,
        nameOrSymbolOrAddress: params.nameOrSymbolOrAddress,
        status: TaxLotStatus.SOLD,
        walletIds: params.walletIds,
        cryptocurrencyIds: params.cryptocurrencyIds
      })
      .getMany()
  }

  async getAllTaxLotsAndCount(
    organizationId: string,
    cryptocurrencyPublicId: string,
    options: PaginationParams,
    walletIds?: string[],
    blockchainId?: string,
    status?: TaxLotStatus
  ) {
    const size = options.size || 10
    const page = options.page || 0
    const order = options.order || 'purchasedAt'
    const direction = options.direction || Direction.ASC

    let where: FindOptionsWhere<TaxLot> = {
      organizationId: organizationId,
      cryptocurrency: { publicId: cryptocurrencyPublicId },
      status: status ? status : In([TaxLotStatus.AVAILABLE, TaxLotStatus.SOLD])
    }
    if (walletIds?.length) {
      where.walletId = In(walletIds)
    }

    if (blockchainId) {
      where.blockchainId = blockchainId
    }

    const [items, total] = await this.taxLotRepository.findAndCount({
      where,
      relations: ['cryptocurrency', 'cryptocurrency.addresses'],
      order: {
        [order]: direction
      },
      take: size,
      skip: page * size
    } as FindManyOptions<TaxLot>)

    return {
      totalItems: total,
      totalPages: Math.ceil(total / size),
      currentPage: page,
      items,
      limit: size
    }
  }

  async deleteTaxLotByWalletIdAndBlockchainId(
    walletIds: string[],
    blockchainId: string,
    callback?: () => Promise<unknown>
  ) {
    const whereCondition: FindOptionsWhere<TaxLot> = { walletId: In(walletIds), blockchainId: blockchainId }
    let affectedRows = 0
    do {
      const taxLotsIds = await this.getTaxLotsIds(whereCondition, 300)
      if (taxLotsIds.length === 0) {
        break
      }
      let result: DeleteResult | UpdateResult = null
      // Always hard delete tax lot for now
      result = await this.taxLotRepository.delete(taxLotsIds)

      affectedRows = result.affected ?? 0

      if (callback) {
        await callback()
      }
    } while (affectedRows > 0)
  }

  async getTaxLotsIds(whereCondition: FindOptionsWhere<TaxLot>, take: number = 300) {
    const taxLotsIds = await this.taxLotRepository.find({
      select: ['id'],
      where: whereCondition,
      take: take
    })
    return taxLotsIds.map((taxLot) => taxLot.id)
  }

  async deleteTaxLotSaleByWalletIdAndBlockchainId(
    walletIds: string[],
    blockchainId: string,
    callback?: (affectedRows: number) => Promise<unknown>
  ) {
    const whereCondition: FindOptionsWhere<TaxLotSale> = { walletId: In(walletIds), blockchainId: blockchainId }
    let affectedRows = 0
    do {
      const taxLotSaleIds = await this.getTaxLotsSaleIds(whereCondition, 300)
      let result: DeleteResult | UpdateResult = null
      if (taxLotSaleIds.length === 0) {
        break
      }

      // Always hard delete tax lot sale for now
      result = await this.taxLotSaleRepository.delete(taxLotSaleIds)

      affectedRows = result.affected ?? 0
      if (callback) {
        await callback(affectedRows)
      }
    } while (affectedRows > 0)
  }

  async getTaxLotsSaleIds(whereCondition: FindOptionsWhere<TaxLot>, take: number = 300) {
    const taxLotsSaleIds = await this.taxLotSaleRepository.find({
      select: ['id'],
      where: whereCondition,
      take: take
    })
    return taxLotsSaleIds.map((taxLotSale) => taxLotSale.id)
  }

  getByFinancialTransactionChildIdsAndStatuses(
    childIds: string[],
    statuses: TaxLotStatus[],
    relations: FindOptionsRelations<TaxLot> = {}
  ) {
    return this.taxLotRepository.find({
      where: { financialTransactionChildId: In(childIds), status: In(statuses) },
      relations
    })
  }

  async recalculateTaxLotsByWalletIdAndBlockchainId(params: { walletId: string; blockchainId: string }) {
    await this.taxLotSaleRepository.softDelete({ walletId: params.walletId, blockchainId: params.blockchainId })
    await this.taxLotRepository.update(
      { walletId: params.walletId, blockchainId: params.blockchainId },
      { status: TaxLotStatus.RECALCULATING, statusReason: null }
    )
  }

  generatePartialTaxLotForPriceUpdate(params: {
    taxLot: TaxLot
    pricePerUnit: Decimal
    updatedBy: string
    fiatCurrency?: string
  }): Partial<TaxLot> {
    const taxLotUpdate: Partial<TaxLot> = {}
    const tempDate = dateHelper.getUTCTimestamp()
    taxLotUpdate.costBasisPerUnit = params.pricePerUnit.toString()
    taxLotUpdate.costBasisAmount = Decimal.mul(params.pricePerUnit, params.taxLot.amountAvailable).toString()
    if (params.fiatCurrency) {
      taxLotUpdate.costBasisFiatCurrency = params.fiatCurrency
    }
    const auditMetadata: TaxLotAuditMetadata = {
      updatedAt: tempDate,
      amountAvailable: params.taxLot.amountAvailable,
      newCostBasisPerUnit: taxLotUpdate.costBasisPerUnit,
      updatedBy: params.updatedBy,
      previousCostBasisPerUnit: params.taxLot.costBasisPerUnit,
      status: params.taxLot.status,
      statusReason: params.taxLot.statusReason
    }
    taxLotUpdate.auditMetadataList = params.taxLot.auditMetadataList.concat(auditMetadata)
    return taxLotUpdate
  }

  generatePartialTaxLotSaleForPriceUpdate(params: {
    taxLotSale: TaxLotSale
    pricePerUnit: Decimal
    updatedBy: string
    fiatCurrency?: string
  }): Partial<TaxLotSale> {
    const taxLotSaleUpdate: Partial<TaxLotSale> = {}
    const tempDate = dateHelper.getUTCTimestamp()
    taxLotSaleUpdate.costBasisPerUnit = params.pricePerUnit.toString()
    taxLotSaleUpdate.costBasisAmount = Decimal.mul(params.pricePerUnit, params.taxLotSale.soldAmount).toString()
    taxLotSaleUpdate.costBasisUpdatedBy = params.updatedBy
    if (params.fiatCurrency) {
      taxLotSaleUpdate.costBasisFiatCurrency = params.fiatCurrency
    }
    const auditMetadata: TaxLotSaleAuditMetadata = {
      updatedAt: tempDate,
      newCostBasisPerUnit: taxLotSaleUpdate.costBasisPerUnit,
      newCostBasisAmount: taxLotSaleUpdate.costBasisAmount,
      updatedBy: taxLotSaleUpdate.costBasisUpdatedBy,
      previousCostBasisPerUnit: params.taxLotSale.costBasisPerUnit,
      previousCostBasisAmount: params.taxLotSale.costBasisAmount
    }
    taxLotSaleUpdate.auditMetadataList = params.taxLotSale.auditMetadataList.concat(auditMetadata)

    return taxLotSaleUpdate
  }

  async updateTaxLot(id: string, updateData: Partial<TaxLot>) {
    if (!updateData.auditMetadataList) {
      const taxLot = await this.taxLotRepository.findOne({ where: { id } })
      const tempDate = dateHelper.getUTCTimestamp()
      const auditMetadata: TaxLotAuditMetadata = {
        updatedAt: tempDate,
        amountAvailable: taxLot.amountAvailable,
        newCostBasisPerUnit: null,
        updatedBy: null,
        previousCostBasisPerUnit: null,
        status: taxLot.status,
        statusReason: taxLot.statusReason
      }
      updateData.auditMetadataList = taxLot.auditMetadataList.concat(auditMetadata)
    }

    return this.taxLotRepository.update(id, updateData)
  }

  async updateTaxLotSale(id: string, updateData: Partial<TaxLotSale>) {
    if (!updateData.auditMetadataList) {
      const taxLotSale = await this.taxLotSaleRepository.findOne({ where: { id } })
      const tempDate = dateHelper.getUTCTimestamp()
      const auditMetadata: TaxLotSaleAuditMetadata = {
        updatedAt: tempDate,
        newCostBasisPerUnit: null,
        updatedBy: null,
        previousCostBasisPerUnit: null,
        newCostBasisAmount: null,
        previousCostBasisAmount: null
      }
      updateData.auditMetadataList = taxLotSale.auditMetadataList.concat(auditMetadata)
    }
    return this.taxLotSaleRepository.update(id, updateData)
  }

  // TODO: Descoped for now. Should be enabled by May '23
  // async getRevalueTaxLotsAndSale(
  //   organizationId: string,
  //   purchaseAfter: Date,
  //   chainIds?: number[]
  // ): Promise<{ revalueTaxLotsGroup: { [lotId: string]: TaxLot }; taxLotSaleGroup: { [saleId: string]: string } }> {
  //   const saleWhereConditions = { soldAt: MoreThan(purchaseAfter), organizationId: organizationId }
  //   const whereConditions = {
  //     status: TaxLotStatus.AVAILABLE,
  //     purchasedAt: MoreThan(purchaseAfter),
  //     organizationId: organizationId
  //   }

  //   if (chainIds?.length) {
  //     saleWhereConditions['chainIds'] = In(chainIds)
  //     whereConditions['chainIds'] = In(chainIds)
  //   }

  //   const taxLotSales = await this.taxLotSaleRepository.find({
  //     where: saleWhereConditions,
  //     relations: ['cryptocurrency', 'cryptocurrency.addresses']
  //   })

  //   const taxLots = await this.taxLotRepository.find({
  //     where: whereConditions,
  //     relations: ['cryptocurrency', 'cryptocurrency.addresses']
  //   })

  //   const revalueTaxLotsGroup: { [lotId: string]: TaxLot } = {}

  //   for (const lot of taxLots) {
  //     revalueTaxLotsGroup[lot.id] = lot
  //   }

  //   const taxLotSaleGroup: { [saleId: string]: string } = {}

  //   for (const taxLotSale of taxLotSales) {
  //     const taxLotId = taxLotSale.taxLot.id
  //     const taxLot = revalueTaxLotsGroup[taxLotId] ?? null

  //     if (taxLot) {
  //       taxLot.amountAvailable = Decimal.add(taxLot.amountAvailable, taxLotSale.soldAmount).toString()
  //       revalueTaxLotsGroup[taxLotId] = taxLot
  //     } else {
  //       const taxLot = await this.taxLotRepository.findOne({
  //         where: { id: taxLotId },
  //         relations: ['cryptocurrency', 'cryptocurrency.addresses']
  //       })
  //       taxLot.amountAvailable = taxLotSale.soldAmount
  //       revalueTaxLotsGroup[taxLotId] = taxLot
  //     }

  //     taxLotSaleGroup[taxLotSale.id] = taxLotSale.soldAmount
  //   }

  //   return { revalueTaxLotsGroup, taxLotSaleGroup }
  // }

  async generateAndUpdatePartialTaxLotForPriceUpdate(params: {
    updatedBy: string
    taxLot: TaxLot
    pricePerUnit: Decimal
    fiatCurrency?: string
  }): Promise<TaxLot> {
    const taxLotUpdate: Partial<TaxLot> = await this.generatePartialTaxLotForPriceUpdate({
      taxLot: params.taxLot,
      pricePerUnit: params.pricePerUnit,
      updatedBy: params.updatedBy,
      fiatCurrency: params.fiatCurrency
    })

    await this.updateTaxLot(params.taxLot.id, taxLotUpdate)

    return { ...params.taxLot, ...taxLotUpdate }
  }

  async generateAndUpdateTaxLotSalesForPriceUpdate(params: {
    taxLotSales: TaxLotSale[]
    pricePerUnit: Decimal
    updatedBy: string
    fiatCurrency?: string
  }): Promise<TaxLotSale[]> {
    const affectedTaxLotSales: TaxLotSale[] = []
    if (params.taxLotSales?.length) {
      for (const sale of params.taxLotSales) {
        if (sale.costBasisAmount === null) {
          // that is internal transaction, we don't need to update
          continue
        }
        const taxLotSaleUpdate: Partial<TaxLotSale> = await this.generatePartialTaxLotSaleForPriceUpdate({
          taxLotSale: sale,
          pricePerUnit: params.pricePerUnit,
          updatedBy: params.updatedBy,
          fiatCurrency: params.fiatCurrency
        })

        await this.updateTaxLotSale(sale.id, taxLotSaleUpdate)

        affectedTaxLotSales.push({ ...sale, ...taxLotSaleUpdate })
      }
    }
    return affectedTaxLotSales
  }

  async updateTaxLotAndSalesForPriceUpdate(params: {
    updatedBy: string
    taxLot: TaxLot
    pricePerUnit: Decimal
    fiatCurrency?: string
  }): Promise<TaxLotSale[]> {
    await this.generateAndUpdatePartialTaxLotForPriceUpdate({
      taxLot: params.taxLot,
      pricePerUnit: params.pricePerUnit,
      updatedBy: params.updatedBy,
      fiatCurrency: params.fiatCurrency
    })

    return await this.generateAndUpdateTaxLotSalesForPriceUpdate({
      taxLotSales: params.taxLot.taxLotSales,
      pricePerUnit: params.pricePerUnit,
      updatedBy: params.updatedBy,
      fiatCurrency: params.fiatCurrency
    })
  }

  async getTaxLotsUntilDate(params: {
    untilDate: Date
    organizationId: string
    blockchainIds: string[]
    cryptocurrencyIds: string[]
    walletIds: string[]
  }) {
    const where: FindOptionsWhere<TaxLot> = {
      organizationId: params.organizationId,
      transferredAt: LessThanOrEqual(params.untilDate)
    }

    if (params.blockchainIds?.length) {
      where.blockchainId = In(params.blockchainIds)
    }
    if (params.cryptocurrencyIds?.length) {
      where.cryptocurrency = { id: In(params.cryptocurrencyIds) }
    }
    if (params.walletIds?.length) {
      where.walletId = In(params.walletIds)
    }

    return await this.taxLotRepository.find({
      where: where,
      order: {
        transferredAt: Direction.ASC
      },
      relations: {
        cryptocurrency: true
      }
    })
  }

  async getTaxLotSalesUntilDate(params: {
    untilDate: Date
    organizationId: string
    blockchainIds: string[]
    cryptocurrencyIds: string[]
    walletIds: string[]
  }) {
    const where: FindOptionsWhere<TaxLotSale> = {
      organizationId: params.organizationId,
      soldAt: LessThanOrEqual(params.untilDate)
    }

    if (params.blockchainIds?.length) {
      where.blockchainId = In(params.blockchainIds)
    }
    if (params.cryptocurrencyIds?.length) {
      where.cryptocurrency = { id: In(params.cryptocurrencyIds) }
    }
    if (params.walletIds?.length) {
      where.walletId = In(params.walletIds)
    }

    return await this.taxLotSaleRepository.find({
      where: where,
      order: {
        soldAt: Direction.ASC
      },
      relations: {
        cryptocurrency: true
      }
    })
  }
}
