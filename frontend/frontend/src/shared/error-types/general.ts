/* eslint-disable lines-between-class-members */


export interface IGenericError {
  type: 'GenericError'
  systemMessage?: string
  message: string
}

export class GenericError extends Error {
  type = 'GenericError'
  systemMessage?: string
  message: string

  constructor(message: string, systemMessage?: string) {
    super(message)
    this.systemMessage = systemMessage ?? undefined
  }
}

export interface IUnknownError {
  type: 'UnknownError'
  systemMessage?: string
}

export class UnknownError extends Error {
  type = 'UnknownError'
  systemMessage?: string

  constructor(message: string, systemMessage?: string) {
    super(message)
    this.systemMessage = systemMessage ?? undefined
  }
}


export interface INoWalletFound {
  type: 'NoWalletFound'
  sourceId: string
}
export class NoWalletFound extends Error {
  type = 'NoWalletFound'
  sourceId: string

  constructor({ message, sourceId }) {
    super(message)
    this.sourceId = sourceId
  }
}
  