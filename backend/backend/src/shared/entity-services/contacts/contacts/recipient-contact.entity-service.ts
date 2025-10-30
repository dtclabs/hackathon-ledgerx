import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { RecipientContact } from './recipient-contact.entity'

@Injectable()
export class RecipientContactsEntityService extends BaseEntityService<RecipientContact> {
  constructor(
    @InjectRepository(RecipientContact)
    private recipientContactsRepository: Repository<RecipientContact>
  ) {
    super(recipientContactsRepository)
  }
}
