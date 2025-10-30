import { Module } from '@nestjs/common'
import { ChartOfAccountRulesDomainModule } from '../domain/chart-of-account-rules/chart-of-account-rules.domain.module'
import { ChartOfAccountMappingsEntityModule } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { ChartOfAccountMappingsController } from './chart-of-account-mappings.controller'
import { ChartOfAccountMappingsDomainService } from './chart-of-account-mappings.domain.service'
import { AccountingModule } from '../domain/integrations/accounting/accounting.module'

@Module({
  imports: [
    ChartOfAccountMappingsEntityModule,
    ChartOfAccountsEntityModule,
    WalletsEntityModule,
    CryptocurrenciesEntityModule,
    LoggerModule,
    MembersEntityModule,
    ContactsEntityModule,
    ChartOfAccountRulesDomainModule,
    AccountingModule
  ],
  controllers: [ChartOfAccountMappingsController],
  providers: [ChartOfAccountMappingsDomainService],
  exports: [ChartOfAccountMappingsDomainService]
})
export class ChartOfAccountMappingsModule {}
