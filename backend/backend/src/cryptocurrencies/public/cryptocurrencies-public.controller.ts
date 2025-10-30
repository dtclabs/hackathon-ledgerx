import { Controller, Get, Param, Query } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { RootfiMigrationEventType } from '../../domain/organization-integrations/listeners/rootfi-migration'
import { CryptocurrenciesEntityService } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { CryptocurrencyResponseDto } from '../interfaces'
import { PublicCryptocurrenciesQueryParams } from './interfaces'

@ApiTags('cryptocurrencies')
@Controller('cryptocurrencies')
export class CryptocurrenciesPublicController {
  constructor(
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private logger: LoggerService,
    private eventEmitter: EventEmitter2
  ) {}

  @Get()
  @ApiResponse({ status: 200, type: CryptocurrencyResponseDto, isArray: true })
  async getAll(@Query() query: PublicCryptocurrenciesQueryParams) {
    const cryptocurrencies = await this.cryptocurrenciesService.find({
      relations: ['addresses'],
      where: {
        isVerified: query.isVerified ?? undefined
      }
    })
    // Disabled automatic image refresh to avoid CoinGecko API calls
    // for (let i = 0; i < cryptocurrencies.length; i++) {
    //   const curr = cryptocurrencies[i]
    //   if (!curr.image || !curr.image.large || !curr.image.small || !curr.image.thumb) {
    //     // Intentionally no await to make this non-blocking
    //     this.cryptocurrenciesService.refreshImageForCryptocurrency(curr.id)
    //   }

    //   cryptocurrencies[i] = await this.cryptocurrenciesService.getById(curr.id)
    // }
    return cryptocurrencies.map((cryptocurrency) => CryptocurrencyResponseDto.map(cryptocurrency))
  }

  @Get('retry-coa/:tempId')
  @ApiResponse({ status: 200 })
  async triggerCOA(@Param('tempId') tempId: string) {
    this.eventEmitter.emit(RootfiMigrationEventType.COA, tempId, 'xero')
    return tempId
  }
}
