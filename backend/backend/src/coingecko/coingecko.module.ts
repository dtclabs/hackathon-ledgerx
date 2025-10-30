import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { CoingeckoController } from './coingecko.controller'
import { CoingeckoDomainService } from './coingecko.domain.service'

@Module({
  imports: [ConfigModule, HttpModule, LoggerModule, BlockchainsEntityModule],
  providers: [CoingeckoDomainService],
  controllers: [CoingeckoController],
  exports: [CoingeckoDomainService]
})
export class CoingeckoModule {}
