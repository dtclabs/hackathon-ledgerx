import { WalletStatusesEnum } from '../../shared/entity-services/wallets/interfaces'

export class WalletBalanceSyncPerWalletEventParams {
  constructor(public readonly walletId: string) {}
}

export class WalletSyncBalanceFromChainsEventParams {
  constructor(public readonly params: { walletGroupId: string; blockchainId: string }) {}
}

export class WalletChangeSyncStatusEvent {
  constructor(
    public readonly payload: {
      address: string
      blockchainId: string
      organizationId: string
      status: WalletStatusesEnum
    }
  ) {}
}

export class WalletPendingTransactionsSyncEvent {
  constructor(public readonly payload: { walletId: string }) {}
}

export class WalletCreatedEvent {
  constructor(public readonly walletId: string, public readonly organizationId: string) {}
}

export class WalletUpdatedEvent {
  constructor(public readonly walletId: string, public readonly organizationId: string) {}
}

export class WalletDeletedEvent {
  constructor(public readonly walletId: string, public readonly organizationId: string) {}
}
