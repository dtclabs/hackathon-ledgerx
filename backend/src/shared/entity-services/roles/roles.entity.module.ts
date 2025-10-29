import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './role.entity'
import { RolesEntityService } from './roles.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesEntityService],
  exports: [TypeOrmModule, RolesEntityService]
})
export class RolesEntityModule {}
