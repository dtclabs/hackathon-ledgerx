import { Module } from '@nestjs/common'
import { PricesModule } from '../../prices/prices.module'
import { CryptocurrenciesEntityModule } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { NftCollectionsEntityModule } from '../../shared/entity-services/nft-collections/nft-collections.entity.module'
import { NftSyncsEntityModule } from '../../shared/entity-services/nft-syncs/nft-syncs.entity.module'
import { NftsEntityModule } from '../../shared/entity-services/nfts/nfts.entity.module'
import { OrganizationSettingsEntityModule } from '../../shared/entity-services/organization-settings/organization-settings.entity.module'
import { WalletsEntityModule } from '../../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../../shared/logger/logger.module'
import { HqDataModule } from '../integrations/hq-data/hq-data.module'
import { PollAddressSyncJobListener } from './listeners/poll-address-sync-job.listener'
import { NftsDomainService } from './nfts.domain.service'

@Module({
  imports: [
    HqDataModule,
    NftSyncsEntityModule,
    WalletsEntityModule,
    NftsEntityModule,
    NftCollectionsEntityModule,
    OrganizationSettingsEntityModule,
    CryptocurrenciesEntityModule,
    PricesModule,
    LoggerModule
  ],
  providers: [NftsDomainService, PollAddressSyncJobListener],
  exports: [NftsDomainService]
})
export class NftsDomainModule {}
