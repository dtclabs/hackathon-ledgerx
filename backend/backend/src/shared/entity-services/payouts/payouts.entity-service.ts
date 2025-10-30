import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOptionsWhere, In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Payout } from './payout.entity'
import { LineItem, PayoutMetadata, PayoutStatus, PayoutType } from './interfaces'
import { Wallet } from '../wallets/wallet.entity'

@Injectable()
export class PayoutsEntityService extends BaseEntityService<Payout> {
  constructor(
    @InjectRepository(Payout)
    private payoutsRepository: Repository<Payout>
  ) {
    super(payoutsRepository)
  }

  async softDeleteBySourceWallet(sourceWallet: Wallet) {
    return await this.payoutsRepository.softDelete({
      sourceWallet: { id: sourceWallet.id }
    })
  }

  async findOneBySafeHash(safeHash: string, organizationId: string): Promise<Payout> {
    return await this.payoutsRepository.findOne({
      where: { safeHash: safeHash, organization: { id: organizationId } },
      relations: { organization: true }
    })
  }

  async findBySourceWallet(
    sourceWallet: DeepPartial<Wallet>,
    options?: {
      blockchainId?: string
      statuses?: PayoutStatus[]
    }
  ): Promise<Payout[]> {
    const whereConditions: FindOptionsWhere<Payout> = {
      sourceWallet: { id: sourceWallet.id }
    }
    if (options) {
      if (options.blockchainId) {
        whereConditions.blockchainId = options.blockchainId
      }
      if (options.statuses) {
        whereConditions.status = In(options.statuses)
      }
    }
    return await this.payoutsRepository.find({
      where: whereConditions
    })
  }
}
