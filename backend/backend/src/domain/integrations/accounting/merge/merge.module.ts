import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IntegrationRetryRequestEntityModule } from '../../../../shared/entity-services/integration-retry-request/integration-retry-request.entity.module'
import { OrganizationIntegrationsEntityModule } from '../../../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { LoggerModule } from '../../../../shared/logger/logger.module'
import { MergeService } from './merge.service'

@Module({
  imports: [LoggerModule, ConfigModule, IntegrationRetryRequestEntityModule, OrganizationIntegrationsEntityModule],
  providers: [MergeService],
  exports: [MergeService]
})
export class MergeModule {}
