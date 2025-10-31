export interface IModalProps {
  showModal?: boolean
  setShowModal?: (x: boolean) => void
  children: React.ReactNode
  onClose?: () => void
  isDisabledOuterClick?: boolean
  zIndex?: string
  onEscape?: () => void
  disableESCPress?: boolean
}

export interface IModal {
  showModal?: boolean
  setShowModal?: (x: boolean) => void
}
