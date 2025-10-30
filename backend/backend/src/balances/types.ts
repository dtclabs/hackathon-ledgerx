import { BalanceDto } from './interfaces'

export enum BalanceGroupByFieldEnum {
  WALLET_ID = 'walletId',
  BLOCKCHAIN_ID = 'blockchainId'
}

export type BalanceGroupType = {
  [entityId: string]: BalanceDto
}
