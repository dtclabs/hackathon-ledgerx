export enum BlockpassStatus {
  INCOMPLETE = 'incomplete',
  WAITING = 'waiting',
  INREVIEW = 'inreview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BLOCKED = 'blocked'
}

export interface BlockpassResponse {
  status: BlockpassResponseStatus
  data: BlockpassMetaData
}

export interface BlockpassMetaData {
  status: BlockpassStatus
  recordId: string
  refId: string
}

export enum BlockpassResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum BlockpassErrorInfo {
  MESSAGE = 'Resource not Found',
  CODE = 404
}
