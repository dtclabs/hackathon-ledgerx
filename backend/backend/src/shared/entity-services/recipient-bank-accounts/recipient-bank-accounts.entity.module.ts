import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RecipientBankAccount } from './recipient-bank-account.entity'
import { RecipientBankAccountsEntityService } from './recipient-bank-accounts.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([RecipientBankAccount])],
  controllers: [],
  providers: [RecipientBankAccountsEntityService],
  exports: [RecipientBankAccountsEntityService]
})
export class RecipientBankAccountsEntityModule {}
