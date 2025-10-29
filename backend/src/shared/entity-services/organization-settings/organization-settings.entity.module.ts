import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationSettingsEntityService } from './organization-settings.entity-service'
import { OrganizationSetting } from './organization-setting.entity'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSetting])],
  controllers: [],
  providers: [OrganizationSettingsEntityService],
  exports: [TypeOrmModule, OrganizationSettingsEntityService]
})
export class OrganizationSettingsEntityModule {}
