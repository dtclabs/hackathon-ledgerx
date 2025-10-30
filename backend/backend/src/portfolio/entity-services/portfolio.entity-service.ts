import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../shared/entity-services/base.entity-service'
import { PortfolioPosition, PortfolioTransaction } from '../portfolio.entity'

@Injectable()
export class PortfolioPositionsEntityService extends BaseEntityService<PortfolioPosition> {
  constructor(
    @InjectRepository(PortfolioPosition)
    private portfolioPositionRepository: Repository<PortfolioPosition>
  ) {
    super(portfolioPositionRepository)
  }

  async getByWalletAndSymbol(walletId: string, symbol: string): Promise<PortfolioPosition | null> {
    return this.portfolioPositionRepository.findOne({
      where: { walletId, symbol }
    })
  }

  async getByWallet(walletId: string): Promise<PortfolioPosition[]> {
    return this.portfolioPositionRepository.find({
      where: { walletId },
      order: { currentValue: 'DESC' }
    })
  }

  async getByOrganization(organizationId: string): Promise<PortfolioPosition[]> {
    return this.portfolioPositionRepository.find({
      where: { organizationId },
      relations: ['wallet'],
      order: { currentValue: 'DESC' }
    })
  }

  async updatePosition(position: PortfolioPosition): Promise<PortfolioPosition> {
    return this.portfolioPositionRepository.save(position)
  }

  async deleteByWalletAndSymbol(walletId: string, symbol: string): Promise<void> {
    await this.portfolioPositionRepository.delete({ walletId, symbol })
  }
}

@Injectable()
export class PortfolioTransactionsEntityService extends BaseEntityService<PortfolioTransaction> {
  constructor(
    @InjectRepository(PortfolioTransaction)
    private portfolioTransactionRepository: Repository<PortfolioTransaction>
  ) {
    super(portfolioTransactionRepository)
  }

  async getByWallet(walletId: string, limit = 100): Promise<PortfolioTransaction[]> {
    return this.portfolioTransactionRepository.find({
      where: { walletId },
      order: { transactionDate: 'DESC' },
      take: limit
    })
  }

  async getByTransactionHash(hash: string, blockchain: string): Promise<PortfolioTransaction | null> {
    return this.portfolioTransactionRepository.findOne({
      where: { transactionHash: hash, blockchain }
    })
  }

  async getBuyTransactionsForPosition(
    walletId: string, 
    symbol: string, 
    beforeDate?: Date
  ): Promise<PortfolioTransaction[]> {
    const query = this.portfolioTransactionRepository
      .createQueryBuilder('pt')
      .where('pt.walletId = :walletId', { walletId })
      .andWhere('pt.symbol = :symbol', { symbol })
      .andWhere('pt.type IN (:...types)', { types: ['BUY', 'TRANSFER_IN'] })
      .orderBy('pt.transactionDate', 'ASC')

    if (beforeDate) {
      query.andWhere('pt.transactionDate <= :beforeDate', { beforeDate })
    }

    return query.getMany()
  }

  async createTransaction(transaction: Partial<PortfolioTransaction>): Promise<PortfolioTransaction> {
    const newTransaction = PortfolioTransaction.create(transaction)
    return this.portfolioTransactionRepository.save(newTransaction)
  }

  async updateTransaction(transaction: PortfolioTransaction): Promise<PortfolioTransaction> {
    return this.portfolioTransactionRepository.save(transaction)
  }
}