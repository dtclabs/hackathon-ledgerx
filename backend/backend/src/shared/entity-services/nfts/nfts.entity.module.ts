import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from '../../logger/logger.module'
import { Nft } from './nft.entity'
import { NftsEntityService } from './nfts.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Nft]), LoggerModule],
  controllers: [],
  providers: [NftsEntityService],
  exports: [TypeOrmModule, NftsEntityService]
})
export class NftsEntityModule {}
