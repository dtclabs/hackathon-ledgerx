import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationTrialsEntityModule } from '../shared/entity-services/organization-trials/organization-trials.entity.module'
import { OrganizationTrialsController } from './organization-trials.controller'

@Module({
  imports: [OrganizationTrialsEntityModule, MembersEntityModule, ConfigModule],
  controllers: [OrganizationTrialsController],
  providers: [],
  exports: []
})
export class OrganizationTrialsModule {}
