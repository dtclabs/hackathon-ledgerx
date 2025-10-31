import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import WarningIcon from '@/public/svg/icons/round-warning.svg'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'

interface IProps {
  provider: any
  onClickPrimary: () => void
  onClickCancel: () => void
  message: string
}

const InsufficientBalanceModal: FC<IProps> = ({ provider, message, onClickPrimary, onClickCancel }) => (
  <BaseModal provider={provider} classNames="w-[600px] flex flex-col">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={WarningIcon} />
      <BaseModal.Header.Title>Insufficient Balance</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton onClose={onClickCancel} />
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography variant="body1" color="secondary">
        {message}
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.PrimaryCTA label="Dismiss" onClick={onClickPrimary} />
    </BaseModal.Footer>
  </BaseModal>
)

export default InsufficientBalanceModal
