import { Module } from '@nestjs/common'
import { AnnotationsEntityModule } from '../shared/entity-services/annotations/annotations.entity.module'
import { AnnotationsController } from './annotations.controller'

@Module({
  imports: [AnnotationsEntityModule],
  controllers: [AnnotationsController],
  providers: [],
  exports: []
})
export class AnnotationsModule {}
