import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export const ROOTFI_API_KEY = 'ROOTFI_API_KEY'
export const DAYS_DIFF = 7

export enum RequestFormatENUM {
  json = 'JSON'
}

export class RateLimitError extends Error {
  statusCode: HttpStatus
  message: string
  retryAt?: Date

  constructor({ statusCode, message, retryAt }: { statusCode: HttpStatus; message: string; retryAt?: Date }) {
    super()
    this.statusCode = statusCode
    this.message = message
    this.retryAt = retryAt
  }
}

export interface LinkToken {
  company_id?: number
  link_token?: string
  integration_name?: string
}

export interface CompanyInfo {
  id?: string | number
  timezone?: string
  remote_id?: string | null
  name?: string | null
  currency?: string
  connection_status?: ConnectionStatus
  sync_status?: SyncStatus
  updated_at?: Date
}

export enum ConnectionStatus {
  HEALTHY = 'HEALTHY',
  DISCONNECTED = 'DISCONNECTED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING'
}

export enum SyncStatus {
  IDLE = 'IDLE',
  FETCHING = 'FETCHING',
  SLEEPING = 'SLEEPING',
  PARSING = 'PARSING',
  RUNNING = 'RUNNING'
}

export enum COAType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EXPENSE = 'EXPENSE',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE'
}

export enum COASourceStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

export class Account {
  @ApiProperty({ description: 'This is the integration AccountId' })
  id: string
  remote_id?: string
  name: string
  description: string
  type: COAType
  account_number: string
  current_balance: number
  company: string
  status: COASourceStatus
  updated_at: Date
  // raw_data contains raw data of integration platform
  raw_data?: any
}

export class ModifiedAccount extends Account {
  @ApiProperty({ description: 'These are the keys that are modified' })
  keysChangedAtSource: string[]
}

export interface GetCOAFromIntegrationOutput {
  accounts?: Account[]
  disconnected?: boolean
  message?: string
  error?: any
}

export interface GetAccountsCondition {
  createdAfter?: Date
  createdBefore?: Date
  cursor?: string
  includeDeletedData?: boolean
  includeRemoteData?: boolean
  modifiedAfter?: Date
  modifiedBefore?: Date
  pageSize?: number
  remoteId?: string | null
}

export enum Platform {
  MERGE = 'merge',
  ROOTFI = 'rootfi'
}

export enum AccountStatus {
  RELINK_NEEDED = 'RELINK_NEEDED',
  COMPLETE = 'COMPLETE'
}

export interface AccountDetails {
  status: string
}

export interface PostJournalEntryResult {
  remoteId: string
  updatedAt: Date
}

export interface RootFiSyncStatusResult {
  syncId: string
  status: string
}

export enum RootFiSyncStatus {
  SUCCESS = 'SUCCESS',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED'
}

export const SYNC_OPERATION_DENIED = 'operation-denied'
export const INVALID_INTEGRATION_NAME = 'invalid integration name'
export const INVALID_SYNC_STATUS = 'invalid sync status'
