import { IGetAllOptions } from '../../api/interface'

export enum ERole {
  Owner = 'Owner',
  Admin = 'Admin',
  Employee = 'Employee',
  Vendor = 'Vendor',
  Auditor = 'Auditor',
  BillingManager = 'Billing Manager'
}

export enum EAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  INVITED = 'invited',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface IAccount {
  id: string
  role: ERole
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  name: string
  image: string
  activeOrganizationId: string | null
  emailAccounts?: {
    createdAt: string
    deletedAt: string | null
    email: string
    id: string
    updatedAt: string
    verifierId: string
  }[]
  walletAccounts?: {
    address: string
    createdAt: string
    deletedAt: string | null
    id: string
    nonce: string
    updatedAt: string
  }
}

export interface IPostAccount {
  name: string
}

export interface IPutAccountAdmin extends IPostAccount {
  id: string
  role: any
  address?: string
  chainIds: string[]
  groupIds: string[]
}
export interface IPutAccount extends IPostAccount {
  id: string
  address: string
  name: string
}
export interface IInviteAccount extends IPostAccount {
  chainIds: string[]
  groupIds: string[]
  address?: string
  role: ERole
}

export interface IConfirmAccountRequest {
  token: string
}
export interface IRejectAccountRequest {
  token: string
}

export interface IGetAccounts extends IGetAllOptions {
  organizationId: string
}

export interface IDeleteAccount {
  id: string
}

/* NEW */

export interface IMemberInvite {
  firstName: string
  lastName: string
  email: string
  address: string
  role: 'Owner' | 'Employee' | 'Admin'
  message: string
}
