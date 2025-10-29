import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FindOptionsRelations } from 'typeorm'
import {
  ChangeFiatCurrencyForOrganizationEventParams,
  FinancialTransformationsEventType
} from '../domain/financial-transformations/events/events'
import { NftsDomainService } from '../domain/nfts/nfts.domain.service'
import { CountriesEntityService } from '../shared/entity-services/countries/countries.entity-service'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import { OrganizationSetting } from '../shared/entity-services/organization-settings/organization-setting.entity'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { TimezonesEntityService } from '../shared/entity-services/timezones/timezones.entity-service'
import { WalletStatusesEnum } from '../shared/entity-services/wallets/interfaces'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import { SettingsDto, UpdateSettingDto } from './interfaces'

@Injectable()
export class SettingsDomainService {
  allRelations: FindOptionsRelations<OrganizationSetting> = { country: true, fiatCurrency: true, timezone: true }

  constructor(
    private logger: LoggerService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private countriesService: CountriesEntityService,
    private timezonesService: TimezonesEntityService,
    private fiatCurrenciesService: FiatCurrenciesEntityService,
    private walletsService: WalletsEntityService,
    private nftsDomainService: NftsDomainService,
    private eventEmitter: EventEmitter2
  ) {}

  async getByOrganizationId(organizationId: string) {
    const organizationSetting = await this.organizationSettingsService.getByOrganizationId(
      organizationId,
      this.allRelations
    )
    if (organizationSetting) {
      return SettingsDto.map(organizationSetting)
    }
    throw new NotFoundException('Settings not found')
  }

  async update(organizationId: string, updateSettingDto: UpdateSettingDto) {
    const organizationSetting = await this.organizationSettingsService.getByOrganizationId(organizationId, {
      fiatCurrency: true
    })
    if (!organizationSetting) {
      throw new NotFoundException('Settings not found')
    }

    let newSetting: Partial<OrganizationSetting> = {}
    // if (updateSettingDto.costBasisMethod && updateSettingDto.costBasisMethod !== organizationSetting.costBasisMethod) {
    //   // TODO: fire event for additional transformation
    //   newSetting = {
    //     ...newSetting,
    //     costBasisMethod: updateSettingDto.costBasisMethod
    //   }
    // }
    if (updateSettingDto.countryId) {
      const country = await this.countriesService.findByPublicId(updateSettingDto.countryId)
      if (!country) {
        throw new BadRequestException('Can not find country')
      }
      newSetting = {
        ...newSetting,
        country: country
      }
    }

    if (updateSettingDto.timezoneId) {
      const timezone = await this.timezonesService.findByPublicId(updateSettingDto.timezoneId)
      if (!timezone) {
        throw new BadRequestException('Can not find timezone')
      }
      newSetting = {
        ...newSetting,
        timezone: timezone
      }
    }

    if (updateSettingDto.fiatCurrency) {
      const fiatCurrency = await this.fiatCurrenciesService.getByAlphabeticCode(updateSettingDto.fiatCurrency)
      if (!fiatCurrency) {
        throw new BadRequestException('Can not find fiat currency')
      }

      try {
        try {
          await this.walletsService.updateWalletsSyncStatusForOrganization(organizationId, WalletStatusesEnum.SYNCING)
        } catch (e) {
          throw new BadRequestException('Wallets are not in the right state for organization setting update')
        }

        this.eventEmitter.emit(
          FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION,
          ChangeFiatCurrencyForOrganizationEventParams.map({
            organizationId,
            fiatCurrencyAlphabeticCode: fiatCurrency.alphabeticCode
          })
        )

        if (fiatCurrency.id !== organizationSetting.fiatCurrency.id) {
          newSetting = {
            ...newSetting,
            fiatCurrency: fiatCurrency
          }
        }
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw e
        } else {
          this.logger.error('Error while syncing wallets', e, {
            organizationId,
            fiatCurrencyAlphabeticCode: fiatCurrency.alphabeticCode
          })
          await this.walletsService.updateWalletsSyncStatusForOrganization(organizationId, WalletStatusesEnum.SYNCED)
        }
      }
    }

    await this.organizationSettingsService.partiallyUpdate(organizationSetting.id, newSetting)
    await this.nftsDomainService.refreshGainLossCalculation(organizationId)

    const updatedSetting = await this.organizationSettingsService.get(organizationSetting.id, {
      relations: this.allRelations
    })

    return SettingsDto.map(updatedSetting)
  }
}
