import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { OrganizationSetting } from './organization-setting.entity'

@Injectable()
export class OrganizationSettingsEntityService extends BaseEntityService<OrganizationSetting> {
  constructor(
    @InjectRepository(OrganizationSetting)
    private organizationSettingRepository: Repository<OrganizationSetting>
  ) {
    super(organizationSettingRepository)
  }

  getByOrganizationId(organizationId: string, relations: FindOptionsRelations<OrganizationSetting> = {}) {
    return this.organizationSettingRepository.findOne({
      where: {
        organization: {
          id: organizationId
        }
      },
      relations
    })
  }
}
