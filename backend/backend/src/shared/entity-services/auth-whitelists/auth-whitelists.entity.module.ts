import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthWhitelist } from './auth-whitelist.entity'
import { AuthWhitelistsEntityService } from './auth-whitelists.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([AuthWhitelist])],
  controllers: [],
  providers: [AuthWhitelistsEntityService],
  exports: [AuthWhitelistsEntityService]
})
export class AuthWhitelistsEntityModule {}
