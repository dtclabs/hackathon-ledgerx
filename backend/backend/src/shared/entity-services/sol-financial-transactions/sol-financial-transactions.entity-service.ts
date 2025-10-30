import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { LoggerService } from '../../logger/logger.service'
import { WalletsEntityService } from '../wallets/wallets.entity-service'
import { SolFinancialTransactionChildMetadata } from './sol-financial-transaction-child-metadata.entity'
import { SolFinancialTransactionChild } from './sol-financial-transaction-child.entity'
import { SolFinancialTransactionParent } from './sol-financial-transaction-parent.entity'
import {
  CreateSolFinancialTransactionChildDto,
  CreateSolFinancialTransactionParentDto,
  SolFinancialTransactionChildMetadataStatus,
  SolFinancialTransactionParentActivity
} from './interfaces'

@Injectable()
export class SolFinancialTransactionsEntityService extends BaseEntityService<SolFinancialTransactionParent> {
  constructor(
    @InjectRepository(SolFinancialTransactionParent)
    private solFinancialTransactionParentRepository: Repository<SolFinancialTransactionParent>,
    @InjectRepository(SolFinancialTransactionChild)
    private solFinancialTransactionChildRepository: Repository<SolFinancialTransactionChild>,
    @InjectRepository(SolFinancialTransactionChildMetadata)
    private solFinancialTransactionChildMetadataRepository: Repository<SolFinancialTransactionChildMetadata>,
    private logger: LoggerService,
    private walletsEntityService: WalletsEntityService
  ) {
    super(solFinancialTransactionParentRepository)
  }

  async createOrUpdateParent(dto: CreateSolFinancialTransactionParentDto): Promise<SolFinancialTransactionParent> {
    const solFinancialTransactionParent = SolFinancialTransactionParent.createFromDto(dto)

    try {
      const exist = await this.solFinancialTransactionParentRepository.findOne({
        where: {
          publicId: solFinancialTransactionParent.publicId,
          organizationId: dto.organizationId
        }
      })

      if (!exist) {
        return this.solFinancialTransactionParentRepository.save(solFinancialTransactionParent)
      } else {
        if (exist.activity !== dto.activity) {
          await this.solFinancialTransactionParentRepository.update(exist.id, { activity: dto.activity })
          exist.activity = dto.activity
        }
      }
      return exist
    } catch (e) {
      this.logger.error('solFinancialTransactionParent create error: ', solFinancialTransactionParent, e)
      throw e
    }
  }

  async upsertChild(dto: CreateSolFinancialTransactionChildDto): Promise<SolFinancialTransactionChild> {
    const solFinancialTransactionChild = SolFinancialTransactionChild.createFromDto(dto)

    try {
      const exist = await this.solFinancialTransactionChildRepository.findOne({
        where: { 
          publicId: solFinancialTransactionChild.publicId, 
          organizationId: dto.organizationId 
        },
        relations: { solFinancialTransactionChildMetadata: true }
      })

      if (!exist) {
        const child = await this.solFinancialTransactionChildRepository.save(solFinancialTransactionChild)
        const metadata = SolFinancialTransactionChildMetadata.createFromDtoAndChild(dto, child)
        await this.solFinancialTransactionChildMetadataRepository.save(metadata)

        child.solFinancialTransactionChildMetadata = metadata
        return child
      } else {
        const metadata = exist.solFinancialTransactionChildMetadata
        const partialMetadata: Partial<SolFinancialTransactionChildMetadata> = {}
        
        if (metadata.type !== dto.type) {
          partialMetadata.type = dto.type
        }
        if (metadata.direction !== dto.direction) {
          partialMetadata.direction = dto.direction
        }
        if (metadata.status !== dto.status) {
          partialMetadata.status = dto.status
        }

        if (Object.keys(partialMetadata).length > 0) {
          await this.solFinancialTransactionChildMetadataRepository.update(metadata.id, partialMetadata)
        }

        return exist
      }
    } catch (e) {
      this.logger.error('solFinancialTransactionChild upsert error: ', solFinancialTransactionChild, e)
      throw e
    }
  }

  async getTransactionsByWallet(
    organizationId: string, 
    walletAddress: string, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<SolFinancialTransactionParent[]> {
    return this.solFinancialTransactionParentRepository
      .createQueryBuilder('parent')
      .leftJoinAndSelect('parent.solFinancialTransactionChild', 'child')
      .leftJoinAndSelect('child.solFinancialTransactionChildMetadata', 'metadata')
      .leftJoinAndSelect('child.cryptocurrency', 'cryptocurrency')
      .where('parent.organizationId = :organizationId', { organizationId })
      .andWhere('(child.fromAddress = :walletAddress OR child.toAddress = :walletAddress)', { walletAddress })
      .orderBy('parent.valueTimestamp', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany()
  }

  async getWalletBalances(
    organizationId: string, 
    walletAddress: string
  ): Promise<{ tokenAddress: string; symbol: string; balance: string }[]> {
    this.logger.debug('Getting wallet balances', { organizationId, walletAddress })
    
    const query = `
      SELECT 
        COALESCE(ca.address, child.token_address) as "tokenAddress",
        c.symbol,
        SUM(
          CASE 
            WHEN child.to_address = $2 THEN CAST(child.cryptocurrency_amount as DECIMAL)
            WHEN child.from_address = $2 THEN -CAST(child.cryptocurrency_amount as DECIMAL)
            ELSE 0
          END
        )::TEXT as balance
      FROM sol_financial_transaction_child child
      INNER JOIN cryptocurrency c ON child.cryptocurrency_id = c.id
      LEFT JOIN cryptocurrency_address ca ON c.id = ca.cryptocurrency_id AND ca.blockchain_id = 'solana'
      INNER JOIN sol_financial_transaction_parent parent ON child.sol_financial_transaction_parent_id = parent.id
      WHERE parent.organization_id = $1
        AND (child.from_address = $2 OR child.to_address = $2)
        AND parent.deleted_at IS NULL
        AND child.deleted_at IS NULL
      GROUP BY COALESCE(ca.address, child.token_address), c.symbol
      HAVING SUM(
        CASE 
          WHEN child.to_address = $2 THEN CAST(child.cryptocurrency_amount as DECIMAL)
          WHEN child.from_address = $2 THEN -CAST(child.cryptocurrency_amount as DECIMAL)
          ELSE 0
        END
      ) != 0
      ORDER BY c.symbol
    `

    const result = await this.solFinancialTransactionParentRepository.query(query, [organizationId, walletAddress])
    
    this.logger.debug('Wallet balances query result', { 
      organizationId, 
      walletAddress, 
      resultCount: result?.length || 0,
      results: result 
    })
    
    return result
  }

  async debugWalletTransactions(organizationId: string, walletAddress: string): Promise<any[]> {
    const query = `
      SELECT 
        child.from_address,
        child.to_address,
        child.token_address,
        child.cryptocurrency_amount,
        c.symbol,
        parent.organization_id
      FROM sol_financial_transaction_child child
      INNER JOIN cryptocurrency c ON child.cryptocurrency_id = c.id
      INNER JOIN sol_financial_transaction_parent parent ON child.sol_financial_transaction_parent_id = parent.id
      WHERE parent.organization_id = $1
        AND (child.from_address = $2 OR child.to_address = $2 OR child.from_address ILIKE $2 OR child.to_address ILIKE $2)
        AND parent.deleted_at IS NULL
        AND child.deleted_at IS NULL
      LIMIT 10
    `

    return await this.solFinancialTransactionParentRepository.query(query, [organizationId, walletAddress])
  }

  async getChildWithMetadataById(id: string): Promise<SolFinancialTransactionChild> {
    return this.solFinancialTransactionChildRepository.findOne({
      where: { id },
      relations: {
        solFinancialTransactionChildMetadata: true,
        cryptocurrency: true,
        solFinancialTransactionParent: true
      }
    })
  }

  async getAllTransactionsPaging(
    organizationId: string, 
    options: {
      page: number
      size: number
      walletIds?: string[]
      symbol?: string
      type?: string
      direction?: string
      startDate?: Date
      endDate?: Date
      fromAddress?: string
      toAddress?: string
      address?: string
      txHash?: string
      activity?: string
      substatuses?: string[]
      walletAddresses?: string[]
    }
  ): Promise<{
    items: SolFinancialTransactionChild[]
    totalItems: number
    totalPages: number
    currentPage: number
    limit: number
  }> {
    // Build base query
    let baseQuery = this.solFinancialTransactionChildRepository
      .createQueryBuilder('child')
      .leftJoin('child.solFinancialTransactionParent', 'parent')
      .leftJoin('child.solFinancialTransactionChildMetadata', 'metadata')
      .leftJoin('child.cryptocurrency', 'cryptocurrency')
      .where('parent.organizationId = :organizationId', { organizationId })
      .andWhere('parent.deletedAt IS NULL')
      .andWhere('child.deletedAt IS NULL')

    // Filter by wallet IDs if provided
    if (options.walletIds && options.walletIds.length > 0) {
      // Get wallet addresses from publicIds
      const wallets = await this.walletsEntityService.getByOrganizationAndPublicIds(organizationId, options.walletIds)
      // Preserve case for Solana addresses
      const walletAddresses = wallets.map(w => w.address)
      
      if (walletAddresses.length > 0) {
        baseQuery.andWhere(
          '(child.fromAddress IN (:...walletAddresses) OR child.toAddress IN (:...walletAddresses))',
          { walletAddresses }
        )
      }
    }

    // Filter by symbol
    if (options.symbol) {
      baseQuery.andWhere('cryptocurrency.symbol ILIKE :symbol', { symbol: `%${options.symbol}%` })
    }

    // Filter by type
    if (options.type) {
      baseQuery.andWhere('metadata.type = :type', { type: options.type })
    }

    // Filter by direction
    if (options.direction) {
      baseQuery.andWhere('metadata.direction = :direction', { direction: options.direction.toLowerCase() })
    }

    // Filter by specific from address
    if (options.fromAddress) {
      baseQuery.andWhere('child.fromAddress = :fromAddress', { fromAddress: options.fromAddress })
    }

    // Filter by specific to address
    if (options.toAddress) {
      baseQuery.andWhere('child.toAddress = :toAddress', { toAddress: options.toAddress })
    }

    // Filter by either from or to address
    if (options.address) {
      baseQuery.andWhere(
        '(child.fromAddress = :address OR child.toAddress = :address)',
        { address: options.address }
      )
    }

    // Filter by date range
    if (options.startDate) {
      baseQuery.andWhere('parent.valueTimestamp >= :startDate', { startDate: options.startDate })
    }

    if (options.endDate) {
      baseQuery.andWhere('parent.valueTimestamp <= :endDate', { endDate: options.endDate })
    }

    // Filter by transaction hash
    if (options.txHash) {
      baseQuery.andWhere('parent.hash = :txHash', { txHash: options.txHash })
    }

    // Filter by activity
    if (options.activity) {
      baseQuery.andWhere('parent.activity = :activity', { activity: options.activity.toLowerCase() })
    }

    // Filter by substatuses
    if (options.substatuses && options.substatuses.length > 0) {
      baseQuery.andWhere('metadata.substatuses && :substatuses', { substatuses: options.substatuses })
    }

    // Filter by wallet addresses
    if (options.walletAddresses && options.walletAddresses.length > 0) {
      baseQuery.andWhere(
        '(child.fromAddress IN (:...walletAddresses) OR child.toAddress IN (:...walletAddresses))',
        { walletAddresses: options.walletAddresses }
      )
    }

    // Get total count first
    const totalItems = await baseQuery.getCount()

    // Create new query for getting actual results with all relations
    const dataQuery = this.solFinancialTransactionChildRepository
      .createQueryBuilder('child')
      .leftJoinAndSelect('child.solFinancialTransactionParent', 'parent')
      .leftJoinAndSelect('child.solFinancialTransactionChildMetadata', 'metadata')
      .leftJoinAndSelect('child.cryptocurrency', 'cryptocurrency')
      .where('parent.organizationId = :organizationId', { organizationId })
      .andWhere('parent.deletedAt IS NULL')
      .andWhere('child.deletedAt IS NULL')

    // Apply the same filters to data query
    if (options.walletIds && options.walletIds.length > 0) {
      const wallets = await this.walletsEntityService.getByOrganizationAndPublicIds(organizationId, options.walletIds)
      // Preserve case for Solana addresses
      const walletAddresses = wallets.map(w => w.address)
      
      if (walletAddresses.length > 0) {
        dataQuery.andWhere(
          '(child.fromAddress IN (:...walletAddresses) OR child.toAddress IN (:...walletAddresses))',
          { walletAddresses }
        )
      }
    }

    if (options.symbol) {
      dataQuery.andWhere('cryptocurrency.symbol ILIKE :symbol', { symbol: `%${options.symbol}%` })
    }

    if (options.type) {
      dataQuery.andWhere('metadata.type = :type', { type: options.type })
    }

    if (options.direction) {
      dataQuery.andWhere('metadata.direction = :direction', { direction: options.direction.toLowerCase() })
    }

    // Filter by specific from address
    if (options.fromAddress) {
      dataQuery.andWhere('child.fromAddress = :fromAddress', { fromAddress: options.fromAddress })
    }

    // Filter by specific to address
    if (options.toAddress) {
      dataQuery.andWhere('child.toAddress = :toAddress', { toAddress: options.toAddress })
    }

    // Filter by either from or to address
    if (options.address) {
      dataQuery.andWhere(
        '(child.fromAddress = :address OR child.toAddress = :address)',
        { address: options.address }
      )
    }

    if (options.startDate) {
      dataQuery.andWhere('parent.valueTimestamp >= :startDate', { startDate: options.startDate })
    }

    if (options.endDate) {
      dataQuery.andWhere('parent.valueTimestamp <= :endDate', { endDate: options.endDate })
    }

    // Filter by transaction hash
    if (options.txHash) {
      dataQuery.andWhere('parent.hash = :txHash', { txHash: options.txHash })
    }

    // Filter by activity
    if (options.activity) {
      dataQuery.andWhere('parent.activity = :activity', { activity: options.activity.toLowerCase() })
    }

    // Filter by substatuses
    if (options.substatuses && options.substatuses.length > 0) {
      dataQuery.andWhere('metadata.substatuses && :substatuses', { substatuses: options.substatuses })
    }

    // Filter by wallet addresses
    if (options.walletAddresses && options.walletAddresses.length > 0) {
      dataQuery.andWhere(
        '(child.fromAddress IN (:...walletAddresses) OR child.toAddress IN (:...walletAddresses))',
        { walletAddresses: options.walletAddresses }
      )
    }

    // Apply ordering and pagination to data query
    const items = await dataQuery
      .orderBy('parent.valueTimestamp', 'DESC')
      .skip(options.page * options.size)
      .take(options.size)
      .getMany()

    const totalPages = Math.ceil(totalItems / options.size)

    return {
      items,
      totalItems,
      totalPages,
      currentPage: options.page,
      limit: options.size
    }
  }
}