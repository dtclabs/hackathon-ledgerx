import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { GnosisMultisigTransaction } from '../../../domain/block-explorers/gnosis/interfaces'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { TempTransactionsEntity } from './temp-transactions.entity'

@Injectable()
export class TempTransactionsEntityService extends BaseEntityService<TempTransactionsEntity> {
  constructor(
    @InjectRepository(TempTransactionsEntity)
    private tempTransactionsEntityRepository: Repository<TempTransactionsEntity>
  ) {
    super(tempTransactionsEntityRepository)
  }

  getAllNonMigratedByOrganizationId(organizationId: string, blockchainId: string) {
    return this.find({
      where: {
        organizationId,
        blockchainId,
        migratedAt: IsNull()
      },
      relations: {
        category: true,
        correspondingChartOfAccount: true
      }
    })
  }

  getAllNonMigrated() {
    return this.find({
      where: {
        migratedAt: IsNull()
      },
      relations: {
        category: true,
        correspondingChartOfAccount: true
      }
    })
  }

  async markAsMigrated(id: string) {
    await this.tempTransactionsEntityRepository.update(id, {
      migratedAt: dateHelper.getUTCTimestamp()
    })
  }

  // For gnosis use cases where the hash will be updated after the initial transaction
  async updateSafeTransactionAndHash(id: string, safeTransaction: GnosisMultisigTransaction, hash: string) {
    await this.tempTransactionsEntityRepository.update(id, {
      safeTransaction,
      hash
    })
  }

  async getAllNonMigratedByAddress(params: { address: string; blockchainId: string; organizationId: string }) {
    return this.find({
      where: {
        migratedAt: IsNull(),
        walletAddress: params.address,
        blockchainId: params.blockchainId,
        organizationId: params.organizationId
      },
      relations: {
        category: true,
        correspondingChartOfAccount: true
      }
    })
  }
}
