import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { Category } from './category.entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    OrganizationsEntityModule,
    AccountsEntityModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [TypeOrmModule, CategoriesService]
})
export class CategoriesModule {}
