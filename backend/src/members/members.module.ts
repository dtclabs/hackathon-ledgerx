import { Module } from '@nestjs/common'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { RolesEntityModule } from '../shared/entity-services/roles/roles.entity.module'
import { TokensEntityModule } from '../shared/entity-services/tokens/tokens.entity.module'
import { MemberDomainService } from './member.domain.service'
import { MembersController } from './members.controller'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    MembersEntityModule,
    RolesEntityModule,
    CryptocurrenciesEntityModule,
    ContactsEntityModule,
    OrganizationsEntityModule,
    AccountsEntityModule,
    TokensEntityModule,
    FeatureFlagsEntityModule,
    SubscriptionsDomainModule
  ],
  providers: [MemberDomainService],
  controllers: [MembersController],
  exports: []
})
export class MembersModule {}
