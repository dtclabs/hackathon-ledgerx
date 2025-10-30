import { Module } from '@nestjs/common'
import { BlockExplorerModule } from '../domain/block-explorers/block-explorer.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { CryptocurrenciesController } from './cryptocurrencies.controller'
import { CryptocurrenciesDomainService } from './cryptocurrencies.domain.service'

@Module({
  imports: [
    CryptocurrenciesEntityModule,
    BlockExplorerModule,
    WalletsEntityModule,
    MembersEntityModule,
    BlockchainsEntityModule
  ],
  controllers: [CryptocurrenciesController],
  providers: [CryptocurrenciesDomainService],
  exports: [CryptocurrenciesDomainService]
})
export class CryptocurrenciesModule {}
