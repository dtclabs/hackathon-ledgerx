import { SupportedBlockchains } from '../entity-services/blockchains/interfaces'

export const SignMessage = 'Logging into LedgerX. This will give you access to all safes owned by this account.'

export const CoingeckoApiUrl = 'https://pro-api.coingecko.com/api/v3'

export enum PostgresErrorCode {
  UniqueViolation = '23505',
  CheckViolation = '23514',
  NotNullViolation = '23502',
  ForeignKeyViolation = '23503'
}

export const INVITATION_EXPIRED = 72 // hour

export const GnosisService = {
  [SupportedBlockchains.ETHEREUM_MAINNET]: 'https://safe-transaction-mainnet.safe.global/api',
  [SupportedBlockchains.GOERLI]: 'https://safe-transaction-goerli.safe.global/api',
  [SupportedBlockchains.POLYGON_MAINNET]: 'https://safe-transaction-polygon.safe.global/api',
  [SupportedBlockchains.BSC_MAINNET]: 'https://safe-transaction-bsc.safe.global/api',
  [SupportedBlockchains.ARBITRUM_ONE]: 'https://safe-transaction-arbitrum.safe.global/api',
  [SupportedBlockchains.SEPOLIA]: 'https://safe-transaction-sepolia.safe.global/api',
  [SupportedBlockchains.OPTIMISM]: 'https://safe-transaction-optimism.safe.global/api',
  [SupportedBlockchains.GNOSIS_CHAIN]: 'https://safe-transaction-gnosis-chain.safe.global/api',
  // Solana doesn't use Gnosis Safe, but we include placeholder URLs for consistency
  [SupportedBlockchains.SOLANA_MAINNET]: 'https://api.mainnet-beta.solana.com',
  [SupportedBlockchains.SOLANA_DEVNET]: 'https://api.devnet.solana.com'
}

// Previous hardcoded values as reference
// export const ETHEREUM_CHAIN_ID = 1
// export const GOERLI_CHAIN_ID = 5
// export const POLYGON_CHAIN_ID = 137
// export const BSC_CHAIN_ID = 56

// SOL: Prioritize Solana chains over EVM
// export const SupportedChains = ['ethereum', 'goerli', 'solana-mainnet', 'solana-devnet']
export const SupportedChains = ['solana', 'solana-devnet', 'ethereum', 'goerli']

// export const ChainIds = {
//   [ETHEREUM_CHAIN_ID]: 'ethereum',
//   [GOERLI_CHAIN_ID]: 'goerli',
//   [POLYGON_CHAIN_ID]: 'polygon'
//   // [BSC_CHAIN_ID]: 'bsc'
// }

export const SolanaRPCEndpoints = {
  [SupportedBlockchains.SOLANA_MAINNET]: 'https://api.mainnet-beta.solana.com',
  [SupportedBlockchains.SOLANA_DEVNET]: 'https://api.devnet.solana.com'
}

export const HeliusAPIEndpoints = {
  [SupportedBlockchains.SOLANA_MAINNET]: 'https://api.helius.xyz/v0',
  [SupportedBlockchains.SOLANA_DEVNET]: 'https://api-devnet.helius.xyz/v0'
}

// Environment variables needed for Solana integration:
// HELIUS_API_KEY=your_helius_api_key_here

export const ScanAPIs = {
  ethereum: 'https://api.etherscan.io/api',
  goerli: 'https://api-goerli.etherscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
  bsc: 'https://api.bscscan.com/api',
  'solana': 'https://api.mainnet-beta.solana.com',
  'solana-devnet': 'https://api.devnet.solana.com'
}

export const SupportedTokens: { [symbol: string]: { symbol: string; id: string; decimals: number } } = {
  ETH: { symbol: 'ETH', id: 'ethereum', decimals: 18 },
  MATIC: { symbol: 'MATIC', id: 'matic-network', decimals: 18 },
  USDC: { symbol: 'USDC', id: 'usd-coin', decimals: 6 },
  XSGD: { symbol: 'XSGD', id: 'xsgd', decimals: 6 },
  XIDR: { symbol: 'XIDR', id: 'straitsx-indonesia-rupiah', decimals: 6 },
  USDT: { symbol: 'USDT', id: 'tether', decimals: 6 },
  DAI: { symbol: 'DAI', id: 'dai', decimals: 18 },
  //https://github.com/BluejayFinance/assets/blob/main/blu-stables/svg/SGD.svg
  BLUSGD: { symbol: 'BLUSGD', id: 'singapore-dollar', decimals: 18 },
  // Solana native token
  SOL: { symbol: 'SOL', id: 'solana', decimals: 9 }
}

export const currencies = ['sgd', 'usd', 'idr', 'hkd', 'eur', 'aed', 'cny', 'inr', 'myr', 'cad', 'gbp', 'chf']
export const MAIN_FIAT_CURRENCY = 'usd'

export const DisperseABI = [
  {
    constant: false,
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    name: 'disperseTokenSimple',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    name: 'disperseToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    name: 'disperseEther',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  }
]

export const Erc20ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'uint8', name: 'decimals', type: 'uint8' }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    constant: true,
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' }
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

export const NULL_API_STRING = 'null'
export const NOT_NULL_API_STRING = 'not_null'

export const EXPONENTIAL_BACK_OFF_RETRY_IN_MS = {
  1: 10000,
  2: 60000,
  3: 300000,
  4: 1800000,
  5: 3600000,
  6: 10800000,
  7: 86400000
}
