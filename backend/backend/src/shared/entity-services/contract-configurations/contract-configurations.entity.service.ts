import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { ContractConfiguration } from './contract-configuration.entity'

@Injectable()
export class ContractConfigurationsEntityService extends BaseEntityService<ContractConfiguration> {
  constructor(
    @InjectRepository(ContractConfiguration)
    private contractConfigurationRepository: Repository<ContractConfiguration>
  ) {
    super(contractConfigurationRepository)
  }

  async getByBlockchain(blockchainId: string) {
    return this.find({ where: { blockchainId } })
  }
}
