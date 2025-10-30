import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaginationParams } from '../../../core/interfaces'
import { BaseEntityService } from '../base.entity-service'
import { Account } from './account.entity'

@Injectable()
export class AccountsEntityService extends BaseEntityService<Account> {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>
  ) {
    super(accountsRepository)
  }

  async getAllByOrganizationId(organizationId: string, query: PaginationParams) {
    const size = query.size || 10
    const page = query.page || 0
    const search = (query.search || '').trim()
    const order = query.order || 'createdAt'
    const direction = (query.direction || 'DESC') as 'DESC' | 'ASC'
    const [items, total] = await this.accountsRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.organization', 'organization')
      .leftJoinAndSelect('account.role', 'role')
      .leftJoinAndSelect('account.createdBy', 'createdBy')
      .leftJoinAndSelect('account.groups', 'groups')
      .leftJoinAndSelect('account.wallets', 'wallets')
      .where('account.organization_id = :organizationId AND account.name ILIKE :name', {
        organizationId,
        name: `%${search}%`
      })
      .orderBy(`account.${order}`, direction)
      .skip(size * page)
      .take(size)
      .getManyAndCount()

    return {
      totalItems: total,
      totalPages: Math.ceil(total / size),
      currentPage: page,
      items,
      limit: size
    }
  }

  updateById(id: string, payload: Partial<Account>) {
    return this.accountsRepository.update(id, payload)
  }
}
