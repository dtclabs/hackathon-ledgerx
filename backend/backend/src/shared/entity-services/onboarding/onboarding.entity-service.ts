import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import {
  KYBMetadata,
  OnboardingStatus,
  OnboardingStepStatus,
  OnboardingStepType,
  OnboardingType,
  OwnerAddressMetadata
} from './interfaces'
import { Onboarding } from './onboarding.entity'
import { OnboardingStep } from './onboarding-step.entity'
import { Organization } from '../organizations/organization.entity'
import { BlockpassStatus } from '../../../domain/integrations/blockpass/interfaces'

@Injectable()
export class OnboardingEntityService extends BaseEntityService<Onboarding> {
  constructor(
    @InjectRepository(Onboarding)
    private onboardingRepository: Repository<Onboarding>,
    @InjectRepository(OnboardingStep)
    private onboardingStepsRepository: Repository<OnboardingStep>
  ) {
    super(onboardingRepository)
  }

  async createKybOnboardingStep(onboardingId: string, metadata: KYBMetadata) {
    const onboardingStepRow = this.onboardingStepsRepository.create({
      onboarding: { id: onboardingId },
      type: OnboardingStepType.KYB,
      status: OnboardingStepStatus.CREATED,
      metadata: metadata
    })
    const step = await this.onboardingStepsRepository.save(onboardingStepRow)
    await this.refreshOnboardingStatus(onboardingId)
    return step
  }

  async updateKybOnboardingStep(kybStepId: string, updates: { blockpassStatus: BlockpassStatus; recordId: string }) {
    //update blockpass status
    const blockpassStatus = updates.blockpassStatus
    let status: OnboardingStepStatus
    switch (blockpassStatus) {
      case BlockpassStatus.APPROVED:
        status = OnboardingStepStatus.COMPLETED
        break
      case BlockpassStatus.REJECTED:
        status = OnboardingStepStatus.REJECTED
        break
      case BlockpassStatus.BLOCKED:
        status = OnboardingStepStatus.BLOCKED
        break
      default:
        status = OnboardingStepStatus.PENDING
    }
    let kybOnboardingStep = await this.onboardingStepsRepository.findOne({
      where: {
        id: kybStepId
      },
      relations: {
        onboarding: true
      }
    })

    const object: DeepPartial<OnboardingStep> = {
      status: status,
      metadata: {
        ...kybOnboardingStep.metadata,
        blockpassStatus: updates.blockpassStatus,
        recordId: updates.recordId
      }
    }

    await this.onboardingStepsRepository.update(kybStepId, object)
    await this.refreshOnboardingStatus(kybOnboardingStep.onboarding.id)
  }

  async upsertOwnerAddressOnboardingStep(
    onboardingId: string,
    metadata: OwnerAddressMetadata
  ): Promise<OnboardingStep> {
    await this.onboardingStepsRepository.upsert(
      {
        onboarding: { id: onboardingId },
        type: OnboardingStepType.OWNER_ADDRESS,
        status: OnboardingStepStatus.COMPLETED,
        metadata: metadata
      },
      {
        conflictPaths: ['onboarding', 'type']
      }
    )

    const step = await this.getOnboardingStepByType(onboardingId, OnboardingStepType.OWNER_ADDRESS)
    await this.refreshOnboardingStatus(onboardingId)
    return step
  }

  async getOnboardingByOrganizationIdAndType(
    organizationId: string,
    onboardingType: OnboardingType
  ): Promise<Onboarding> {
    const onboarding = await this.onboardingRepository.findOne({
      where: {
        organization: { id: organizationId },
        type: onboardingType
      },
      relations: {
        onboardingSteps: true
      }
    })
    if (onboarding) {
      await this.refreshOnboardingStatus(onboarding.id)
    }
    return onboarding
  }

  async getOnboardingStepByType(onboardingId: string, type: OnboardingStepType): Promise<OnboardingStep> {
    return await this.onboardingStepsRepository.findOne({
      where: {
        onboarding: { id: onboardingId },
        type: type
      }
    })
  }

  async getOrCreateOrganizationOnboarding(
    organization: Organization,
    onboardingType: OnboardingType
  ): Promise<Onboarding> {
    let onboarding = await this.getOnboardingByOrganizationIdAndType(organization.id, onboardingType)
    if (!onboarding) {
      onboarding = this.onboardingRepository.create({
        organization: organization,
        type: onboardingType,
        status: OnboardingStatus.PENDING
      })
      onboarding = await this.onboardingRepository.save(onboarding)
    }
    return onboarding
  }

  async updateOnboardingStatus(onboardingId: string, onboardingStatus: OnboardingStatus) {
    const object: DeepPartial<Onboarding> = {
      status: onboardingStatus
    }
    await this.onboardingRepository.update(onboardingId, object)
  }

  async registerOwnerAddress(
    blockchainId: string,
    walletAddress: string,
    onboardingId: string
  ): Promise<OnboardingStep> {
    let metadata: OwnerAddressMetadata = {
      walletAddress: walletAddress,
      blockhainId: blockchainId
    }

    const step = await this.upsertOwnerAddressOnboardingStep(onboardingId, metadata)
    return step
  }

  async initiateKYB(organization: Organization, onboardingId: string): Promise<OnboardingStep> {
    //Create an onboarding step for init KYB

    let referenceId = organization.publicId + '_1'
    let metadata: KYBMetadata = {
      referenceId: referenceId,
      recordId: ''
    }
    const step = await this.createKybOnboardingStep(onboardingId, metadata)
    return step
  }

  private async refreshOnboardingStatus(onboardingId: string) {
    let updatedOnboardingStatus: OnboardingStatus

    const onboarding = await this.onboardingRepository.findOne({
      where: {
        id: onboardingId
      },
      relations: {
        onboardingSteps: true
      }
    })

    const registerOwnerAddressStep = onboarding.onboardingSteps.find(
      (step) => step.type === OnboardingStepType.OWNER_ADDRESS
    )
    const kybStep = onboarding.onboardingSteps.find((step) => step.type === OnboardingStepType.KYB)

    if (
      kybStep?.status === OnboardingStepStatus.COMPLETED &&
      registerOwnerAddressStep?.status === OnboardingStepStatus.COMPLETED
    ) {
      updatedOnboardingStatus = OnboardingStatus.COMPLETED
    } else if (kybStep?.status === OnboardingStepStatus.BLOCKED) {
      updatedOnboardingStatus = OnboardingStatus.FAILED
    } else {
      updatedOnboardingStatus = OnboardingStatus.PENDING
    }

    if (onboarding.status !== updatedOnboardingStatus) {
      onboarding.status = updatedOnboardingStatus
      await this.updateOnboardingStatus(onboarding.id, onboarding.status)
    }
  }
}
