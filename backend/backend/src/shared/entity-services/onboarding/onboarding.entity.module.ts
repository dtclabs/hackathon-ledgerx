import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Onboarding } from './onboarding.entity'
import { OnboardingEntityService } from './onboarding.entity-service'
import { OnboardingStep } from './onboarding-step.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Onboarding]), TypeOrmModule.forFeature([OnboardingStep])],
  controllers: [],
  providers: [OnboardingEntityService],
  exports: [OnboardingEntityService]
})
export class OnboardingEntityModule {}
