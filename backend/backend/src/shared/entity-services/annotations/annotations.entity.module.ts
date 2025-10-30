import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Annotation } from './annotation.entity'
import { AnnotationsEntityService } from './annotations.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Annotation])],
  controllers: [],
  providers: [AnnotationsEntityService],
  exports: [TypeOrmModule, AnnotationsEntityService]
})
export class AnnotationsEntityModule {}
