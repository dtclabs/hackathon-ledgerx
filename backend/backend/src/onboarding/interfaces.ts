import { ApiProperty } from '@nestjs/swagger'
import { Onboarding } from '../shared/entity-services/onboarding/onboarding.entity'

import {
  KYBMetadata,
  OnboardingStatus,
  OnboardingStepStatus,
  OnboardingStepType,
  OnboardingType,
  OwnerAddressMetadata
} from '../shared/entity-services/onboarding/interfaces'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { OnboardingStep } from '../shared/entity-services/onboarding/onboarding-step.entity'

export class SubmitReferenceIdDto {
  @ApiProperty()
  @IsNotEmpty()
  referenceId: string
}

export class RegisterOwnerAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  blockchainId: string

  @ApiProperty()
  @IsNotEmpty()
  walletAddress: string
}

export class OnboardingStepDto {
  @IsEnum(OnboardingStepType)
  @ApiProperty({ enum: OnboardingStepType, example: OnboardingStepType.OWNER_ADDRESS })
  type: OnboardingStepType

  @IsEnum(OnboardingStepStatus)
  @ApiProperty({ enum: OnboardingStepStatus, example: OnboardingStepStatus.COMPLETED })
  status: OnboardingStepStatus

  @ApiProperty()
  metadata: OwnerAddressMetadata | KYBMetadata

  static map(onboardingStep: OnboardingStep): OnboardingStepDto {
    const result: OnboardingStepDto = {
      status: onboardingStep.status,
      type: onboardingStep.type,
      metadata: onboardingStep.metadata
    }
    return result
  }
}

export class OnboardingDto {
  @IsEnum(OnboardingStatus)
  @ApiProperty({ enum: OnboardingStatus, example: OnboardingStatus.PENDING })
  status: OnboardingStatus

  @IsEnum(OnboardingType)
  @ApiProperty({ enum: OnboardingType, example: OnboardingType.CARD })
  type: OnboardingType

  @ApiProperty({ type: OnboardingStepDto, isArray: true })
  onboardingSteps: OnboardingStepDto[]

  static map(onboarding: Onboarding): OnboardingDto {
    const result: OnboardingDto = {
      status: onboarding.status,
      type: onboarding.type,
      onboardingSteps: onboarding.onboardingSteps?.map((step) => OnboardingStepDto.map(step)) ?? []
    }
    return result
  }
}
