import { Module } from '@nestjs/common'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { IntegrationWhitelistRequestEntityModule } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-request.entity.module'
import { IntegrationWhitelistRequestEntityService } from '../shared/entity-services/integration-whitelist-requests/integration-whitelist-requests.entity-service'
import { IntegrationEntityService } from '../shared/entity-services/integration/integration.entity-service'
import { IntegrationEntityModule } from '../shared/entity-services/integration/integration.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { IntegrationWhitelistRequestsController } from './integration-whitelist-requests.controller'
import { WhitelistRequestsService } from './integration-whitelist-requests.service'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    IntegrationWhitelistRequestEntityModule,
    OrganizationIntegrationsEntityModule,
    AccountsEntityModule,
    MembersEntityModule,
    OrganizationsEntityModule,
    IntegrationEntityModule,
    SubscriptionsDomainModule,
    FeatureFlagsEntityModule
  ],
  controllers: [IntegrationWhitelistRequestsController],
  providers: [
    WhitelistRequestsService,
    IntegrationWhitelistRequestEntityService,
    OrganizationIntegrationsEntityService,
    AccountsEntityService,
    OrganizationsEntityService,
    IntegrationEntityService
  ]
})
export class IntegrationWhitelistRequestsModule {}
