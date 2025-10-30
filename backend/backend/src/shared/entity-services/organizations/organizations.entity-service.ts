import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Organization } from './organization.entity'

@Injectable()
export class OrganizationsEntityService extends BaseEntityService<Organization> {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>
  ) {
    super(organizationsRepository)
  }

  async getOrganizationsByAccountId(accountId: string) {
    return await this.organizationsRepository.find({
      where: {
        members: {
          account: {
            id: accountId
          }
        }
      }
    })
  }

  async findOneByPublicId(publicId: string): Promise<Organization> {
    return await this.organizationsRepository.findOne({ where: { publicId: publicId }, cache: 10000 })
  }
}
