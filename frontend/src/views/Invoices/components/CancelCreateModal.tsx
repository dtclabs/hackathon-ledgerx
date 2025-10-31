import React from 'react'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'
import Typography from '@/components-v2/atoms/Typography'

interface ICancelCreateModal {
  provider: any
  handleOnConfirm: () => void
}

const CancelCreateModal: React.FC<ICancelCreateModal> = ({ provider, handleOnConfirm }) => (
  <BaseModal provider={provider} width="650">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={ErrorIcon} />
      <BaseModal.Header.Title>Discard changes?</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <div>
        <Typography>You have unsaved changes. Do you wish to proceed?</Typography>
      </div>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA label="Cancel" onClick={() => provider.methods.setIsOpen(false)} />
      <BaseModal.Footer.PrimaryCTA onClick={handleOnConfirm} label="Discard" />
    </BaseModal.Footer>
  </BaseModal>
)

export default CancelCreateModal
