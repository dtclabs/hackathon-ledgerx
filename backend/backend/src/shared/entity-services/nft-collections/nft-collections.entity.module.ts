import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NftCollection } from './nft-collection.entity'
import { NftCollectionsEntityService } from './nft-collections.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([NftCollection])],
  controllers: [],
  providers: [NftCollectionsEntityService],
  exports: [TypeOrmModule, NftCollectionsEntityService]
})
export class NftCollectionsEntityModule {}
