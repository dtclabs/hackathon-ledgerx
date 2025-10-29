import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organization } from './organization.entity'
import { OrganizationsEntityService } from './organizations.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  providers: [OrganizationsEntityService],
  exports: [TypeOrmModule, OrganizationsEntityService]
})
export class OrganizationsEntityModule {}
