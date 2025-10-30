import { Module } from '@nestjs/common'
import { TripleAModule } from '../domain/integrations/triple-a/triple-a.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { RecipientBankAccountsController } from './recipient-bank-accounts.controller'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { RecipientBankAccountsControllerService } from './recipient-bank-accounts.controller.service'
import { RecipientBankAccountsEntityModule } from '../shared/entity-services/recipient-bank-accounts/recipient-bank-accounts.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { FiatCurrenciesEntityModule } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity.module'
import { RecipientBankAccountsListener } from './listeners/recipient-bank-accounts.listener'
import { PaymentsModule } from '../payments/payments.module'

@Module({
  imports: [
    RecipientBankAccountsEntityModule,
    ContactsEntityModule,
    FiatCurrenciesEntityModule,
    TripleAModule,
    MembersEntityModule,
    PaymentsModule,
    LoggerModule
  ],
  controllers: [RecipientBankAccountsController],
  providers: [RecipientBankAccountsControllerService, RecipientBankAccountsListener],
  exports: [RecipientBankAccountsControllerService]
})
export class RecipientBankAccountsModule {}
