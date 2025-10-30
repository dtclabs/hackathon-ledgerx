import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CryptoWrappedMapping } from './crypto-wrapped-mapping.entity'
import { CryptoWrappedMappingsEntityService } from './crypto-wrapped-mappings.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([CryptoWrappedMapping])],
  providers: [CryptoWrappedMappingsEntityService],
  exports: [TypeOrmModule, CryptoWrappedMappingsEntityService]
})
export class CryptoWrappedMappingsEntityModule {}
