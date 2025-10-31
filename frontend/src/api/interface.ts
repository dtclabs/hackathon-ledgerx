import { EProvider } from './user/interface'

export interface IPagination<T> {
  totalItems: number
  totalPages: number
  currentPage: number
  items: T[]
  limit: number
}

export enum EDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum EAction {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum ESubject {
  ACCOUNT = 'Account',
  GROUP = 'Group',
  TRANSACTION = 'Transaction',
  ROLE = 'Role',
  SOURCEOFFUND = 'SourceOfFund',
  ALL = 'All',
  RECIPIENT = 'Recipient'
}

export interface IDecodeToken {
  address: string
  email: string
  accountId: string
  exp: number
  iat: number
  id?: string
  walletId: string
  providers: EProvider[]
  organizationId?: string
}

export interface IGetAllOptions {
  search?: string
  page?: number | string
  size?: number | string
  direction?: EDirection
  order?: string | string
}

export interface ITime {
  expiredAt?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}
