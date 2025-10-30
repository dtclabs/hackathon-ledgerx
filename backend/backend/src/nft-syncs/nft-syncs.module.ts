import { Module } from '@nestjs/common'
import { NftsDomainModule } from '../domain/nfts/nfts.domain.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { NftSyncsController } from './nft-syncs.controller'

@Module({
  imports: [NftsDomainModule, LoggerModule],
  controllers: [NftSyncsController],
  providers: [],
  exports: []
})
export class NftSyncsModule {}
