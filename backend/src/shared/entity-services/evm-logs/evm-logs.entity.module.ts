import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EvmLog } from './evm-log.entity'
import { EvmLogsEntityService } from './evm-logs.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([EvmLog])],
  providers: [EvmLogsEntityService],
  exports: [TypeOrmModule, EvmLogsEntityService]
})
export class EvmLogsEntityModule {}
