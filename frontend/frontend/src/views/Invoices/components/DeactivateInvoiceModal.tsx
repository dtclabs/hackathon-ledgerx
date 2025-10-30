import React from 'react'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Typography from '@/components-v2/atoms/Typography'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'

interface IDeactivateInvoiceModal {
  provider: any
  handleOnConfirm: () => void
  isLoading: boolean
}

const DeactivateInvoiceModal: React.FC<IDeactivateInvoiceModal> = ({ provider, handleOnConfirm, isLoading }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={ErrorIcon} />
      <BaseModal.Header.Title>Void invoice?</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <div className="max-w-[80%]">
        <Typography color="secondary">
          This invoice link will no longer be available. If payments have already been made, it will still be processed
          within 1-3 working days. Do you wish to proceed?
        </Typography>
      </div>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        disabled={isLoading}
        label="Cancel"
        onClick={() => provider.methods.setIsOpen(false)}
      />
      <BaseModal.Footer.PrimaryCTA disabled={isLoading} onClick={handleOnConfirm} label="Void" />
    </BaseModal.Footer>
  </BaseModal>
)

export default DeactivateInvoiceModal
