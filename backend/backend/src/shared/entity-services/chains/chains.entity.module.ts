import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Chain } from './chain.entity'
import { ChainsEntityService } from './chains.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Chain])],
  controllers: [],
  providers: [ChainsEntityService],
  exports: [TypeOrmModule, ChainsEntityService]
})
export class ChainsEntityModule {}
