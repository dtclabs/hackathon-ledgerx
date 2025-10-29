import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { InvitationsEntityModule } from '../shared/entity-services/invitations/invitations.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'
import { RolesEntityModule } from '../shared/entity-services/roles/roles.entity.module'
import { InvitationsController } from './invitations.controller'
import { LoggerModule } from '../shared/logger/logger.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    LoggerModule,
    AccountsEntityModule,
    ProvidersEntityModule,
    InvitationsEntityModule,
    RolesEntityModule,
    OrganizationsEntityModule,
    MembersEntityModule,
    ConfigModule,
    HttpModule,
    FeatureFlagsEntityModule,
    SubscriptionsDomainModule
  ],
  controllers: [InvitationsController],
  providers: [],
  exports: []
})
export class InvitationsModule {}
