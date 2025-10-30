import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { CategoriesModule } from '../categories/categories.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CountriesEntityModule } from '../shared/entity-services/countries/countries.entity.module'
import { FiatCurrenciesEntityModule } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationOnboardingEntityModule } from '../shared/entity-services/organization-onboarding/organization-onboarding.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationTrialsEntityModule } from '../shared/entity-services/organization-trials/organization-trials.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'
import { RolesEntityModule } from '../shared/entity-services/roles/roles.entity.module'
import { TimezonesEntityModule } from '../shared/entity-services/timezones/timezones.entity.module'
import { WalletGroupEntityModule } from '../shared/entity-services/wallet-groups/wallet-group.entity.module'
import { OrganizationsController } from './organizations.controller'
import { SubscriptionsEntityModule } from '../shared/entity-services/subscriptions/subscriptions.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    RolesEntityModule,
    OrganizationsEntityModule,
    ContactsEntityModule,
    MembersEntityModule,
    AccountsEntityModule,
    ProvidersEntityModule,
    WalletGroupEntityModule,
    OrganizationSettingsEntityModule,
    TimezonesEntityModule,
    CountriesEntityModule,
    FiatCurrenciesEntityModule,
    OrganizationOnboardingEntityModule,
    ChartOfAccountMappingsEntityModule,
    ChartOfAccountsEntityModule,
    OrganizationTrialsEntityModule,
    SubscriptionsEntityModule,
    SubscriptionsDomainModule,
    FeatureFlagsEntityModule,
    forwardRef(() => AuthModule),
    forwardRef(() => CategoriesModule)
  ],
  providers: [],
  controllers: [OrganizationsController],
  exports: []
})
export class OrganizationsModule {}
