import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CountriesEntityService } from './countries.entity-service'
import { Country } from './country.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [],
  providers: [CountriesEntityService],
  exports: [TypeOrmModule, CountriesEntityService]
})
export class CountriesEntityModule {}
