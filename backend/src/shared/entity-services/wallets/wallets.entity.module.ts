import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletSync } from './wallet-sync.entity'
import { Wallet } from './wallet.entity'
import { WalletsEntityService } from './wallets.entity-service'
import { LoggerModule } from '../../logger/logger.module'
import { BlockchainsEntityModule } from '../blockchains/blockchains.entity.module'

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletSync]), LoggerModule, BlockchainsEntityModule],
  controllers: [],
  providers: [WalletsEntityService],
  exports: [TypeOrmModule, WalletsEntityService]
})
export class WalletsEntityModule {}
