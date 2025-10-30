import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '../auth/auth.module'
import { ChartOfAccountRulesDomainModule } from '../domain/chart-of-account-rules/chart-of-account-rules.domain.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { ChainsEntityModule } from '../shared/entity-services/chains/chains.entity.module'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'
import { TokensEntityModule } from '../shared/entity-services/tokens/tokens.entity.module'
import { RecipientsController } from './recipients.controller'
import { RecipientsListener } from './listeners/recipients.listener'
import { PaymentsModule } from '../payments/payments.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { RecipientsControllerService } from './recipients.controller.service'
import { RecipientBankAccountsEntityModule } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-accounts.entity.module'

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MembersEntityModule,
    AccountsEntityModule,
    ProvidersEntityModule,
    ContactsEntityModule,
    ChainsEntityModule,
    CryptocurrenciesEntityModule,
    OrganizationsEntityModule,
    TokensEntityModule,
    ChartOfAccountMappingsEntityModule,
    ChartOfAccountRulesDomainModule,
    PaymentsModule,
    RecipientBankAccountsEntityModule,
    LoggerModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [RecipientsController],
  providers: [RecipientsListener, RecipientsControllerService],
  exports: []
})
export class RecipientsModule {}
