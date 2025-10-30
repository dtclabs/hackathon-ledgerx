import { Module } from '@nestjs/common'
import { OrganizationIntegrationsInternalController } from './organization-integrations-internal.controller'
import { OrganizationIntegrationsDomainModule } from '../../domain/organization-integrations/organization-integrations.domain.module'

@Module({
  imports: [OrganizationIntegrationsDomainModule],
  controllers: [OrganizationIntegrationsInternalController],
  providers: []
})
export class OrganizationIntegrationsInternalModule {}
