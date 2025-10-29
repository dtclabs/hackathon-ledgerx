import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { AuthWhitelist } from './auth-whitelist.entity'
import { EProvider } from '../../../auth/interfaces'

@Injectable()
export class AuthWhitelistsEntityService extends BaseEntityService<AuthWhitelist> {
  constructor(
    @InjectRepository(AuthWhitelist)
    private authWhitelistsRepository: Repository<AuthWhitelist>
  ) {
    super(authWhitelistsRepository)
  }

  async findBy(identifier: string, provider: EProvider): Promise<AuthWhitelist> {
    return await this.authWhitelistsRepository.findOne({
      where: {
        provider: provider,
        identifier: identifier
      }
    })
  }
}
