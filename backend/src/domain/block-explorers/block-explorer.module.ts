import { Module } from '@nestjs/common'
import { BlockExplorerAdapterFactory } from './block-explorer.adapter.factory'
import { ConfigModule } from '@nestjs/config'
import { GnosisProviderService } from './gnosis/gnosis-provider.service'
import { HttpModule } from '@nestjs/axios'
import { LoggerModule } from '../../shared/logger/logger.module'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, LoggerModule],
  controllers: [],
  providers: [GnosisProviderService, BlockExplorerAdapterFactory],
  exports: [GnosisProviderService, BlockExplorerAdapterFactory]
})
export class BlockExplorerModule {}
