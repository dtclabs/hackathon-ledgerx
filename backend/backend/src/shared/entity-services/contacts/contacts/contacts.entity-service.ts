import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { ContactProvider } from './contact.entity'

@Injectable()
export class ContactProvidersService extends BaseEntityService<ContactProvider> {
  constructor(
    @InjectRepository(ContactProvider)
    private contactProvidersRepository: Repository<ContactProvider>
  ) {
    super(contactProvidersRepository)
  }
}
