import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'

const DisconnectModal = ({ provider, onClickPrimary, isLoading, title, description }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={ErrorIcon} />
      <BaseModal.Header.Title>{title}</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <div className="w-[85%]">
        <Typography color="secondary" variant="body2">
          {description}
        </Typography>
      </div>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        disabled={isLoading}
        onClick={() => provider.methods.setIsOpen(false)}
        label="Cancel"
      />
      <BaseModal.Footer.PrimaryCTA disabled={isLoading} onClick={onClickPrimary} label="Disconnect" />
    </BaseModal.Footer>
  </BaseModal>
)

export default DisconnectModal
