import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { OnboardingEntityService } from '../shared/entity-services/onboarding/onboarding.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'

import { OnboardingStepDto, OnboardingDto } from './interfaces'
import {
  OnboardingStatus,
  OnboardingStepType,
  OnboardingType,
  KYBMetadata
} from '../shared/entity-services/onboarding/interfaces'
import { BlockpassService } from '../domain/integrations/blockpass/blockpass.service'
import { BlockpassErrorInfo, BlockpassResponseStatus } from '../domain/integrations/blockpass/interfaces'
import { OnboardingStep } from '../shared/entity-services/onboarding/onboarding-step.entity'

@Injectable()
export class OnboardingService {
  constructor(
    private onboardingEntityService: OnboardingEntityService,
    private organizationsService: OrganizationsEntityService,
    private blockpassService: BlockpassService
  ) {}

  async registerOwnerAddress(
    organizationId: string,
    blockchainId: string,
    walletAddress: string
  ): Promise<OnboardingStepDto> {
    const organization = await this.organizationsService.get(organizationId)
    if (!organization) {
      throw new NotFoundException('Organization not found')
    }

    let onboarding = await this.onboardingEntityService.getOrCreateOrganizationOnboarding(
      organization,
      OnboardingType.CARD
    )

    if (onboarding.status === OnboardingStatus.PENDING) {
      const ownerAddressOnboardingStep = await this.onboardingEntityService.registerOwnerAddress(
        blockchainId,
        walletAddress,
        onboarding.id
      )

      return OnboardingStepDto.map(ownerAddressOnboardingStep)
    } else if (onboarding.status === OnboardingStatus.COMPLETED) {
      throw new BadRequestException('Cannot register owner address because the onboarding process is already completed')
    } else {
      throw new BadRequestException('Cannot register owner address because the onboarding process is already failed')
    }
  }

  async initiateKYB(organizationId: string): Promise<OnboardingStepDto> {
    const organization = await this.organizationsService.get(organizationId)
    if (!organization) {
      throw new NotFoundException('Organization not found')
    }

    let onboarding = await this.onboardingEntityService.getOrCreateOrganizationOnboarding(
      organization,
      OnboardingType.CARD
    )

    if (onboarding.status === OnboardingStatus.PENDING) {
      let kybStep = await this.onboardingEntityService.getOnboardingStepByType(onboarding.id, OnboardingStepType.KYB)

      // KYB onboarding step must not exist inorder to call this API
      if (kybStep) {
        throw new BadRequestException('Cannot initiate KYB onboarding step because it is already initiated')
      }
      const onboardingKybStep = await this.onboardingEntityService.initiateKYB(organization, onboarding.id)

      return OnboardingStepDto.map(onboardingKybStep)
    } else if (onboarding.status === OnboardingStatus.COMPLETED) {
      throw new BadRequestException('Cannot initiate KYB because the onboarding process is already completed')
    } else {
      throw new BadRequestException('Cannot initiate KYB because the onboarding process is already failed')
    }
  }

  async getAllCardOnboardingSteps(organizationId: string): Promise<OnboardingDto> {
    const organization = await this.organizationsService.get(organizationId)
    if (!organization) {
      throw new NotFoundException('Organization not found')
    }

    let onboarding = await this.onboardingEntityService.getOrCreateOrganizationOnboarding(
      organization,
      OnboardingType.CARD
    )
    const kybStep = onboarding.onboardingSteps?.find((step) => step.type === OnboardingStepType.KYB)
    if (kybStep) {
      await this.handleKybOnboardingStep(kybStep, onboarding.id)
    }

    onboarding = await this.onboardingEntityService.getOnboardingByOrganizationIdAndType(
      organizationId,
      onboarding.type
    )
    return OnboardingDto.map(onboarding)
  }

  async submitBlockPassReferenceId(organizationId: string, referenceId: string): Promise<OnboardingStepDto> {
    const organization = await this.organizationsService.get(organizationId)
    if (!organization) {
      throw new NotFoundException('Organization not found')
    }

    let onboarding = await this.onboardingEntityService.getOrCreateOrganizationOnboarding(
      organization,
      OnboardingType.CARD
    )

    let kybOnboardingStep = onboarding.onboardingSteps.find((step) => step.type === OnboardingStepType.KYB)

    if (!kybOnboardingStep) {
      throw new BadRequestException(`KYB step for ${referenceId} does not exist`)
    }

    let metadata = kybOnboardingStep.metadata as KYBMetadata

    if (metadata.referenceId !== referenceId) {
      throw new BadRequestException(`Invalid referenceId ${referenceId} for organizationId ${organization.publicId}`)
    }
    kybOnboardingStep = await this.handleKybOnboardingStep(kybOnboardingStep, onboarding.id)
    return OnboardingStepDto.map(kybOnboardingStep)
  }

  private async handleKybOnboardingStep(
    kybOnboardingStep: OnboardingStep,
    onboardingId: string
  ): Promise<OnboardingStep> {
    // Must cast this metadata as KYBMetadata otherwise there will be type error
    // since the Owner Onboarding step do not have KYBMetadata
    const metadata = kybOnboardingStep.metadata as KYBMetadata

    //calling BlockPass API regarding to referenceId
    try {
      const blockpassResponse = await this.blockpassService.getBlockpassStatusByRefId(metadata.referenceId)
      if (blockpassResponse && blockpassResponse.status === BlockpassResponseStatus.SUCCESS) {
        //only update in db if status changed (don't save to db everytime blockpass is called)
        if (blockpassResponse.data.status !== metadata.blockpassStatus) {
          if (kybOnboardingStep && metadata) {
            await this.onboardingEntityService.updateKybOnboardingStep(kybOnboardingStep.id, {
              blockpassStatus: blockpassResponse.data.status,
              recordId: blockpassResponse.data.recordId
            })

            kybOnboardingStep = await this.onboardingEntityService.getOnboardingStepByType(
              onboardingId,
              OnboardingStepType.KYB
            )
          }
        }
      }
    } catch (e) {
      if (
        e.response?.data.message === BlockpassErrorInfo.MESSAGE &&
        e.response?.data.code === BlockpassErrorInfo.CODE
      ) {
        return kybOnboardingStep
      } else {
        throw e
      }
    }

    return kybOnboardingStep
  }
}
