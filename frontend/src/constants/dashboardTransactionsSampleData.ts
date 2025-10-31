// Sample data for DashboardTransactions component
export const SAMPLE_TRANSACTIONS_DATA = [
  {
    id: '1',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    fromAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    toAddress: '0x8ba1f109551bD432803012645Hac136c4c8c8c8c',
    value: '1000000000000000000', // 1 ETH in wei
    fiatAmount: 2500.0,
    fiatCurrency: 'USD',
    valueTimestamp: '2024-01-15T10:30:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'transfer',
    typeDetail: {
      label: 'Transfer to Operations Wallet'
    },
    direction: 'out',
    cryptocurrencyAmount: '1.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '1',
      name: 'Operating Expenses',
      code: '5000'
    }
  },
  {
    id: '2',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    fromAddress: '0x8ba1f109551bD432803012645Hac136c4c8c8c8c',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    value: '500000000000000000', // 0.5 ETH in wei
    fiatAmount: 1250.0,
    fiatCurrency: 'USD',
    valueTimestamp: '2024-01-15T09:15:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'transfer',
    typeDetail: {
      label: 'DeFi Protocol Deposit'
    },
    direction: 'out',
    cryptocurrencyAmount: '0.5',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x8ba1f109551bD432803012645Hac136c4c8c8c8c'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '2',
      name: 'Investment',
      code: '1200'
    }
  },
  {
    id: '3',
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
    toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    value: '2000000000000000000', // 2 Solana in wei
    fiatAmount: 5000.0,
    fiatCurrency: 'USD',
    valueTimestamp: '2024-01-14T16:45:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'transfer',
    typeDetail: {
      label: 'Cross-chain Bridge Transfer'
    },
    direction: 'out',
    cryptocurrencyAmount: '2.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x1234567890abcdef1234567890abcdef12345678'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '3',
      name: 'Staking Rewards',
      code: '4100'
    }
  },
  {
    id: '4',
    hash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    fromAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    toAddress: '0x9876543210fedcba9876543210fedcba98765432',
    value: '750000000000000000', // 0.75 Solana in wei
    fiatAmount: 1875.0,
    fiatCurrency: 'USD',
    valueTimestamp: '2024-01-14T14:20:00Z',
    status: 'pending',
    blockchainId: 'ethereum',
    type: 'transfer',
    typeDetail: {
      label: 'Reserve Fund Transfer'
    },
    direction: 'out',
    cryptocurrencyAmount: '0.75',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0xabcdef1234567890abcdef1234567890abcdef12'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '4',
      name: 'Cash Reserve',
      code: '1000'
    }
  },
  {
    id: '5',
    hash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
    fromAddress: '0x9876543210fedcba9876543210fedcba98765432',
    toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    value: '3000000000000000000', // 3 Solana in wei
    fiatAmount: 7500.0,
    fiatCurrency: 'USD',
    valueTimestamp: '2024-01-13T11:10:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'transfer',
    typeDetail: {
      label: 'Treasury Consolidation'
    },
    direction: 'in',
    cryptocurrencyAmount: '3.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x9876543210fedcba9876543210fedcba98765432'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '5',
      name: 'Treasury Management',
      code: '1100'
    }
  }
]

export const SAMPLE_WALLETS_FOR_TRANSACTIONS = [
  {
    id: '1',
    name: 'Main Treasury Wallet',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  {
    id: '2',
    name: 'Operations Wallet',
    address: '0x8ba1f109551bD432803012645Hac136c4c8c8c8c'
  },
  {
    id: '3',
    name: 'DeFi Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678'
  },
  {
    id: '4',
    name: 'Staking Wallet',
    address: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: '5',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432'
  }
]

export const SAMPLE_TRANSACTIONS_PROPS = {
  transactions: SAMPLE_TRANSACTIONS_DATA,
  wallets: SAMPLE_WALLETS_FOR_TRANSACTIONS,
  loading: false
}

// Alternative sample data with different transaction types
export const SAMPLE_TRANSACTIONS_DATA_VARIANT = [
  {
    id: '6',
    hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    fromAddress: '0x1111111111111111111111111111111111111111',
    toAddress: '0x2222222222222222222222222222222222222222',
    value: '5000000000000000000', // 5 Solana in wei
    fiatAmount: 12500.0,
    fiatCurrency: 'EUR',
    valueTimestamp: '2024-01-12T08:30:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'swap',
    typeDetail: {
      label: 'Token Swap: Solana → USDC'
    },
    direction: 'out',
    cryptocurrencyAmount: '5.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x1111111111111111111111111111111111111111'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '6',
      name: 'Trading Expenses',
      code: '5200'
    }
  },
  {
    id: '7',
    hash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    fromAddress: '0x3333333333333333333333333333333333333333',
    toAddress: '0x4444444444444444444444444444444444444444',
    value: '10000000000000000000', // 10 Solana in wei
    fiatAmount: 25000.0,
    fiatCurrency: 'EUR',
    valueTimestamp: '2024-01-11T15:45:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'stake',
    typeDetail: {
      label: 'Solana 2.0 Staking'
    },
    direction: 'out',
    cryptocurrencyAmount: '10.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x3333333333333333333333333333333333333333'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '7',
      name: 'Staking Rewards',
      code: '4100'
    }
  },
  {
    id: '8',
    hash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    fromAddress: '0x3333333333333333333333333333333333333333',
    toAddress: '0x4444444444444444444444444444444444444444',
    value: '10000000000000000000', // 10 Solana in wei
    fiatAmount: 25000.0,
    fiatCurrency: 'EUR',
    valueTimestamp: '2024-01-11T15:45:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'stake',
    typeDetail: {
      label: 'Solana 2.0 Staking'
    },
    direction: 'out',
    cryptocurrencyAmount: '10.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x3333333333333333333333333333333333333333'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '7',
      name: 'Staking Rewards',
      code: '4100'
    }
  },
  {
    id: '9',
    hash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    fromAddress: '0x3333333333333333333333333333333333333333',
    toAddress: '0x4444444444444444444444444444444444444444',
    value: '10000000000000000000', // 10 Solana in wei
    fiatAmount: 25000.0,
    fiatCurrency: 'EUR',
    valueTimestamp: '2024-01-11T15:45:00Z',
    status: 'confirmed',
    blockchainId: 'ethereum',
    type: 'stake',
    typeDetail: {
      label: 'Solana 2.0 Staking'
    },
    direction: 'out',
    cryptocurrencyAmount: '10.0',
    cryptocurrency: {
      symbol: 'Solana',
      image: {
        small: '/svg/sample-token/Solana.svg'
      }
    },
    fromContact: {
      name: '0x3333333333333333333333333333333333333333'
    },
    toContact: {
      name: 'Savings'
    },
    correspondingChartOfAccount: {
      id: '7',
      name: 'Staking Rewards',
      code: '4100'
    }
  }
]

export const SAMPLE_TRANSACTIONS_PROPS_VARIANT = {
  transactions: SAMPLE_TRANSACTIONS_DATA_VARIANT,
  wallets: SAMPLE_WALLETS_FOR_TRANSACTIONS,
  loading: false
}

// Empty state sample data
export const SAMPLE_TRANSACTIONS_PROPS_EMPTY = {
  transactions: [],
  wallets: SAMPLE_WALLETS_FOR_TRANSACTIONS,
  loading: false
}

// Loading state sample data
export const SAMPLE_TRANSACTIONS_PROPS_LOADING = {
  transactions: [],
  wallets: SAMPLE_WALLETS_FOR_TRANSACTIONS,
  loading: true
}

// Sample data with no wallets (should show import wallet message)
export const SAMPLE_TRANSACTIONS_PROPS_NO_WALLETS = {
  transactions: [],
  wallets: [],
  loading: false
}

export default SAMPLE_TRANSACTIONS_PROPS
