import { Module } from '@nestjs/common'
import { NftsDomainModule } from '../domain/nfts/nfts.domain.module'
import { CountriesEntityModule } from '../shared/entity-services/countries/countries.entity.module'
import { FiatCurrenciesEntityModule } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { TimezonesEntityModule } from '../shared/entity-services/timezones/timezones.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { SettingsController } from './settings.controller'
import { SettingsDomainService } from './settings.domain.service'

@Module({
  imports: [
    OrganizationSettingsEntityModule,
    MembersEntityModule,
    LoggerModule,
    CountriesEntityModule,
    FiatCurrenciesEntityModule,
    TimezonesEntityModule,
    WalletsEntityModule,
    NftsDomainModule
  ],
  controllers: [SettingsController],
  providers: [SettingsDomainService],
  exports: [SettingsDomainService]
})
export class SettingsModule {}
