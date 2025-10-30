import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletGroup } from './wallet-group.entity'
import { WalletGroupsEntityService } from './wallet-groups.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([WalletGroup])],
  controllers: [],
  providers: [WalletGroupsEntityService],
  exports: [TypeOrmModule, WalletGroupsEntityService]
})
export class WalletGroupEntityModule {}
