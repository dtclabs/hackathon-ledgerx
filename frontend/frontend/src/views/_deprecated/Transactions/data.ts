import { ETransactionType } from '@/slice/old-tx/interface'

export const transactionsTabs = [
  {
    key: ETransactionType.ALL,
    name: 'History',
    active: true
  },
  {
    key: ETransactionType.INCOMING,
    name: 'Incoming',
    active: false
  },
  {
    key: ETransactionType.OUTGOING,
    name: 'Outgoing',
    active: false
  },
  {
    key: ETransactionType.QUEUE,
    name: 'Pending',
    active: false
  }
  // {
  //   key: ETransactionType.DRAFT,
  //   name: 'Drafts',
  //   active: false
  // }
]

export const transactionHistoryTabs = [
  {
    key: 'Outgoing',
    name: 'Outgoing',
    active: true
  },
  {
    key: 'Incoming',
    name: 'Incoming',
    active: false
  }
]

export const transactionDetailOutgoingTabs = [
  {
    key: 'Overview',
    name: 'Overview'
  },
  {
    key: 'Recipients',
    name: 'Recipients'
  },
  {
    key: 'Signers',
    name: 'Signers'
  }
]

export const transactionDetailIncomingTabs = [
  {
    key: 'Overview',
    name: 'Overview'
  },
  {
    key: 'Signers',
    name: 'Signers'
  }
]

export const dataOutgoing = [
  {
    blockHash: '0xe731c1bb333943244553101855f10488e144d9b7e96c9c48f6a7e84a2d6463c5',
    blockNumber: '11267979',
    confirmations: '13946',
    contractAddress: '',
    cumulativeGasUsed: '2980689',
    dataDecoded: {
      inputs: [
        ['48B267478768D0ebB8a4a52fCEaad3b4E7841F07'],
        [{ BigNumber: { _hex: '0x071afd498d0000', _isBigNumber: true } }],
        [
          {
            address: '48B267478768D0ebB8a4a52fCEaad3b4E7841F07',
            currentPrice: 0.002,
            pastPrice: 3.3941539439272885,
            totalAmount: 0.002
          }
        ]
      ],
      method: 'disperseEther',
      names: ['recipients', 'values'],
      types: ['address[]', 'uint256[]']
    },

    from: '0x72934f8c57b58a236aa17d057f0ed47ea4b4732e',
    functionName: 'disperseEther(address[] recipients, uint256[] values)',
    gas: '34315',
    gasPrice: '1500000010',
    gasUsed: '32276',
    hash: '0xc44015acbcb1b2abef744310ba0dae8dcc13e2f31d51016674e602dd2501f284',
    input: '0xe63d38ed000000000000000000000000',
    methodId: '0xe63d38ed',
    nonce: '4',
    symbol: 'ETH',
    timeStamp: '1661485783',
    to: '0xd152f549545093347a162dce210e7293f1452150',
    tokenAddress: '',
    totalAmount: 0.002,
    totalCurrentPriceUSD: 2.94874,
    totalPastPriceUSD: 3.3941539439272885,
    transactionIndex: '23',
    txreceipt_status: '1',
    value: '2000000000000000'
  }
]

export const dataTransactionHistory = [
  {
    id: '13946',
    method: 'Part of Bulk Transfer',
    time: '13 Jun 2022, 05:37 PM',
    amount: '86.837618950948273459',
    price: '86.84',
    status: '2/2 Confirmed',
    subStatus: 'On Schedule',
    category: 'Payroll',
    blockHash: '0xe731c1bb333943244553101855f10488e144d9b7e96c9c48f6a7e84a2d6463c5',
    blockNumber: '11267979',
    confirmations: '13946',
    contractAddress: '',
    cumulativeGasUsed: '2980689',
    dataDecoded: {
      inputs: [
        ['48B267478768D0ebB8a4a52fCEaad3b4E7841F07'],
        [{ BigNumber: { _hex: '0x071afd498d0000', _isBigNumber: true } }],
        [
          {
            address: '48B267478768D0ebB8a4a52fCEaad3b4E7841F07',
            currentPrice: 0.002,
            pastPrice: 3.3941539439272885,
            totalAmount: 0.002
          }
        ]
      ],
      method: 'disperseEther',
      names: ['recipients', 'values'],
      types: ['address[]', 'uint256[]']
    },

    from: '0x72934f8c57b58a236aa17d057f0ed47ea4b4732e',
    functionName: 'disperseEther(address[] recipients, uint256[] values)',
    gas: '34315',
    gasPrice: '1500000010',
    gasUsed: '32276',
    hash: '0xefg015acbcb1b2abef744310ba0dae8dcc13e2f31d51016674e602dd2501f284',
    input: '0xe63d38ed000000000000000000000000',
    methodId: '0xe63d38ed',
    nonce: '4',
    symbol: 'ETH',
    timeStamp: '1661485783',
    to: '0xd152f549545093347a162dce210e7293f1452150',
    tokenAddress: '',
    totalAmount: 0.002,
    totalCurrentPriceUSD: 2.94874,
    totalPastPriceUSD: 3.3941539439272885,
    transactionIndex: '23',
    txreceipt_status: '1',
    value: '2000000000000000'
  },
  {
    id: '13946',
    method: 'Single Transfer',
    time: '13 Jun 2022, 05:37 PM',
    amount: '86.837618950948273459',
    price: '86.84',
    status: '2/2 Rejected',
    subStatus: 'Awaiting Approval',
    category: 'Reimbursements',
    blockHash: '0xe731c1bb333943244553101855f10488e144d9b7e96c9c48f6a7e84a2d6463c5',
    blockNumber: '11267979',
    confirmations: '13946',
    contractAddress: '',
    cumulativeGasUsed: '2980689',
    dataDecoded: {
      inputs: [
        ['48B267478768D0ebB8a4a52fCEaad3b4E7841F07'],
        [{ BigNumber: { _hex: '0x071afd498d0000', _isBigNumber: true } }],
        [
          {
            address: '48B267478768D0ebB8a4a52fCEaad3b4E7841F07',
            currentPrice: 0.002,
            pastPrice: 3.3941539439272885,
            totalAmount: 0.002
          }
        ]
      ],
      method: 'disperseEther',
      names: ['recipients', 'values'],
      types: ['address[]', 'uint256[]']
    },

    from: '0x72934f8c57b58a236aa17d057f0ed47ea4b4732e',
    functionName: 'disperseEther(address[] recipients, uint256[] values)',
    gas: '34315',
    gasPrice: '1500000010',
    gasUsed: '32276',
    hash: '0xc44015acbcb1b2abef744310ba0dae8dcc13e2f31d51016674e602dd2501f284',
    input: '0xe63d38ed000000000000000000000000',
    methodId: '0xe63d38ed',
    nonce: '4',
    symbol: 'ETH',
    timeStamp: '1661485783',
    to: '0xd152f549545093347a162dce210e7293f1452150',
    tokenAddress: '',
    totalAmount: 0.002,
    totalCurrentPriceUSD: 2.94874,
    totalPastPriceUSD: 3.3941539439272885,
    transactionIndex: '23',
    txreceipt_status: '1',
    value: '2000000000000000'
  }
]
export const dataListQueue = [
  {
    id: '13946',
    method: 'Part of Bulk Transfer',
    time: '13 Jun 2022, 05:37 PM',
    amount: '86.837618950948273459',
    price: '86.84',
    status: '2/2 Confirmed',
    subStatus: 'On Schedule',
    category: 'Payroll',
    blockHash: '0xa631c1bb333943244553101855f10488e144d9b7e96c9c48f6a7e84a2d6463c5',
    blockNumber: '11267979',
    confirmations: '13946',
    contractAddress: '',
    cumulativeGasUsed: '2980689',
    dataDecoded: {
      inputs: [
        ['48B267478768D0ebB8a4a52fCEaad3b4E7841F07'],
        [{ BigNumber: { _hex: '0x071afd498d0000', _isBigNumber: true } }],
        [
          {
            address: '48B267478768D0ebB8a4a52fCEaad3b4E7841F07',
            currentPrice: 0.002,
            pastPrice: 3.3941539439272885,
            totalAmount: 0.002
          }
        ]
      ],
      method: 'disperseEther',
      names: ['recipients', 'values'],
      types: ['address[]', 'uint256[]']
    },

    from: '0xa4934f8c57b58a236aa17d057f0ed47ea4b4732e',
    functionName: 'disperseEther(address[] recipients, uint256[] values)',
    gas: '34315',
    gasPrice: '1500000010',
    gasUsed: '32276',
    hash: '0xad41015acbcb1b2abef744310ba0dae8dcc13e2f31d51016674e602dd2501f284',
    input: '0xe63d38ed000000000000000000000000',
    methodId: '0xe63d38ed',
    nonce: '4',
    symbol: 'ETH',
    timeStamp: '1661485783',
    to: '0xd152f549545093347a162dce210e7293f1452150',
    tokenAddress: '',
    totalAmount: 0.002,
    totalCurrentPriceUSD: 2.94874,
    totalPastPriceUSD: 3.3941539439272885,
    transactionIndex: '23',
    txreceipt_status: '1',
    value: '2000000000000000'
  },
  {
    id: '13946',
    method: 'Single Transfer',
    time: '13 Jun 2022, 05:37 PM',
    amount: '86.837618950948273459',
    price: '86.84',
    status: '1/2 Pending',
    subStatus: 'Awaiting Approval',
    category: 'Reimbursements',
    blockHash: '0xe731c1bb333943244553101855f10488e144d9b7e96c9c48f6a7e84a2d6463c5',
    blockNumber: '11267979',
    confirmations: '13946',
    contractAddress: '',
    cumulativeGasUsed: '2980689',
    dataDecoded: {
      inputs: [
        ['48B267478768D0ebB8a4a52fCEaad3b4E7841F07'],
        [{ BigNumber: { _hex: '0x071afd498d0000', _isBigNumber: true } }],
        [
          {
            address: '48B267478768D0ebB8a4a52fCEaad3b4E7841F07',
            currentPrice: 0.002,
            pastPrice: 3.3941539439272885,
            totalAmount: 0.002
          }
        ]
      ],
      method: 'disperseEther',
      names: ['recipients', 'values'],
      types: ['address[]', 'uint256[]']
    },

    from: '0xc5934f8c57b58a236aa17d057f0ed47ea4b4732e',
    functionName: 'disperseEther(address[] recipients, uint256[] values)',
    gas: '34315',
    gasPrice: '1500000010',
    gasUsed: '32276',
    hash: '0xk784015acbcb1b2abef744310ba0dae8dcc13e2f31d51016674e602dd2501f284',
    input: '0xe63d38ed000000000000000000000000',
    methodId: '0xe63d38ed',
    nonce: '4',
    symbol: 'ETH',
    timeStamp: '1661485783',
    to: '0xd152f549545093347a162dce210e7293f1452150',
    tokenAddress: '',
    totalAmount: 0.002,
    totalCurrentPriceUSD: 2.94874,
    totalPastPriceUSD: 3.3941539439272885,
    transactionIndex: '23',
    txreceipt_status: '1',
    value: '2000000000000000'
  }
]
