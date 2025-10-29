export enum JournalEntryStatus {
  CREATED = 'created',
  GENERATING = 'generating',
  READY_TO_EXPORT = 'ready_to_export',
  EXPORTING = 'exporting',
  EXPORTED = 'exported',
  FAILED = 'failed',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

export enum JournalEntryStatusReason {
  AMOUNT_MISMATCH = 'amount_mismatch'
}

export enum JournalLineEntryType {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

export interface XeroIntegrationParams {
  narration: string
}

export interface JournalEntryIntegrationParams {
  xero: XeroIntegrationParams
}
