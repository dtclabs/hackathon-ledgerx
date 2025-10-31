/* eslint-disable lines-between-class-members */

export interface IWalletActionRejected {
  type: 'WalletActionRejected'
  systemMessage?: string
  message: string
}

export class WalletActionRejected extends Error {
  type = 'WalletActionRejected'
  systemMessage?: string
  message: string

  constructor(message: string, systemMessage: string) {
    super(message)
    this.systemMessage = systemMessage
  }
}

export interface ITokenNotFound {
  type: 'TokenNotFound'
  tokenId: string
}

export class TokenNotFoundError extends Error {
  type = 'TokenNotFound'
  tokenId: string

  constructor(message: string, tokenId: string) {
    super(message)
    this.tokenId = tokenId
  }
}

export class ErrorCreatingContractInstance extends Error {
  type = 'ErrorCreatingContractInstance'
  systemMessage: string

  constructor(message: string, systemMessage: string) {
    super(message)
    this.systemMessage = systemMessage
  }
}

export interface IInsufficientFunds {
  type: 'InsufficientFunds'
  systemMessage: string
  sourceWalletId: string
  tokenId?: string
  tokenIds?: string[]
  amount: string
  message: string
}

export class InsufficientFunds extends Error {
  type = 'InsufficientFunds'
  systemMessage: string
  sourceWalletId: string
  tokenId?: string
  tokenIds?: string[]
  amount: string

  constructor({ message, systemMessage, sourceWalletId, tokenId, amount, tokenIds }: IInsufficientFunds) {
    super(message)
    this.systemMessage = systemMessage
    this.sourceWalletId = sourceWalletId
    this.tokenId = tokenId
    this.amount = amount
    this.tokenIds = tokenIds
  }
}

export interface IInsufficientApprovalAmount {
  type: 'InsufficientApprovalAmount'
  message: string
  systemMessage: string
  currentApproval: string
  tokenId: string
  tokenAddress: string
  amount: string
}

export class InsufficientApprovalAmount extends Error {
  type = 'InsufficientApprovalAmount'
  systemMessage: string
  currentApproval: string
  tokenId: string
  tokenAddress: string
  amount: string

  constructor({ message, systemMessage, currentApproval, tokenId, tokenAddress, amount }: IInsufficientApprovalAmount) {
    super(message)
    this.systemMessage = systemMessage
    this.currentApproval = currentApproval
    this.tokenId = tokenId
    this.tokenAddress = tokenAddress
    this.amount = amount
  }
}
