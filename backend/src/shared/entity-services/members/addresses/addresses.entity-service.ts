import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { MemberAddress } from './address.entity'

@Injectable()
export class MemberAddressesEntityService extends BaseEntityService<MemberAddress> {
  constructor(
    @InjectRepository(MemberAddress)
    private memberAddressRepository: Repository<MemberAddress>
  ) {
    super(memberAddressRepository)
  }

  // TODO: Standardize the return value and return properly
  async checkAddressByOrganization(address: string, blockchainId: string, organizationId: string) {
    return this.memberAddressRepository.findOne({
      relations: {
        profile: true
      },
      where: {
        address: ILike(address),
        blockchainId: blockchainId,
        profile: {
          member: {
            organization: {
              id: organizationId
            }
          }
        }
      }
    })
  }

  // TODO: Standardize the return value and return properly

  async checkAddressByOrganizationNoChain(address: string, organizationId: string) {
    return this.memberAddressRepository.findOne({
      relations: {
        profile: true
      },
      where: {
        address: ILike(address),
        profile: {
          member: {
            organization: {
              id: organizationId
            }
          }
        }
      }
    })
  }
}
