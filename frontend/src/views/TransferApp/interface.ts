import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'

export interface IProviderFieldsWatch {
  providerId?: string
  content?: string
}

export interface IAddRecipientTransfer {
  recipients?: Partial<IRecipientForm>[]
  notes: string
  correspondingChartOfAccounts: IFormatOptionLabel
  time: ITimeTransfer
  files: any[]
}

export interface ITransferData {
  source: Partial<IFormatOptionLabel>
  formInfo: Partial<IAddRecipientTransfer>
  tokens: IFormatOptionLabel
}

export interface ITimeTransfer {
  value: string
  label: string
}

export enum ETypeToken {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  XSGD = 'XSGD',
  XIDR = 'XIDR',
  DAI = 'DAI'
}

export interface IEditAdditional {
  editNotes: string
  editCategory: IFormatOptionLabel
  files: string[]
}

export interface IRecipientForm {
  tokenId: string
  amount: string
  walletAddress: IFormatOptionLabel
  token: IFormatOptionLabel
  recipientId: string
}

export enum EKeyBoard {
  MINUS = '-',
  PLUS = '+',
  KEY_E = 'KeyE'
}

export interface IInputValue {
  index: number
  value: string
}
