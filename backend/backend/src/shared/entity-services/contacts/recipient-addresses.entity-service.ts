import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { RecipientAddress } from './recipient-address.entity'

@Injectable()
export class RecipientAddressesEntityService extends BaseEntityService<RecipientAddress> {
  constructor(
    @InjectRepository(RecipientAddress)
    private recipientAddressesRepository: Repository<RecipientAddress>
  ) {
    super(recipientAddressesRepository)
  }

  async findOneByPublicId(publicId: string, organizationId: string): Promise<RecipientAddress> {
    return await this.recipientAddressesRepository.findOneBy({
      publicId: publicId,
      recipient: {
        organization: { id: organizationId }
      }
    })
  }

  async findByPublicIds(publicIds: string[], organizationId: string): Promise<RecipientAddress[]> {
    return await this.recipientAddressesRepository.findBy({
      publicId: In(publicIds),
      recipient: {
        organization: { id: organizationId }
      }
    })
  }
}
