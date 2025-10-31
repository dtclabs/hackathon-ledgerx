export interface ITransactionForm {
  description: string
  comment: string
  recipients: { address: string; amount: string; tokenAddress: string; decimal: number; id: string; remark: string }[]
  isExpanded: boolean
}

export enum ETransactionStatus {
  SIGNING = 'signing',
  EXECUTING = 'executing',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  DONE = 'done'
}

export interface IMetamaskTransaction {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
  isExpanded: boolean
  functionName?: string
  dataDecoded?: {
    method?: string
    inputs?: any[]
  }
  totalPastPriceUSD?: number
  totalCurrentPriceUSD?: number
  totalAmount?: number
  tokenAddress?: string
  symbol?: string
}
