import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthWallet } from './wallet.entity'
import { v4 } from 'uuid'
import { BaseEntityService } from '../base.entity-service'

@Injectable()
export class WalletsEntityService extends BaseEntityService<AuthWallet> {
  constructor(
    @InjectRepository(AuthWallet)
    private walletsRepository: Repository<AuthWallet>
  ) {
    super(walletsRepository)
  }

  add(wallet: AuthWallet): Promise<AuthWallet> {
    return this.walletsRepository.save(wallet)
  }

  findOneByAddress(address: string): Promise<AuthWallet> {
    return this.walletsRepository.findOne({ where: { address }, relations: ['account'] })
  }

  findAvailableWallet(address: string): Promise<AuthWallet> {
    return this.walletsRepository.findOne({ where: { address }, relations: ['account'] })
  }

  generateNonce() {
    return v4()
  }
}
