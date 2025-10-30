export const csvHeaders = [
  { label: 'Date', key: 'date' },
  { label: 'Time', key: 'time' },

  { label: 'Txn Hash (Link)', key: 'hash' },
  { label: 'Status (Incoming / Outgoing / Pending)', key: 'tab' },

  { label: 'Token Amount', key: 'amount' },
  { label: 'Token Name', key: 'token' },
  { label: 'USD Value at Txn', key: 'value' },
  { label: 'USD Value Spot (Current price)', key: 'currentPrice' },

  { label: 'Txn fee (in ETH)', key: 'feeValueETH' },

  { label: 'Txn fee USD Value at Txn date', key: 'feeUSDValue' },
  { label: 'Txn fee value spot (Current price)', key: 'feeValueCurrentPrice' },

  // { label: 'Total USD Value at txn [G - I]', key: 'totalUSDtxn' },
  // { label: 'Total USD value Spot [H - J]', key: 'totalUSDspot' },

  { label: 'Payee (To) [Full wallet]', key: 'toPayee' },
  { label: 'Payee (To) [Saved name if any]', key: 'nameToPayee' },
  { label: 'Source of Funds (From) [Full wallet]', key: 'fromPayee' },
  { label: 'Source of Funds (From) [Saved name if any]', key: 'nameFromPayee' },
  { label: 'Signers of the Txn', key: 'signers' },

  { label: 'Category', key: 'category' },
  { label: 'Status (Approved / On-Chain Rejection)', key: 'status' },
  { label: 'Notes (if any)', key: 'note' }
]
