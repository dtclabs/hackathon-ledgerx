import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Invitation } from './invitation.entity'
import { InvitationStatus } from '../../../invitations/interface'
import { Direction, PaginationParams } from '../../../core/interfaces'

@Injectable()
export class InvitationsEntityService extends BaseEntityService<Invitation> {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>
  ) {
    super(invitationsRepository)
  }

  async getAllPagingInvitation(options: PaginationParams, organizationId: string) {
    const size = options.size || 10
    const page = options.page || 0
    const search = (options.search || '').trim().replace(/\s+/g, ' ')
    const order = options.order || 'createdAt'
    const direction = options.direction || Direction.DESC

    let whereQuery = 'organization.publicId = :organizationId'
    if (options.search) {
      whereQuery += ` AND (invitation.address ILIKE :search OR invitation.email ILIKE :search OR CONCAT(invitation.firstName || ' ' || invitation.lastName) LIKE :search)`
    }

    const params = {
      organizationId: organizationId,
      search: `%${search}%`
    }

    const [items, total] = await this.invitationsRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.organization', 'organization')
      .leftJoinAndSelect('invitation.invitedBy', 'invitedBy')
      .leftJoinAndSelect('invitedBy.account', 'account')
      .leftJoinAndSelect('invitation.role', 'role')
      .where(whereQuery, params)
      .orderBy(`invitation.${order}`, direction)
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

  async findActiveInvite(param: {
    email?: string | undefined
    address?: string | undefined
    organizationPublicId: string
  }) {
    return this.findOne({
      where: {
        address: param.address ? ILike(param.address) : undefined,
        email: param.email ? ILike(param.email) : undefined,
        status: In([InvitationStatus.INVITED, InvitationStatus.ACTIVE]),
        organization: {
          publicId: param.organizationPublicId
        }
      }
    })
  }

  async updateStatusForExpired() {
    const results = this.invitationsRepository
      .createQueryBuilder()
      .update()
      .set({
        status: InvitationStatus.EXPIRED
      })
      .where('status = :status and expired_at < NOW()', { status: InvitationStatus.INVITED })
      .execute()
    console.log(`updateStatusForExpired: `, { results })
  }
}
