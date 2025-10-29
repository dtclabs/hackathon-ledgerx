import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from './account.entity'
import { AccountsEntityService } from './accounts.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountsEntityService],
  exports: [TypeOrmModule, AccountsEntityService]
})
export class AccountsEntityModule {}
