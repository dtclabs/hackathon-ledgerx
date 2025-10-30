import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IntegrationRetryRequestEntityModule } from '../../../shared/entity-services/integration-retry-request/integration-retry-request.entity.module'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { AccountingService } from './accounting.service'
import { MergeModule } from './merge/merge.module'
import { RootfiModule } from './rootfi/rootfi.module'
import { FeatureFlagsEntityModule } from '../../../shared/entity-services/feature-flags/feature-flags.entity.module'
import { OrganizationIntegrationsEntityModule } from '../../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { TimezonesEntityModule } from '../../../shared/entity-services/timezones/timezones.entity.module'

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    IntegrationRetryRequestEntityModule,
    MergeModule,
    RootfiModule,
    FeatureFlagsEntityModule,
    OrganizationIntegrationsEntityModule,
    TimezonesEntityModule
  ],
  providers: [AccountingService],
  exports: [AccountingService]
})
export class AccountingModule {}
