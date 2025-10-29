export enum NftSyncStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface NftAddressSyncMetadata {
  updateAfter?: Date
}
