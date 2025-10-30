import { Module } from '@nestjs/common'
import { RootfiService } from './rootfi.service'
import { LoggerModule } from '../../../../shared/logger/logger.module'
import { ConfigModule } from '@nestjs/config'
import { OrganizationIntegrationsEntityModule } from '../../../../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { OrganizationSettingsEntityModule } from '../../../../shared/entity-services/organization-settings/organization-settings.entity.module'

@Module({
  imports: [LoggerModule, ConfigModule, OrganizationIntegrationsEntityModule, OrganizationSettingsEntityModule],
  providers: [RootfiService],
  exports: [RootfiService]
})
export class RootfiModule {}
