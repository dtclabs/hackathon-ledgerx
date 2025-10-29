export enum ChartOfAccountRulesEventTypes {
  SYNC_UNMAPPED_FINANCIAL_TRANSACTIONS = 'chart-of-account-rules.sync-unmapped-financial-transactions'
}

export interface SyncUnmappedFinancialTransactionEvent {
  organizationId: string
}
