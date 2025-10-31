export interface IDeleteSourceModal {
  type?: 'success' | 'error' | 'normal' | 'custom'
  setShowModal?: (showModal: boolean) => void
  showModal: boolean
  onClose?: () => void
  onAccept?: any
  title?: string
  description?: string
  declineText?: string
  acceptText?: string
  option?: boolean
  onModalClose?: () => void
  close?: boolean
  isLoading?: boolean
  disableEscPress?: boolean
  walletSource?: any
  memberData?: any
}
