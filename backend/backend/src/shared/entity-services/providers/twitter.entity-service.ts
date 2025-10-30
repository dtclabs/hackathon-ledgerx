import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { AuthTwitter } from './twitter.entity'

@Injectable()
export class TwitterEntityService extends BaseEntityService<AuthTwitter> {
  constructor(
    @InjectRepository(AuthTwitter)
    private twitterRepository: Repository<AuthTwitter>
  ) {
    super(twitterRepository)
  }

  add(twitterAccount: AuthTwitter): Promise<AuthTwitter> {
    return this.twitterRepository.save(twitterAccount)
  }

  findOneByEmail(email: string): Promise<AuthTwitter> {
    return this.twitterRepository.findOne({ where: { email } })
  }
}
