export enum TransactionsAction {
  EXPORT = 'export',
  GENERATE_REPORT = 'generate_report'
}

export const ACTION_OPTIONS = [
  { value: TransactionsAction.GENERATE_REPORT, label: 'Generate Report' },
  { value: TransactionsAction.EXPORT, label: 'Export as...' }
]

export enum TransactionTableColumn {
  ACTIVITY = 'activity',
  DATE = 'date_time',
  TYPE = 'type',
  FROM_TO = 'from_to',
  IN = 'in',
  OUT = 'out',
  GAIN_LOSS = 'gain_loss',
  TAGS = 'tags',
  ACCOUNT = 'account'
}

enum TransactionTableColumnHeader {
  ACTIVITY = 'Activity',
  DATE = 'Date & Time',
  TYPE = 'Type',
  FROM_TO = 'From/To',
  IN = 'In',
  OUT = 'Out',
  GAIN_LOSS = 'Realised Gain/Loss',
  TAGS = 'Invoice',
  ACCOUNT = 'Account'
}
export enum TransactionTableColumnType {
  BASIC = 'Basic',
  ADVANCED = 'Advanced'
}

export const DEFAULT_TRANSACTION_TABLE_COLUMNS = {
  [TransactionTableColumn.DATE]: true,
  [TransactionTableColumn.TYPE]: true,
  [TransactionTableColumn.FROM_TO]: true,
  [TransactionTableColumn.IN]: true,
  [TransactionTableColumn.OUT]: true,
  [TransactionTableColumn.GAIN_LOSS]: true,
  [TransactionTableColumn.TAGS]: true,
  [TransactionTableColumn.ACCOUNT]: false
}

export const TRANSACTION_TABLE_COLUMNS_LIST = [
  {
    label: TransactionTableColumnHeader.ACTIVITY,
    value: TransactionTableColumn.ACTIVITY,
    isDefault: true,
    type: TransactionTableColumnType.BASIC,
    style: { paddingLeft: 16 }
  },
  {
    label: '',
    value: 'checkbox',
    isDefault: true,
    type: TransactionTableColumnType.BASIC,
    style: { padding: '12px 16px', width: 48 }
  },
  {
    label: TransactionTableColumnHeader.DATE,
    value: TransactionTableColumn.DATE,
    type: TransactionTableColumnType.BASIC,
    style: { minWidth: 80 }
  },
  {
    label: TransactionTableColumnHeader.TYPE,
    value: TransactionTableColumn.TYPE,
    type: TransactionTableColumnType.BASIC,
    style: { minWidth: 110 }
  },
  {
    label: TransactionTableColumnHeader.FROM_TO,
    value: TransactionTableColumn.FROM_TO,
    type: TransactionTableColumnType.BASIC
  },
  {
    label: TransactionTableColumnHeader.IN,
    value: TransactionTableColumn.IN,
    style: { minWidth: 120 },
    type: TransactionTableColumnType.BASIC
  },
  {
    label: TransactionTableColumnHeader.OUT,
    value: TransactionTableColumn.OUT,
    style: { minWidth: 120 },
    type: TransactionTableColumnType.BASIC
  },
  {
    label: TransactionTableColumnHeader.GAIN_LOSS,
    value: TransactionTableColumn.GAIN_LOSS,
    type: TransactionTableColumnType.ADVANCED
  },
  {
    label: TransactionTableColumnHeader.TAGS,
    value: TransactionTableColumn.TAGS,
    style: { minWidth: 120 },
    type: TransactionTableColumnType.BASIC,
    tooltip: 'Organise your Transactions with tags.'
  },
  {
    label: TransactionTableColumnHeader.ACCOUNT,
    value: TransactionTableColumn.ACCOUNT,
    type: TransactionTableColumnType.ADVANCED,
    style: { minWidth: 170 },
    tooltip: 'Recommended to be used by Accountants, typically for Journal Entries.'
  }
]

export interface ITagHandler {
  options: { value: string; label: string }[]
  onCreate: (tagName: string, txnId?: string | number, afterCreate?: (tag) => void) => void
  onDelete: (tag) => void
  onUpdate: (tag, name) => void
  onAttachAnnotation: (tag, txnId?: string | number) => void
  onDeleteAnnotation: (tag, txnId?: string | number) => void
}

export const TXN_FILTERS_STORAGE_KEY = 'txn-filters'
export const TXN_COLUMNS_STORAGE_KEY = 'txn-columns'
export const MAX_DISPLAY_TAGS = 3
export const LIMIT_TAGS_PER_TRANSACTION = 10
