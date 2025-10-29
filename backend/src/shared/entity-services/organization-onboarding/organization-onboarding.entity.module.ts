import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationOnboarding } from './organization-onboarding.entity'
import { OrganizationOnboardingEntityService } from './organization-onboarding.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationOnboarding])],
  providers: [OrganizationOnboardingEntityService],
  exports: [TypeOrmModule, OrganizationOnboardingEntityService]
})
export class OrganizationOnboardingEntityModule {}
