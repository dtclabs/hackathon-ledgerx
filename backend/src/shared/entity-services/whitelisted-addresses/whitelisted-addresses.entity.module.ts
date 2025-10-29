import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WhitelistedAddressesEntityService } from './whitelisted-addresses.entity.service'
import { WhitelistedAddress } from './whitelisted-address.entity'

@Module({
  imports: [TypeOrmModule.forFeature([WhitelistedAddress])],
  providers: [WhitelistedAddressesEntityService],
  exports: [TypeOrmModule, WhitelistedAddressesEntityService]
})
export class WhitelistedAddressesEntityModule {}
