import { IUpdateSource } from '@/slice/wallets/wallet-types'

export interface IEditSourceModal {
  setShowEditModal?: (showEditModal: boolean) => void
  showEditModal: boolean
  onEditModalClose?: () => void
  onClose?: () => void
  source?: any
  disableEscPress?: boolean
  title?: string
  type?: 'success' | 'error' | 'normal' | 'custom'
  close?: boolean
  address?: string
  token?: boolean
  description?: string
  editSource?: IUpdateSource
  isLoading?: boolean
  setIsLoading?: (data: boolean) => void
  setDisable?: (data: boolean) => void
  onAccept?: any
  option?: boolean
  acceptText?: string
  declineText?: string
  memberData?: any
  onSuccess?: any
}
