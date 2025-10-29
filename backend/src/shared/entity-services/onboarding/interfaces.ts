import { BlockpassStatus } from '../../../domain/integrations/blockpass/interfaces'

export interface OwnerAddressMetadata {
  walletAddress: string
  blockhainId: string
}

export interface KYBMetadata {
  referenceId: string
  recordId: string
  blockpassStatus?: BlockpassStatus
}

export enum OnboardingStepStatus {
  CREATED = 'created',
  COMPLETED = 'completed',
  PENDING = 'pending',
  REJECTED = 'rejected',
  BLOCKED = 'blocked'
}

export enum OnboardingStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum OnboardingStepType {
  OWNER_ADDRESS = 'owner_address',
  KYB = 'know_your_business'
}

export enum OnboardingType {
  CARD = 'card'
}
