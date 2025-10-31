import React, { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'

// This modal is when a user has successfully submit their whitelist request
interface IProps {
  onClickPrimary: () => void
  provider: any
}

const SwitchSafeEoaModal: FC<IProps> = ({ provider, onClickPrimary }) => {
  const handleOnClickPrimary = () => {
    onClickPrimary()
    provider.methods.setIsOpen(false)
  }
  return (
    <BaseModal provider={provider} width="600">
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon icon={ErrorIcon} />
        <BaseModal.Header.Title>Switching Wallet Type</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>
      <BaseModal.Body>
        <Typography color="secondary" variant="body2">
          Only Safe supports sending multiple currencies, if you switch wallet type, all your currencies will be reset.
        </Typography>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA onClick={() => provider.methods.setIsOpen(false)} label="Cancel" />
        <BaseModal.Footer.PrimaryCTA onClick={handleOnClickPrimary} label="OK" />
      </BaseModal.Footer>
    </BaseModal>
  )
}
export default SwitchSafeEoaModal
