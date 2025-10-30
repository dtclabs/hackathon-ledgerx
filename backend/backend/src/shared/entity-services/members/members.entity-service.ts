import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Account } from '../account/account.entity'
import { Organization } from '../organizations/organization.entity'
import { Role } from '../roles/role.entity'
import { MemberProfile } from './member-profile.entity'
import { Member } from './member.entity'
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations'
import { Direction } from '../../../core/interfaces'
import { MemberQueryParams, MemberState } from '../../../members'

@Injectable()
export class MembersEntityService extends BaseEntityService<Member> {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberProfile)
    private memberProfileRepository: Repository<MemberProfile>
  ) {
    super(memberRepository)
  }

  async createNewMember(params: { role: Role; account: Account; organization: Organization }) {
    const profile = new MemberProfile()
    const newProfile = await this.memberProfileRepository.save(profile)

    const member = new Member()
    member.profile = newProfile
    member.role = params.role
    member.organization = params.organization
    member.account = params.account
    return this.create(member)
  }

  async getByOrganizationIdAndAccountId(organizationId: string, accountId: string, deletedOption = false) {
    return this.memberRepository.findOne({
      where: {
        account: {
          id: accountId
        },
        organization: {
          publicId: organizationId
        }
      },
      withDeleted: deletedOption
    })
  }

  async findByAccountAndOrganizationPublicId(
    organizationPublicId: string,
    accountId: string,
    relations: FindOptionsRelations<Member> = {}
  ) {
    return this.findOne({
      where: {
        account: {
          id: accountId
        },
        organization: {
          publicId: organizationPublicId
        }
      },
      relations
    })
  }

  async findByAccountId(accountId: string, organizationId: string, deletedOption = false): Promise<Member> {
    const members = await this.findByAccountIds([accountId], organizationId, deletedOption)
    return members.length > 0 ? members[0] : null
  }

  async findByAccountIds(accountIds: string[], organizationId: string, deletedOption = false): Promise<Member[]> {
    return await this.memberRepository.find({
      where: {
        account: {
          id: In(accountIds)
        },
        organization: {
          id: organizationId
        }
      },
      relations: {
        account: true
      },
      withDeleted: deletedOption
    })
  }

  async findByPublicIds(publicIds: string[], organizationId: string, relations?: string[]) {
    return this.find({
      where: {
        publicId: In(publicIds),
        organization: {
          id: organizationId
        }
      },
      relations: relations
    })
  }

  async getAllPagingMember(options: MemberQueryParams, organizationId: string) {
    const size = options.size || 10
    const page = options.page || 0
    const search = (options.search || '').trim().replace(/\s+/g, ' ')
    const order = options.order || 'createdAt'
    const direction = options.direction || Direction.DESC

    let whereQuery = 'organization.publicId = :organizationId'
    if (options.search) {
      whereQuery += ` AND (walletAccounts.address ILIKE :search OR emailAccounts.email ILIKE :search OR CONCAT(account.firstName || ' ' || account.lastName) LIKE :search)`
    }
    if (options.state) {
      whereQuery += ` AND member.deletedAt ${options.state === MemberState.deactivated ? 'IS NOT NULL' : 'IS NULL'}`
    }

    const params = {
      organizationId: organizationId,
      search: `%${search}%`
    }

    const [items, total] = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.organization', 'organization')
      .leftJoinAndSelect('member.account', 'account')
      .leftJoinAndSelect('account.walletAccounts', 'walletAccounts')
      .leftJoinAndSelect('account.emailAccounts', 'emailAccounts')
      .leftJoinAndSelect('member.role', 'role')
      .where(whereQuery, params)
      .orderBy(`member.${order}`, direction)
      .skip(size * page)
      .take(size)
      .withDeleted()
      .getManyAndCount()

    return {
      totalItems: total,
      totalPages: Math.ceil(total / size),
      currentPage: page,
      items,
      limit: size
    }
  }

  getByOrganizationIdChainAndNameOrAddress(params: {
    organizationId: string
    blockchainId?: string
    nameOrAddress?: string
  }) {
    let query = 'organization.id = :organizationId'

    if (params.nameOrAddress) {
      query += ` AND (addresses.address ILIKE :search OR concat(account.firstName, ' ', account.lastName) ILIKE :search)`
    }

    if (params.blockchainId) {
      query += ' AND blockchain_id = :blockchainId'
    }

    const sql = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.organization', 'organization')
      .leftJoinAndSelect('member.account', 'account')
      .leftJoinAndSelect('member.profile', 'profile')
      .leftJoinAndSelect('profile.addresses', 'addresses')
      .leftJoinAndSelect('addresses.token', 'token')
      .where(query, {
        organizationId: params.organizationId,
        search: `%${params.nameOrAddress}%`,
        blockchainId: params.blockchainId
      })
    return sql.getMany()
  }
}
