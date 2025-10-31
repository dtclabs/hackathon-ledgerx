export { NoWalletFound, UnknownError, GenericError } from './general'
export type { IUnknownError, IGenericError, INoWalletFound } from './general'
export {
  WalletActionRejected,
  ErrorCreatingContractInstance,
  TokenNotFoundError,
  InsufficientApprovalAmount,
  InsufficientFunds
} from './web3.errors'
export type {
  ITokenNotFound,
  IWalletActionRejected,
  IInsufficientFunds,
  IInsufficientApprovalAmount
} from './web3.errors'
