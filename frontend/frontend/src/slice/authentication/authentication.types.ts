import { IAccount } from '@/slice/account/account-slice'

export interface IRegisterResponse {
  accessToken: string
  account: IAccount
}

export interface IRegisterParams {
  token?: string
  provider: string
  address?: string
  signature?: string
  firstName: string
  lastName: string
  agreementSignedAt: string
}

export interface IAuthorizeParams {
  code?: string
  provider: string
  address?: string
}

export interface IAuthorizeResponse {
  accessToken: string
  account: any
  isNewAccount: boolean
}

export interface ILoginParams {
  token?: string
  provider: string
  address?: string
  signature?: string
}
