import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { PendingTransaction } from './pending-transaction.entity'
import { Wallet } from '../wallets/wallet.entity'
import { PendingTransactionsQueryParams } from '../../../pending-transactions/interfaces'
import { PendingTransactionType } from './interfaces'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'

@Injectable()
export class PendingTransactionsEntityService extends BaseEntityService<PendingTransaction> {
  constructor(
    @InjectRepository(PendingTransaction)
    private pendingTransactionRepository: Repository<PendingTransaction>
  ) {
    super(pendingTransactionRepository)
  }

  async getAllByOrganizationPaging(
    organizationId: string,
    addresses: string[],
    options: PendingTransactionsQueryParams,
    types?: PendingTransactionType[]
  ) {
    const where: FindOptionsWhere<PendingTransaction>[] | FindOptionsWhere<PendingTransaction> = {
      organization: {
        id: organizationId
      },
      address: In(addresses),
      blockchainId: options.blockchainIds ? In(options.blockchainIds) : undefined
    }
    if (types?.length) {
      where.type = In(types)
    }

    return this.find({
      where: where,
      order: {
        nonce: 'ASC',
        submissionDate: 'DESC'
      },
      relations: { organization: true }
    })
  }

  async getBySafeHash(param: { organizationId: string; safeHash: string }) {
    return this.pendingTransactionRepository.findOne({
      where: {
        safeHash: param.safeHash,
        organization: { id: param.organizationId }
      }
    })
  }

  async getAllByWalletId(param: { organizationId: string; address: string }) {
    return this.pendingTransactionRepository.find({
      where: {
        address: param.address,
        organization: { id: param.organizationId }
      }
    })
  }

  async softDeleteByWallet(wallet: Wallet) {
    return this.pendingTransactionRepository.softDelete({
      address: wallet.address,
      organization: { id: wallet.organization.id }
    })
  }

  async upsert(entity: PendingTransaction) {
    return this.pendingTransactionRepository.upsert(entity, {
      conflictPaths: ['safeHash', 'organization']
    })
  }
}
