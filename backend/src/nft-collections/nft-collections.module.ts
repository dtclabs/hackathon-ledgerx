import { Module } from '@nestjs/common'
import { NftsModule } from '../nfts/nfts.module'
import { PricesModule } from '../prices/prices.module'
import { ContactsEntityModule } from '../shared/entity-services/contacts/contacts.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { NftCollectionsEntityModule } from '../shared/entity-services/nft-collections/nft-collections.entity.module'
import { NftsEntityModule } from '../shared/entity-services/nfts/nfts.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { NftCollectionsController } from './nft-collections.controller'
import { NftCollectionsControllerService } from './nft-collections.controller.service'

@Module({
  imports: [
    NftCollectionsEntityModule,
    NftsEntityModule,
    OrganizationSettingsEntityModule,
    OrganizationsEntityModule,
    CryptocurrenciesEntityModule,
    PricesModule,
    ContactsEntityModule,
    NftsModule,
    LoggerModule
  ],
  controllers: [NftCollectionsController],
  providers: [NftCollectionsControllerService],
  exports: [NftCollectionsControllerService]
})
export class NftCollectionsModule {}
