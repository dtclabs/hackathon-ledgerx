import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Warning from '@/public/svg/icons/round-warning.svg'

interface IConfirmModal {
  provider: any
  onClickConfirm: () => void
  isLoading: boolean
  title: string
  decription?: any
  confirmBtnLabel?: string
  icon?: string
}

const ConfirmModal: React.FC<IConfirmModal> = ({
  provider,
  onClickConfirm,
  isLoading,
  title,
  confirmBtnLabel,
  decription,
  icon
}) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={icon || Warning} />
      <BaseModal.Header.Title>{title}</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      {decription && (
        <Typography color="secondary" variant="body2">
          {decription}
        </Typography>
      )}
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        disabled={isLoading}
        onClick={() => {
          provider.methods.setIsOpen(false)
        }}
        label="Cancel"
      />

      <BaseModal.Footer.PrimaryCTA
        disabled={isLoading}
        type="submit"
        onClick={(e) => {
          e.stopPropagation()
          onClickConfirm()
        }}
        label={confirmBtnLabel ?? 'Confirm'}
      />
    </BaseModal.Footer>
  </BaseModal>
)

export default ConfirmModal
