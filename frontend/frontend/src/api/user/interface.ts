export interface IUser {
  address: string
  nonce: string
  accountId: number
  refreshToken?: string
}

export enum EProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  TWITTER = 'twitter',
  WALLET = 'wallet'
}

export interface ISignInRequest {
  token: string
  publicKey: string
  address: string
  signature: string
  provider: EProvider
}

export interface ISignUpRequest extends ISignInRequest {
  firstName: string
  lastName: string
  email?: string
}

export interface ISignInResponse {
  accessToken: string
  provider?: EProvider
  isNewAccount?: boolean
}

export interface IPostWallet {
  address: string
}
