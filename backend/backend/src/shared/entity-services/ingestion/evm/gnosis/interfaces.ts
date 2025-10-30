export interface GnosisCustomLogCreateParams {
  contractAddress: string
  blockNumber: number
  blockTimestamp: string
  transactionHash: string
  logIndex: number
  topic0: string
  topic1: string
  topic2: string
  topic3: string
  data: string
  initiatorAddress: string
  fromAddress: string
  toAddress: string
  value: string
}

const affirmationCompletedLogDataAbi = [
  {
    indexed: false,
    name: 'recipient',
    type: 'address'
  },
  {
    indexed: false,
    name: 'value',
    type: 'uint256'
  },
  {
    indexed: false,
    name: 'transactionHash',
    type: 'bytes32'
  }
]

const addedReceiverLogConfiguration = {
  contractAddress: '0x481c034c6d9441db23ea48de68bcae812c5d39ba',
  topic0: '0x3c798bbcf33115b42c728b8504cff11dd58736e9fa789f1cda2738db7d696b2a',
  topic2: '0x7301cfa0e1756b71869e93d4e4dca5c7d0eb0aa6' // xdai bridge contract address,
}

const affirmationCompletedLogConfiguration = {
  contractAddress: '0x7301cfa0e1756b71869e93d4e4dca5c7d0eb0aa6',
  topic0: '0x6fc115a803b8703117d9a3956c5a15401cb42401f91630f015eb6b043fa76253'
}

export const gnosisCustomLogConfiguration = {
  affirmationCompletedLogDataAbi,
  addedReceiverLogConfiguration,
  affirmationCompletedLogConfiguration
}
