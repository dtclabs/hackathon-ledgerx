// Sample data for DashboardBalance component
export const SAMPLE_BALANCE_DATA = {
  // Main balance values
  totalBalance: 2456789.5,
  totalBalanceForOrg: 2456789.5,

  // Balance per chain (in USD) - better distribution for percentage bar
  balancePerChain: {
    solana: 1000000.0, // ~40.7%
    bonk: 750000.0, // ~30.5%
    wif: 400000.0, // ~16.3%
    trump: 200000.0, // ~8.1%
    usdc: 106789.5 // ~4.4%
  },

  // Currency settings
  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },

  // Country settings
  countrySetting: {
    iso: 'US'
  },

  // Number of wallets
  numberOfWallets: 5,

  // Filter chains (empty array means all chains selected)
  filterChains: ['solana', 'bonk', 'wif', 'trump', 'usdc'],

  // Loading state
  loading: false
}

// Alternative sample data with different values
export const SAMPLE_BALANCE_DATA_VARIANT = {
  totalBalance: 125000.0,
  totalBalanceForOrg: 125000.0,

  balancePerChain: {
    solana: 75000.0,
    bonk: 15000.0,
    wif: 5000.0,
    trump: 5000.0,
    usdc: 5000.0
  },

  fiatCurrencySetting: {
    symbol: '€',
    code: 'EUR'
  },

  countrySetting: {
    iso: 'DE'
  },

  numberOfWallets: 3,
  filterChains: ['solana', 'bonk', 'wif', 'trump', 'usdc'],
  loading: false
}

// Sample data for empty state
export const SAMPLE_BALANCE_DATA_EMPTY = {
  totalBalance: 0,
  totalBalanceForOrg: 0,

  balancePerChain: {},

  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },

  countrySetting: {
    iso: 'US'
  },

  numberOfWallets: 0,
  filterChains: [],
  loading: false
}

// Sample data for loading state
export const SAMPLE_BALANCE_DATA_LOADING = {
  totalBalance: 0,
  totalBalanceForOrg: 0,

  balancePerChain: {},

  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },

  countrySetting: {
    iso: 'US'
  },

  numberOfWallets: 0,
  filterChains: [],
  loading: true
}

// Sample data with high values (for testing large numbers)
export const SAMPLE_BALANCE_DATA_LARGE = {
  totalBalance: 12500000.75,
  totalBalanceForOrg: 12500000.75,

  balancePerChain: {
    ethereum: 8000000.0,
    polygon: 2500000.5,
    arbitrum_one: 1500000.25,
    optimism: 500000.0
  },

  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },

  countrySetting: {
    iso: 'US'
  },

  numberOfWallets: 15,
  filterChains: [],
  loading: false
}

// Sample data with filtered chains
export const SAMPLE_BALANCE_DATA_FILTERED = {
  totalBalance: 950000.0, // Only solana + bonk + wif + trump + usdc
  totalBalanceForOrg: 2456789.5, // Total across all chains

  balancePerChain: {
    solana: 1250000.25,
    bonk: 650000.0,
    wif: 350000.75,
    trump: 200000.0,
    usdc: 6789.5
  },

  fiatCurrencySetting: {
    symbol: '$',
    code: 'USD'
  },

  countrySetting: {
    iso: 'US'
  },

  numberOfWallets: 8,
  filterChains: ['solana', 'bonk', 'wif', 'trump', 'usdc'], // Only these chains are active
  loading: false
}

// Sample data for different currency
export const SAMPLE_BALANCE_DATA_GBP = {
  totalBalance: 1987654.32,
  totalBalanceForOrg: 1987654.32,

  balancePerChain: {
    ethereum: 1000000.0,
    polygon: 500000.0,
    arbitrum_one: 300000.0,
    optimism: 150000.0,
    bsc: 87654.32,
    gnosis_chain: 50000.0
  },

  fiatCurrencySetting: {
    symbol: '£',
    code: 'GBP'
  },

  countrySetting: {
    iso: 'GB'
  },

  numberOfWallets: 6,
  filterChains: [],
  loading: false
}

// Export default sample data
export default SAMPLE_BALANCE_DATA
