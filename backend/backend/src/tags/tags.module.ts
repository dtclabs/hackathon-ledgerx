import { Module } from '@nestjs/common'
import { AnnotationsEntityModule } from '../shared/entity-services/annotations/annotations.entity.module'
import { ResourceAnnotationsEntityModule } from '../shared/entity-services/annotations/resource-annotations/resource-annotations.entity.module'
import { TagsController } from './tags.controller'

@Module({
  imports: [AnnotationsEntityModule, ResourceAnnotationsEntityModule],
  controllers: [TagsController],
  providers: [],
  exports: []
})
export class TagsModule {}
