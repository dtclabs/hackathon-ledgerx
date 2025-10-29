import { FinancialTransactionQueryParams } from '../../../financial-transactions/interfaces'

export enum FinancialTransactionExportType {
  ALL = 'all',
  MANUAL = 'manual'
}

export enum FinancialTransactionExportFileType {
  CSV = 'text/csv',
  PDF = 'application/pdf'
}

export enum FinancialTransactionExportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface FinancialTransactionExportWorkflowMetadata {
  financialTransactionIds: string[] | null
  query: FinancialTransactionQueryParams
}
