import { Module } from '@nestjs/common'
import { NftsDomainModule } from '../domain/nfts/nfts.domain.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { NftCollectionsEntityModule } from '../shared/entity-services/nft-collections/nft-collections.entity.module'
import { NftsEntityModule } from '../shared/entity-services/nfts/nfts.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { NftsController } from './nfts.controller'
import { NftsControllerService } from './nfts.controller.service'

@Module({
  imports: [
    NftsDomainModule,
    NftsEntityModule,
    NftCollectionsEntityModule,
    WalletsEntityModule,
    BlockchainsEntityModule,
    ContactsEntityModule,
    OrganizationSettingsEntityModule,
    CryptocurrenciesEntityModule,
    OrganizationsEntityModule,
    LoggerModule
  ],
  controllers: [NftsController],
  providers: [NftsControllerService],
  exports: [NftsControllerService]
})
export class NftsModule {}
