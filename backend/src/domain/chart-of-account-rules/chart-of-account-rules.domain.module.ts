import { Module } from '@nestjs/common'
import { ChartOfAccountMappingsEntityModule } from '../../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity.module'
import { ContactsEntityModule } from '../../shared/entity-services/contacts/contacts.entity.module'
import { FinancialTransactionsEntityModule } from '../../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { LoggerModule } from '../../shared/logger/logger.module'
import { ChartOfAccountRulesDomainService } from './chart-of-account-rules.domain.service'
import { ChartOfAccountRulesListener } from './listeners/chart-of-account-rules-listener'

@Module({
  imports: [FinancialTransactionsEntityModule, ChartOfAccountMappingsEntityModule, ContactsEntityModule, LoggerModule],
  providers: [ChartOfAccountRulesDomainService, ChartOfAccountRulesListener],
  exports: [ChartOfAccountRulesDomainService]
})
export class ChartOfAccountRulesDomainModule {}
