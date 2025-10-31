export enum EOptions {
  OPTIONS = 'Options',
  WALLET = 'Wallet',
  SAFE = 'Safe',
  ACCOUNT = 'Account'
}

export enum EProcessStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  REJECTED = 'Rejected'
}

export enum EWalletTab {
  WALLETS = 'Wallets',
  GROUPS = 'Wallet Groups'
}

export const walletTabs = [
  {
    key: EWalletTab.WALLETS,
    name: 'Wallets',
    active: true
  },
  {
    key: EWalletTab.GROUPS,
    name: 'Wallet Groups',
    active: false
  }
]
