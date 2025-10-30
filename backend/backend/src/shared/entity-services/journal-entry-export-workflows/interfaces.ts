export enum JournalEntryExportStatus {
  GENERATING = 'generating',
  GENERATING_FAILED = 'generating_failed', // need manual action to move the status back to generating
  GENERATED = 'generated',
  ABORTED = 'aborted', // generated -> aborted
  EXPORTING = 'exporting', // generated -> exporting
  COMPLETED = 'completed',
  CANCELLED = 'cancelled', // exporting -> cancelled
  FAILED = 'failed', // failed, but can be retried
  TERMINATED = 'terminated' // when system got non-retryable error
}

export const JOURNAL_ENTRY_EXPORT_TERMINAL_STATUSES = [
  JournalEntryExportStatus.ABORTED,
  JournalEntryExportStatus.COMPLETED,
  JournalEntryExportStatus.CANCELLED
]

export enum JournalEntryExportType {
  ALL = 'all',
  UNEXPORTED = 'unexported',
  MANUAL = 'manual',
  FILTERED = 'filtered'
}

export interface JournalEntryExportWorkflowMetadata {
  financialTransactionParentIds: string[] | null
}
