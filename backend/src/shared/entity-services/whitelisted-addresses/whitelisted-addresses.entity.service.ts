import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { WhitelistedAddress } from './whitelisted-address.entity'

@Injectable()
export class WhitelistedAddressesEntityService extends BaseEntityService<WhitelistedAddress> {
  constructor(
    @InjectRepository(WhitelistedAddress)
    private whitelistedAddressRepository: Repository<WhitelistedAddress>
  ) {
    super(whitelistedAddressRepository)
  }

  async getByAddress(address: string) {
    return this.whitelistedAddressRepository.findOne({ where: { address: ILike(address) } })
  }
}
