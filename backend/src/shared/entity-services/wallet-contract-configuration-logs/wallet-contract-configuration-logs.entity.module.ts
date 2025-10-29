import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletContractConfigurationLog } from './wallet-contract-configuration-log.entity'
import { WalletContractConfigurationLogsEntityService } from './wallet-contract-configuration-logs.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([WalletContractConfigurationLog])],
  providers: [WalletContractConfigurationLogsEntityService],
  exports: [TypeOrmModule, WalletContractConfigurationLogsEntityService]
})
export class WalletContractConfigurationLogsEntityModule {}
