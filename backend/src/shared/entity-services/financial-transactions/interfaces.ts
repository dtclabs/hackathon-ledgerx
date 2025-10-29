import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { FinancialTransactionParent } from './financial-transaction-parent.entity'

export enum FinancialTransactionParentActivity {
  TRANSFER = 'transfer',
  SWAP = 'swap',
  CONTRACT_INTERACTION = 'contract_interaction',
  // OFF_RAMP = 'off_ramp',
  // ON_RAMP = 'on_ramp',
  WRAP = 'wrap',
  UNWRAP = 'unwrap'
}

// This is temporarily being used for sorting in getting the transactions, check before adding enum
export enum FinancialTransactionChildMetadataDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing'
}

export enum FinancialTransactionChildMetadataType {
  // Adding below should check the method signature updatePublicIdAndDirectionBasedOnType on CreateFinancialTransactionChildDto
  // Direction = incoming
  DEPOSIT = 'deposit',
  DEPOSIT_INTERNAL = 'deposit_internal',
  DEPOSIT_GROUP = 'deposit_group',

  //Direction = outgoing
  FEE = 'fee',
  WITHDRAWAL = 'withdrawal',
  WITHDRAWAL_INTERNAL = 'withdrawal_internal',
  WITHDRAWAL_GROUP = 'withdrawal_group'
}

export const FinancialTransactionChildMetadataNames = {
  [FinancialTransactionChildMetadataType.DEPOSIT]: 'Deposit',
  [FinancialTransactionChildMetadataType.DEPOSIT_INTERNAL]: 'Deposit (Internal)',
  [FinancialTransactionChildMetadataType.DEPOSIT_GROUP]: 'Deposit (Group)',
  [FinancialTransactionChildMetadataType.WITHDRAWAL]: 'Withdrawal',
  [FinancialTransactionChildMetadataType.WITHDRAWAL_INTERNAL]: 'Withdrawal (Internal)',
  [FinancialTransactionChildMetadataType.WITHDRAWAL_GROUP]: 'Withdrawal (Group)',
  [FinancialTransactionChildMetadataType.FEE]: 'Fee'
}

export enum FinancialTransactionParentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum FinancialTransactionParentExportStatus {
  UNEXPORTED = 'unexported',
  EXPORTING = 'exporting',
  EXPORTED = 'exported',
  FAILED = 'failed'
}

export enum FinancialTransactionChildMetadataStatus {
  SYNCED = 'synced',
  INACTIVE = 'inactive',
  IGNORED = 'ignored',
  SYNCING = 'syncing'
}

export enum FinancialTransactionPreprocessStatus {
  CREATING = 'creating',
  COMPLETED = 'completed'
}

export enum GainLossInclusionStatus {
  ALL = 'all',
  // Internal means tax lot should be sold and purchased but it is dependent on the original tax lot purchase date and cost basis.
  // Any changes to the original tax lot will propagate.
  // This applies to both same wallet transfer and intra-wallet group account transfer
  INTERNAL = 'internal',
  // One application of none is when the transaction is ignored
  NONE = 'none'
}

export enum FinancialTransactionChildMetadataSubstatus {
  MISSING_COST_BASIS = 'missing_cost_basis',
  MISSING_PRICE = 'missing_price'
}

export class CreateFinancialTransactionParentDto {
  hash: string
  blockchainId: string
  activity: FinancialTransactionParentActivity
  status: FinancialTransactionParentStatus
  organizationId: string
  valueTimestamp: Date
}

export class CreateFinancialTransactionChildDto {
  publicId: string
  hash: string
  blockchainId: string
  status: FinancialTransactionChildMetadataStatus
  type: FinancialTransactionChildMetadataType
  direction: FinancialTransactionChildMetadataDirection
  fromAddress: string
  toAddress: string | null
  proxyAddress: string | null
  cryptocurrency: Cryptocurrency
  cryptocurrencyAmount: string
  valueTimestamp: Date
  organizationId: string
  financialTransactionParent: FinancialTransactionParent | null
  gainLossInclusionStatus: GainLossInclusionStatus

  static updatePublicIdAndDirectionBasedOnType(dto: CreateFinancialTransactionChildDto) {
    if (
      [
        FinancialTransactionChildMetadataType.FEE,
        FinancialTransactionChildMetadataType.WITHDRAWAL,
        FinancialTransactionChildMetadataType.WITHDRAWAL_INTERNAL,
        FinancialTransactionChildMetadataType.WITHDRAWAL_GROUP
      ].includes(dto.type)
    ) {
      dto.direction = FinancialTransactionChildMetadataDirection.OUTGOING
    } else if (
      [
        FinancialTransactionChildMetadataType.DEPOSIT,
        FinancialTransactionChildMetadataType.DEPOSIT_INTERNAL,
        FinancialTransactionChildMetadataType.DEPOSIT_GROUP
      ].includes(dto.type)
    ) {
      dto.direction = FinancialTransactionChildMetadataDirection.INCOMING
    }

    if (dto.direction === FinancialTransactionChildMetadataDirection.OUTGOING) {
      // o for outgoing. This wont be in the original character list as hexadecimal character only contains a-f
      dto.publicId = dto.publicId.slice(0, 31).concat('o')
    } else if (dto.direction === FinancialTransactionChildMetadataDirection.INCOMING) {
      // i for incoming. This wont be in the original character list as hexadecimal character only contains a-f
      dto.publicId = dto.publicId.slice(0, 31).concat('i')
    }
  }
}

export enum FinancialTransactionPreprocessSpecialAccount {
  GAS_FEE_ACCOUNT = 'gas_fee_account',
  BLOCK_REWARD_ACCOUNT = 'block_reward_account',
  CORRECTING_BALANCE_ACCOUNT = 'correcting_balance_account',
  //Found on Sepolia. Tx 0x44ae09d75a5687d3886c3207c6f11a715a61735b50e3bd1ff57402ef7cf279e2 doesn't have "TO" in receipt on both Alchemy and Etherscan
  EMPTY_TO_ACCOUNT = 'empty_to_account'
}

export interface CreateFinancialTransactionPreprocessDto {
  forPublicIdGeneration: string
  hash: string
  blockchainId: string
  status: FinancialTransactionPreprocessStatus
  fromAddress: string
  toAddress: FinancialTransactionPreprocessSpecialAccount | string
  initiatorAddress: string
  cryptocurrency: Cryptocurrency
  cryptocurrencyAmount: string
  valueTimestamp: Date
  //TODO: see https://app.clickup.com/t/865ce74fd
  order?: number
  typeOrder?: number
}

export interface FinancialTransactionChildPaymentMetadata {
  createdBy: string
  reviewedBy: string
  executedBy: string
  createdAt: Date
  reviewedAt: Date
  executedAt: Date
}
