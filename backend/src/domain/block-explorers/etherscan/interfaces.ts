import { FeeStats } from '../../../shared/entity-services/ingestion/evm/arbitrum/arbitrum-receipt.entity'

export interface EtherscanResponse<T> {
  status: '0' | '1'
  message: string
  result: T
}

export interface EtherscanLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  blockHash: string
  timeStamp: string
  gasPrice: string
  gasUsed: string
  logIndex: string
  transactionHash: string
  transactionIndex: string
}

export interface EtherscanTransactionStatus {
  isError: '0' | '1'
  errDescription: string
}

export interface EtherscanBlockReward {
  blockNumber: string
  timeStamp: number // 1472533979 unix timestamp
  blockMiner: string
  blockReward: string
  uncles: unknown[]
  uncleInclusionReward: string
}
export interface EtherscanBlockRewardForAddress {
  blockNumber: string
  timeStamp: string // 1472533979 unix timestamp
  blockReward: string
}

export interface EtherscanReceipt {
  blockHash: string // '0xab5e1999b545d49a46d4b03c53f4cf24052840c573647086d5a2226611c66681'
  blockNumber: string // '0xdf2d11'
  contractAddress: string
  cumulativeGasUsed: string //'0xaf0e55'
  effectiveGasPrice: string //'0xeac63179c'
  from: string //'0xfded90a3b1348425577688866f798f94d77a0d02'
  gasUsed: string //'0x216323'
  logs: EtherscanLog[]
  logsBloom: string //'0x0200100800008000008400....'
  status: '0x0' | '0x1' //'0x1'
  to: string //'0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2'
  transactionHash: string //'0xac6ee6c4b96d734902b3b900b9ea4c69eb97d196b3f81a17c63155f35a5e7aff'
  transactionIndex: string //'0x6e'
  type: string //'0x2'
  // Below is additional data from alchemy and not from etherscan
  feeStats?: FeeStats
}

export interface OptimismEtherscanReceipt extends EtherscanReceipt {
  l1Fee: string //"0x360779f1ce98",
  l1FeeScalar: string //"0.684",
  l1GasPrice: string //"0x827604cac",
  l1GasUsed: string //"0x9b0",
}

export interface EtherscanTransaction {
  blockHash: string //"0xc380733fedd8b15fb68bc04b34caadb26dc79b5b920164556d4c672db92792b7",
  blockNumber: string //"0x12badf2",
  from: string //"0x2433e15fd10476406c371ac86f1b6f200ba01b34",
  gas: string //"0x9470",
  gasPrice: string //"0x51f4d5c00",
  hash: string //"0x7fb7401e99b8a164df6667f8ec5042fc00cafa8213d31987aad8cf129c94e9ff",
  input: string //"0x",
  nonce: string //"0x1",
  to: string //"0xb2b1cfeee796605c747ca188c353c1fb50a04cfe",
  transactionIndex: string //"0x6d",
  value: string //"0x20637fa2058d62",
  type: string //"0x0",
  v: string //"0x136",
  r: string //"0x669e1d43aed07757cad963f50f434ea100a15249d69e52787706531d308a2905",
  s: string //"0x180aa678e4ca0a262ccc21320d0162feabb5afca79ee79f4039c2c0d36073860"
}

export interface EtherscanInternalTransaction {
  blockNumber: string //"14626065",
  timeStamp: string //"1650513476",
  hash: string //'0xc11af8c519e95d3e47dcb39ec76749660c1e9331183b592d61babe593c81bdb3'
  from: string //"0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2",
  to: string //"0x7f268357a8c2552623316e2562d90e642bb538e5",
  value: string //"200000000000000000",
  contractAddress: string //"",
  input: string //"",
  type: string //"call",
  gas: string //"666838",
  gasUsed: string // "146143",
  isError: '0' | '1' //"0",
  errCode: string //""
}

export interface EtherscanExternalTransaction {
  blockNumber: string //"25721937",
  timeStamp: string //"1646735338",
  hash: string //'0x8359505f99bc212af1b7ea8503774d97f3a39107cfb73247a766ba7739e77057'
  nonce: string //'1976'
  blockHash: string //'0x826c9fb2e72db6b014321c7a0dd9c189b8119f2d5300368f48c320c7060a0545'
  transactionIndex: string //'42'
  from: string //'0xb91dd8225db88de4e3cd7b7ec538677a2c1be8cb'
  to: string //'0x059916706411151fa633b592509e6e807b5c2fe6'
  value: string //'132939746769945250'
  gas: string //'21000'
  gasPrice: string //'31000000000'
  isError: '0' | '1' //'0'
  txreceipt_status: string //'1'
  input: string //'0x'
  contractAddress: string //''
  cumulativeGasUsed: string //'5752874'
  gasUsed: string //'21000'
  confirmations: string //'19059479'
  methodId: string //'0x'
  functionName: string //''
}
