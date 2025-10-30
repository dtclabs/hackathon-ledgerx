// Sample data for DashboardWallets component
export const SAMPLE_WALLETS_DATA = [
  {
    id: '1',
    name: 'Main Treasury Wallet',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    total: 1250000.5,
    type: 'eth',
    supportedBlockchains: ['solana', 'bonk', 'wif', 'trump', 'usdc'],
    perChainBalance: [
      { blockchainId: 'solana', total: 750000.25 },
      { blockchainId: 'bonk', total: 300000.0 },
      { blockchainId: 'wif', total: 200000.25 },
      { blockchainId: 'trump', total: 100000.0 },
      { blockchainId: 'usdc', total: 25000.0 }
    ],
    distribution: 51.0
  },
  {
    id: '2',
    name: 'Operations Wallet',
    address: '0x8ba1f109551bD432803012645Hac136c4c8c8c8c',
    total: 450000.75,
    type: 'eth',
    supportedBlockchains: ['wif', 'trump', 'usdc'],
    perChainBalance: [
      { blockchainId: 'wif', total: 150000.25 },
      { blockchainId: 'trump', total: 150000.25 },
      { blockchainId: 'usdc', total: 150000.25 }
    ],
    distribution: 18.3
  },
  {
    id: '3',
    name: 'DeFi Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    total: 275000.0,
    type: 'eth',
    supportedBlockchains: ['trump', 'usdc'],
    perChainBalance: [
      { blockchainId: 'trump', total: 25000.0 },
      { blockchainId: 'usdc', total: 25000.0 }
    ],
    distribution: 11.2
  },
  {
    id: '4',
    name: 'Staking Wallet',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    total: 180000.25,
    type: 'gnosis',
    supportedBlockchains: ['trump', 'usdc'],
    perChainBalance: [
      { blockchainId: 'trump', total: 120000.0 },
      { blockchainId: 'usdc', total: 60000.25 }
    ],
    distribution: 7.3
  },
  {
    id: '5',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['trump'],
    perChainBalance: [{ blockchainId: 'trump', total: 95000.5 }],
    distribution: 3.9
  },
  {
    id: '6',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['usdc'],
    perChainBalance: [{ blockchainId: 'usdc', total: 95000.5 }],
    distribution: 3.9
  },
  {
    id: '7',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['usdc'],
    perChainBalance: [{ blockchainId: 'usdc', total: 95000.5 }],
    distribution: 3.9
  },
  {
    id: '8',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['usdc'],
    perChainBalance: [{ blockchainId: 'usdc', total: 95000.5 }],
    distribution: 3.9
  },
  {
    id: '9',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['usdc'],
    perChainBalance: [{ blockchainId: 'usdc', total: 95000.5 }],
    distribution: 3.9
  },
  {
    id: '10',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['usdc'],
    perChainBalance: [{ blockchainId: 'usdc', total: 95000.5 }],
    distribution: 3.9
  },
  {
    id: '11',
    name: 'Reserve Wallet',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    total: 95000.5,
    type: 'eth',
    supportedBlockchains: ['trump'],
    perChainBalance: [{ blockchainId: 'trump', total: 95000.5 }],
    distribution: 3.9
  }
]

export const SAMPLE_CHAINS_DATA = [
  {
    id: 'bonk',
    name: 'Bonk',
    imageUrl: '/svg/sample-token/Bonk.svg',
    color: '#627EEA'
  },
  {
    id: 'solana',
    name: 'Solana',
    imageUrl: '/svg/sample-token/Solana.svg',
    color: '#8247E5'
  },
  {
    id: 'wif',
    name: 'WIF',
    imageUrl: '/svg/sample-token/Wif.svg',
    color: '#28A0F0'
  },
  {
    id: 'trump',
    name: 'Trump',
    imageUrl: '/svg/sample-token/Trump.svg',
    color: '#FF0420'
  },
  {
    id: 'usdc',
    name: 'USDC',
    imageUrl: '/svg/sample-token/Usdc.svg',
    color: '#F3BA2F'
  }
]

export const SAMPLE_WALLETS_PROPS = {
  // wallets: SAMPLE_WALLETS_DATA,
  wallets: [],

  chains: SAMPLE_CHAINS_DATA,
  loading: false,
  isWalletsLoading: false,
  isWalletSyncing: false,
  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },
  countrySetting: {
    iso: 'US'
  },
  filterChains: []
}

// Alternative sample data with different values
export const SAMPLE_WALLETS_DATA_VARIANT = [
  {
    id: '1',
    name: 'Company Treasury',
    address: '0x1111111111111111111111111111111111111111',
    total: 500000.0,
    type: 'gnosis',
    supportedBlockchains: ['trump', 'usdc'],
    perChainBalance: [
      { blockchainId: 'trump', total: 300000.0 },
      { blockchainId: 'usdc', total: 200000.0 }
    ],
    distribution: 65.0
  },
  {
    id: '2',
    name: 'Marketing Wallet',
    address: '0x2222222222222222222222222222222222222222',
    total: 150000.0,
    type: 'eth',
    supportedBlockchains: ['trump'],
    perChainBalance: [{ blockchainId: 'trump', total: 150000.0 }],
    distribution: 19.5
  },
  {
    id: '3',
    name: 'Development Fund',
    address: '0x3333333333333333333333333333333333333333',
    total: 120000.0,
    type: 'eth',
    supportedBlockchains: ['trump', 'usdc'],
    perChainBalance: [
      { blockchainId: 'trump', total: 80000.0 },
      { blockchainId: 'usdc', total: 40000.0 }
    ],
    distribution: 15.5
  }
]

export const SAMPLE_WALLETS_PROPS_VARIANT = {
  wallets: SAMPLE_WALLETS_DATA_VARIANT,
  chains: SAMPLE_CHAINS_DATA,
  loading: false,
  isWalletsLoading: false,
  isWalletSyncing: false,
  fiatCurrencySetting: {
    symbol: '€',
    code: 'EUR'
  },
  countrySetting: {
    iso: 'DE'
  },
  filterChains: ['trump', 'usdc']
}

// Empty state sample data
export const SAMPLE_WALLETS_PROPS_EMPTY = {
  wallets: [],
  chains: SAMPLE_CHAINS_DATA,
  loading: false,
  isWalletsLoading: false,
  isWalletSyncing: false,
  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },
  countrySetting: {
    iso: 'US'
  },
  filterChains: []
}

// Loading state sample data
export const SAMPLE_WALLETS_PROPS_LOADING = {
  wallets: [],
  chains: SAMPLE_CHAINS_DATA,
  loading: true,
  isWalletsLoading: true,
  isWalletSyncing: false,
  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },
  countrySetting: {
    iso: 'US'
  },
  filterChains: []
}

export const SAMPLE_SUPPORTED_CHAINS = [
  { id: 'solana', name: 'Solana', imageUrl: '/svg/sample-token/Solana.svg' },
  { id: 'bonk', name: 'Bonk', imageUrl: '/svg/sample-token/Bonk.svg' },
  { id: 'wif', name: 'WIF', imageUrl: '/svg/sample-token/Wif.svg' },
  { id: 'trump', name: 'Trump', imageUrl: '/svg/sample-token/Trump.svg' },
  { id: 'usdc', name: 'USDC', imageUrl: '/svg/sample-token/Usdc.svg' }
]

export default SAMPLE_WALLETS_PROPS
