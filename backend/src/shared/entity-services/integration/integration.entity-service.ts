import { Injectable } from '@nestjs/common'
import { Integration, IntegrationName, IntegrationStatus } from './integration.entity'
import { BaseEntityService } from '../base.entity-service'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class IntegrationEntityService extends BaseEntityService<Integration> {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>
  ) {
    super(integrationRepository)
  }

  async findOneByStatus(name: IntegrationName, status: IntegrationStatus): Promise<Integration> {
    return await this.integrationRepository.findOne({ where: { name: name, status: status } })
  }
}
