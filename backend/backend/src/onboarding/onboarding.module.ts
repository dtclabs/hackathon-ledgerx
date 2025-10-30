import { Module } from '@nestjs/common'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.controller.service'
import { OnboardingEntityModule } from '../shared/entity-services/onboarding/onboarding.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { BlockpassModule } from '../domain/integrations/blockpass/blockpass.module'
import { LoggerModule } from '../shared/logger/logger.module'

@Module({
  imports: [OnboardingEntityModule, OrganizationsEntityModule, BlockpassModule, LoggerModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: []
})
export class OnboardingModule {}
