import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerModule } from '../../logger/logger.module'
import { NftAddressSync } from './nft-address-sync.entity'
import { NftOrganizationSync } from './nft-organization-sync.entity'
import { NftSyncsEntityService } from './nft-syncs.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([NftAddressSync, NftOrganizationSync]), LoggerModule],
  controllers: [],
  providers: [NftSyncsEntityService],
  exports: [TypeOrmModule, NftSyncsEntityService]
})
export class NftSyncsEntityModule {}
