import { Module } from '@nestjs/common'
import { TimezonesController } from './timezones.controller'
import { TimezonesEntityModule } from '../shared/entity-services/timezones/timezones.entity.module'

@Module({
  imports: [TimezonesEntityModule],
  controllers: [TimezonesController],
  providers: [],
  exports: []
})
export class TimezonesModule {}
