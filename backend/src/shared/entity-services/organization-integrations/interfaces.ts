import { Brand, Module } from '../../../domain/integrations/dtcpay/interfaces'
import { ConnectionStatus, SyncStatus } from '../../../domain/integrations/accounting/interfaces'

export enum OrganizationIntegrationStatus {
  COMPLETED = 'completed',
  INITIATED = 'initiated',
  TOKEN_SWAPPED = 'token_swapped',
  MIGRATING = 'migrating',
  FAILED = 'failed',
  DISCONNECTED_STANDBY = 'disconnected_standby'
}

export type OrganizationIntegrationMetadata =
  | OrganizationIntegrationTripleAMetadata
  | OrganizationIntegrationXeroMetadata
  | OrganizationIntegrationDtcpayMetadata

export interface OrganizationIntegrationTripleAMetadata {
  companyId: string
  wallet: {
    address: string
    blockchainIds: string[]
  }
}

export interface OrganizationIntegrationXeroMetadata {
  companyName: string
  currency: string
  timezone?: string
  connection_status?: ConnectionStatus
  sync_status?: SyncStatus
  updated_at?: number
}

export interface OrganizationIntegrationDtcpayMetadata extends OrganizationIntegrationXeroMetadata {
  currencyCategory: string
  address: {
    country: string
    city: string
    state: string
    postalCode: string
    address: string
  }
  channels: {
    brand: Brand
    processingCurrency: string
    module: Module
    acqRouteId: number
  }[]
}

export class DtcpayAuthMetadata {
  signKey: string
  merchantId: number
  terminalId: number
}

export interface OrganizationIntegrationOperationRemarks {
  disconnectType: OrganizationIntegrationDisconnectType
  disconnectDetails?: any
}

export enum OrganizationIntegrationDisconnectType {
  USER = 'user',
  SYSTEM = 'system'
}
