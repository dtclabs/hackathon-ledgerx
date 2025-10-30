import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { WalletGroup } from './wallet-group.entity'

@Injectable()
export class WalletGroupsEntityService extends BaseEntityService<WalletGroup> {
  constructor(
    @InjectRepository(WalletGroup)
    private walletGroupsRepository: Repository<WalletGroup>
  ) {
    super(walletGroupsRepository)
  }

  getByOrganization(organizationId: string, relations: string[] = []) {
    return this.walletGroupsRepository.find({
      where: {
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }

  getByOrganizationAndPublicId(organizationId: string, publicId: string, relations: string[] = []) {
    return this.walletGroupsRepository.findOne({
      where: {
        publicId,
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }

  getByOrganizationAndPublicIds(organizationId: string, publicIds: string[], relations: string[] = []) {
    return this.walletGroupsRepository.find({
      where: {
        publicId: In(publicIds),
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }
}
