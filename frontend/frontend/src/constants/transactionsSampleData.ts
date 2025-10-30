// Sample transactions data for Transactions V2 table (mocked)
// Matches the shape consumed by TxGridTableRow

export const transactionsSampleData = [
  {
    id: 'tx_001',
    financialTransactionParent: {
      activity: 'transfer',
      hash: '0xparenthash001',
      exportStatus: 'exported',
      invoices: []
    },
    hash: '0xhash001',
    blockchainId: 1,
    valueTimestamp: '2025-09-15T10:32:00.000Z',
    fiatCurrency: 'usd',
    type: 'transfer',
    direction: 'incoming',
    toAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
    gainLoss: '1245.56',
    fromAddress: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    fiatAmount: '1245.56',
    correspondingChartOfAccount: { id: 'coa_income_1', name: 'Income: Sales', status: 'active', type: 'income' },
    isCorrespondingChartOfAccountChangeable: true,
    category: { id: 'cat_income', name: 'Revenue', type: 'income' },
    status: 'confirmed',
    cryptocurrencyAmount: '0.75',
    fromContact: { name: 'Treasury Wallet', type: 'wallet' },
    toContact: { name: 'Main Ops Wallet', type: 'wallet' },
    cryptocurrency: {
      addresses: [{ blockchainId: 1, decimal: 18 }],
      symbol: 'SOL',
      image: { small: '/svg/sample-token/Solana.svg' }
    },
    typeDetail: { value: 'native_transfer', label: 'Native Transfer' },
    proxyAddress: '',
    annotations: [
      { id: 'tag_1', name: 'Payroll' },
      { id: 'tag_2', name: 'Q3' }
    ]
  },
  {
    id: 'tx_002',
    financialTransactionParent: {
      activity: 'swap',
      hash: '0xparenthash002',
      exportStatus: 'failed',
      invoices: []
    },
    hash: '0xhash002',
    blockchainId: 137,
    valueTimestamp: '2025-09-16T14:05:30.000Z',
    fiatCurrency: 'usd',
    type: 'swap',
    direction: 'outgoing',
    toAddress: '0x1111111254fb6c44bac0bed2854e76f90643097d',
    gainLoss: '-210.12',
    fromAddress: '0x38c5d1d9d8b9a4f9b7f9f1b9a4f9d8b9f7f1d8b9',
    fiatAmount: '210.12',
    correspondingChartOfAccount: {
      id: 'coa_expense_1',
      name: 'Expense: Trading Fees',
      status: 'active',
      type: 'expense'
    },
    isCorrespondingChartOfAccountChangeable: true,
    category: { id: 'cat_fees', name: 'Fees', type: 'expense' },
    status: 'confirmed',
    cryptocurrencyAmount: '250.5',
    fromContact: { name: 'DEX Aggregator', type: 'contact' },
    toContact: { name: '1inch Router', type: 'contact' },
    cryptocurrency: {
      addresses: [{ blockchainId: 137, decimal: 6 }],
      symbol: 'USDC',
      image: { small: '/svg/sample-token/Usdc.svg' }
    },
    typeDetail: { value: 'erc20_swap', label: 'Token Swap' },
    proxyAddress: '',
    annotations: [{ id: 'tag_3', name: 'Ops' }]
  },
  {
    id: 'tx_003',
    financialTransactionParent: {
      activity: 'bridge',
      hash: '0xparenthash003',
      exportStatus: 'none',
      invoices: []
    },
    hash: '0xhash003',
    blockchainId: 10,
    valueTimestamp: '2025-09-17T08:45:10.000Z',
    fiatCurrency: 'usd',
    type: 'bridge',
    direction: 'outgoing',
    toAddress: '0x4200000000000000000000000000000000000006',
    gainLoss: '0',
    fromAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    fiatAmount: '980.00',
    correspondingChartOfAccount: null,
    isCorrespondingChartOfAccountChangeable: false,
    category: { id: 'cat_unclassified', name: 'Uncategorized', type: 'other' },
    status: 'syncing',
    cryptocurrencyAmount: '1.2345',
    fromContact: { name: '', type: 'wallet' },
    toContact: { name: 'Optimism Gateway', type: 'contact' },
    cryptocurrency: {
      addresses: [{ blockchainId: 10, decimal: 18 }],
      symbol: 'WIF',
      image: { small: '/svg/sample-token/Wif.svg' }
    },
    typeDetail: { value: 'l1_to_l2_bridge', label: 'Bridge' },
    proxyAddress: '',
    annotations: []
  },
  {
    id: 'tx_004',
    financialTransactionParent: {
      activity: 'transfer',
      hash: '0xparenthash004',
      exportStatus: 'none',
      invoices: [{ id: 'req_1' }]
    },
    hash: '0xhash004',
    blockchainId: 8453,
    valueTimestamp: '2025-09-18T12:00:00.000Z',
    fiatCurrency: 'usd',
    type: 'transfer',
    direction: 'outgoing',
    toAddress: '0x5a52e96bacdabb82fd05763e25335261b270efcb',
    gainLoss: '-50.00',
    fromAddress: '0x7c195b862b1e5b9b7f4f2f4b9b7f1e5a9d8b7c1f',
    fiatAmount: '50.00',
    correspondingChartOfAccount: {
      id: 'coa_expense_2',
      name: 'Expense: Subscriptions',
      status: 'active',
      type: 'expense'
    },
    isCorrespondingChartOfAccountChangeable: true,
    category: { id: 'cat_saas', name: 'SaaS', type: 'expense' },
    status: 'confirmed',
    cryptocurrencyAmount: '10',
    fromContact: { name: 'HQ Ops', type: 'wallet' },
    toContact: { name: 'Vendor LLC', type: 'contact' },
    cryptocurrency: {
      addresses: [{ blockchainId: 8453, decimal: 18 }],
      symbol: 'BONK',
      image: { small: '/svg/sample-token/Bonk.svg' }
    },
    typeDetail: { value: 'erc20_transfer', label: 'Token Transfer' },
    proxyAddress: '',
    annotations: [{ id: 'tag_4', name: 'SaaS' }]
  },
  {
    id: 'tx_005',
    financialTransactionParent: {
      activity: 'transfer',
      hash: '0xparenthash005',
      exportStatus: 'exported',
      invoices: []
    },
    hash: '0xhash005',
    blockchainId: 42161,
    valueTimestamp: '2025-09-19T18:20:45.000Z',
    fiatCurrency: 'usd',
    type: 'transfer',
    direction: 'incoming',
    toAddress: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
    gainLoss: '0',
    fromAddress: '0x28c6c06298d514db089934071355e5743bf21d60',
    fiatAmount: '3000.00',
    correspondingChartOfAccount: null,
    isCorrespondingChartOfAccountChangeable: false,
    category: { id: 'cat_airdrop', name: 'Airdrop', type: 'income' },
    status: 'confirmed',
    cryptocurrencyAmount: '1500',
    fromContact: { name: 'Airdrop Distributor', type: 'contact' },
    toContact: { name: 'Main Ops Wallet', type: 'wallet' },
    cryptocurrency: {
      addresses: [{ blockchainId: 42161, decimal: 18 }],
      symbol: 'TRUMP',
      image: { small: '/svg/sample-token/Trump.svg' }
    },
    typeDetail: { value: 'erc20_airdrop', label: 'Airdrop' },
    proxyAddress: '',
    annotations: []
  }
]

export default transactionsSampleData
