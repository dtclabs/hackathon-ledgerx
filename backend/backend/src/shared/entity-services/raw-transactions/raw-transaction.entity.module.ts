import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RawTransaction } from './raw-transaction.entity'
import { RawTransactionEntityService } from './raw-transaction.entity-service'
import { LoggerModule } from '../../logger/logger.module'

@Module({
  imports: [TypeOrmModule.forFeature([RawTransaction]), LoggerModule],
  controllers: [],
  providers: [RawTransactionEntityService],
  exports: [TypeOrmModule, RawTransactionEntityService]
})
export class RawTransactionEntityModule {}
