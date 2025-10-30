import { AnyMxRecord } from 'dns'
import { IAnnotation } from '../tags/tag-type'

export enum CardOnboardingStatus {
  INCOMPLETE = 'incomplete',
  WAITING = 'waiting',
  INREVIEW = 'inreview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  PENDING = 'pending'
}

export enum CardOnboardingStep {
  WHITELIST_ADDRESS = 'whitelist_address',
  KNOW_YOUR_BUSINESS = 'know_your_business'
}

export enum CardType {
  VIRTUAL = 'virtual',
  PHYSICAL = 'physical'
}

export enum CardStatus {
  ACTIVE = 'active',
  LOCKED = 'locked'
}

export enum CardTransactionStatus {
  PENDING = 'pending',
  REVERTED = 'reverted',
  DECLINED = 'declined',
  COMPLETED = 'completed'
}
export enum CardTransactionType {
  CHARGE = 'charge',
  REFUND = 'refund'
}

export interface ICardOnboardingStep {
  id: string
  type: string
  status: CardOnboardingStatus
  steps: CardOnboardingStep[]
  metadata: any
}

export interface ICardHolder {
  id: string
  name: string
  contactNumber: string
}

export interface ICard {
  id: string
  displayName: string
  truncatedNumber: string
  cardHolder: ICardHolder
  assignee: string
  status: CardStatus
  annotations: IAnnotation[]
}

export interface ICardTransaction {
  id: string
  status: CardTransactionStatus
  requestedAmount: string
  requestedCurrency: {
    code: string
    name: string
    symbol: string
  }
  type: CardTransactionType
  timestamp: string
  card: ICard
  metadata: any
}

export interface ICreateCardPayload {
  name: string
  holderName: string
  assignee: string
  contactNumber: string
  tags: string[]
}

export const MOCK: ICardOnboardingStep = {
  id: '1',
  metadata: {
    wallet_address: '0x00'
  },
  status: CardOnboardingStatus.COMPLETED,
  steps: [CardOnboardingStep.KNOW_YOUR_BUSINESS, CardOnboardingStep.WHITELIST_ADDRESS],
  type: ''
}
