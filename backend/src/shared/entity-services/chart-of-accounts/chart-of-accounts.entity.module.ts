import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChartOfAccount } from './chart-of-account.entity'
import { ChartOfAccountsEntityService } from './chart-of-accounts.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([ChartOfAccount])],
  providers: [ChartOfAccountsEntityService],
  exports: [TypeOrmModule, ChartOfAccountsEntityService]
})
export class ChartOfAccountsEntityModule {}
