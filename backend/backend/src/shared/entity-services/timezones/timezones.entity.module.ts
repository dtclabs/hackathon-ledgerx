import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TimezonesEntityService } from './timezones.entity-service'
import { Timezone } from './timezone.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Timezone])],
  controllers: [],
  providers: [TimezonesEntityService],
  exports: [TypeOrmModule, TimezonesEntityService]
})
export class TimezonesEntityModule {}
