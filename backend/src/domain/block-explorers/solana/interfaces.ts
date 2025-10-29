export interface SolanaTokenBalance {
  mint: string
  amount: string
  decimals: number
  uiAmount: number | null
  uiAmountString: string
}

export interface SolanaAccountInfo {
  executable: boolean
  lamports: number
  owner: string
  rentEpoch: number
  data: any
}

export interface SolanaTransactionMeta {
  err: any
  fee: number
  innerInstructions: any[]
  logMessages: string[]
  postBalances: number[]
  postTokenBalances: SolanaTokenBalance[]
  preBalances: number[]
  preTokenBalances: SolanaTokenBalance[]
  rewards: any[]
  status: { Ok: null } | { Err: any }
}

export interface SolanaTransactionInstruction {
  accounts: string[]
  data: string
  programId: string
}

export interface SolanaTransaction {
  message: {
    accountKeys: Array<{ pubkey: string; signer: boolean; writable: boolean }>
    instructions: SolanaTransactionInstruction[]
    recentBlockhash: string
  }
  signatures: string[]
}

export interface SolanaTransactionDetail {
  signature: string
  slot: number
  blockTime: number | null
  meta: SolanaTransactionMeta | null
  transaction: SolanaTransaction
}

export interface SolanaSignatureStatus {
  slot: number
  confirmations: number | null
  err: any
  confirmationStatus: 'processed' | 'confirmed' | 'finalized'
}

export interface SolanaTokenAccount {
  account: {
    data: {
      parsed: {
        info: {
          isNative: boolean
          mint: string
          owner: string
          state: string
          tokenAmount: {
            amount: string
            decimals: number
            uiAmount: number
            uiAmountString: string
          }
        }
        type: string
      }
      program: string
      space: number
    }
    executable: boolean
    lamports: number
    owner: string
    rentEpoch: number
  }
  pubkey: string
}

export interface SolanaProgramAccount {
  account: SolanaAccountInfo
  pubkey: string
}

export interface SolanaRpcResponse<T> {
  jsonrpc: string
  id: number
  result: T
}

export interface SolanaBlockProduction {
  byIdentity: Record<string, [number, number]>
  range: {
    firstSlot: number
    lastSlot: number
  }
}

export interface SolanaBlockCommitment {
  commitment: number[] | null
  totalStake: number
}

export interface SolanaEpochInfo {
  absoluteSlot: number
  blockHeight: number
  epoch: number
  slotIndex: number
  slotsInEpoch: number
  transactionCount: number
}

export interface SolanaInflationGovernor {
  foundation: number
  foundationTerm: number
  initial: number
  taper: number
  terminal: number
}

export interface SolanaInflationRate {
  epoch: number
  foundation: number
  total: number
  validator: number
}

export interface SolanaPerformanceSample {
  numSlots: number
  numTransactions: number
  samplePeriodSecs: number
  slot: number
}

export interface SolanaSupply {
  circulating: number
  nonCirculating: number
  nonCirculatingAccounts: string[]
  total: number
}

export interface SolanaVersionInfo {
  'solana-core': string
  'feature-set': number
}

export interface SolanaVoteAccount {
  commission: number
  epochVoteAccount: boolean
  epochCredits: Array<[number, number, number]>
  nodePubkey: string
  lastVote: number
  activatedStake: number
  votePubkey: string
}

export interface SolanaClusterNode {
  pubkey: string
  gossip: string | null
  tpu: string | null
  rpc: string | null
  version: string | null
  featureSet: number | null
  shredVersion: number | null
}