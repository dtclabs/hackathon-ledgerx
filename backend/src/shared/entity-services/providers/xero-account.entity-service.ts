import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { AuthXero } from './xero-account.entity'

@Injectable()
export class XeroEntityService extends BaseEntityService<AuthXero> {
  constructor(
    @InjectRepository(AuthXero)
    private xeroRepository: Repository<AuthXero>
  ) {
    super(xeroRepository)
  }

  findOneByXeroUserId(xeroUserId = ''): Promise<AuthXero> {
    return this.xeroRepository.findOne({ where: { xeroUserId: xeroUserId }, relations: { account: true } })
  }
}
