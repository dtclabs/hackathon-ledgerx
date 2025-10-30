import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Blockchain } from './blockchain.entity'
import { BlockchainsEntityService } from './blockchains.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Blockchain])],
  controllers: [],
  providers: [BlockchainsEntityService],
  exports: [TypeOrmModule, BlockchainsEntityService]
})
export class BlockchainsEntityModule {}
