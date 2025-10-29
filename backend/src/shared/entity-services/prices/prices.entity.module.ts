import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Price } from './prices.entity'
import { PricesEntityService } from './prices.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  providers: [PricesEntityService],
  controllers: [],
  exports: [TypeOrmModule, PricesEntityService]
})
export class PricesEntityModule {}
