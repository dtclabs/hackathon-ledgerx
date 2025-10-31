export interface IFlagWalletModal {
  setShowFlagWalletModal?: (showFlagWalletModal: boolean) => void
  showFlagWalletModal: boolean
  onFlagWalletModalClose?: () => void
  onClose?: () => void
  onAccept?: any
  optionDisable?: boolean
  disableEscPress?: boolean
  title?: string
  walletSource?: any
  description?: string
  type?: 'success' | 'error' | 'normal' | 'custom'
  setDisable?: (data: boolean) => void
  memberData?: any
}
