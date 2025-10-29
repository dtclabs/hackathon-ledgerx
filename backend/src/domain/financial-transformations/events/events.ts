export enum FinancialTransformationsEventType {
  PREPROCESS_RAW_SYNC_ADDRESS = 'financialTransformation.preprocess.syncAddress',
  CORE_TRANSFORMATION_SYNC_ADDRESS = 'financialTransformation.core.syncAddress',
  ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET = 'financialTransformation.additional.perWallet',
  ADDITIONAL_TRANSFORMATION_SYNC_PER_WALLET_GROUP = 'financialTransformation.additional.perWalletGroup',
  OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION = 'financialTransformation.operational.changeFiatCurrencyForOrganization',
  OPERATIONAL_TRANSFORMATION_RECALCULATE_PRICES_FOR_TRANSACTION_PARENT = 'financialTransformation.operational.recalculatePricesForTransactionParent',
  DRAFT_TRANSACTION_MIGRATION = 'financialTransformation.operational.draftTransactionMigration'
}
export enum IngestionEventType {
  INGESTION_SYNC_ADDRESS = 'ingestion.syncAddress',
  INGESTION_EXECUTE_SYNC_PROCESS = 'ingestion.executeSyncProcess',
  INGESTION_SYNC_PROCESS_STATUS_UPDATED = 'ingestion.syncProcessStatusUpdated'
}

export enum PayoutsEventType {
  PAYOUTS_SYNC = 'payouts.sync'
}

export enum PaymentEventType {
  PAYMENT_EXECUTED = 'payment.executed'
}

export enum PaymentsEventType {
  PAYMENTS_SYNC = 'payments.sync'
}

export class IngestionSyncEvent {
  constructor(public readonly ingestionWorkflowId: string) {}
}

export class IngestionExecuteProcessEvent {
  constructor(public readonly ingestionProcessId: string) {}
}

export class PaymentExecutedEvent {
  constructor(public readonly paymentId: string) {}
}

export class PaymentsSyncEvent {
  constructor(
    public readonly walletGroupId: string,
    public readonly blockchainId: string,
    public readonly organizationId: string
  ) {}
}

export class ResyncGainLossForGroupEventParams {
  walletId: string
  blockchainId: string

  static map(params: { walletId: string; blockchainId: string }): ResyncGainLossForGroupEventParams {
    const result = new ResyncGainLossForGroupEventParams()
    result.walletId = params.walletId
    result.blockchainId = params.blockchainId
    return result
  }
}

export class ChangeFiatCurrencyForOrganizationEventParams {
  organizationId: string
  fiatCurrencyAlphabeticCode: string

  static map(params: {
    organizationId: string
    fiatCurrencyAlphabeticCode: string
  }): ChangeFiatCurrencyForOrganizationEventParams {
    const result = new ChangeFiatCurrencyForOrganizationEventParams()
    result.organizationId = params.organizationId
    result.fiatCurrencyAlphabeticCode = params.fiatCurrencyAlphabeticCode
    return result
  }
}
