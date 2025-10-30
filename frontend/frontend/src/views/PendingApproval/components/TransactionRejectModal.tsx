import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import RejectIcon from '@/public/svg/RejectTx.svg'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'

interface IRejectTransactionModalProps {
  provider: any
  isLoading?: boolean
  onClickConfirm: (e: any) => void
}

const TransactionRejectModal: FC<IRejectTransactionModalProps> = ({ provider, isLoading, onClickConfirm }) => {
  const handleOnCancel = () => {
    provider.methods.setIsOpen(false)
  }
  return (
    <BaseModal provider={provider} classNames="rounded-3xl w-[600px]">
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon icon={RejectIcon} />
        <BaseModal.Header.Title>Reject Transaction</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>
      <BaseModal.Body>
        <Typography color="primary" variant="body2" styleVariant="semibold">
          This would void the transaction, and mark it as ‘rejected’.
        </Typography>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA disabled={isLoading} onClick={handleOnCancel} label="Cancel" />
        <BaseModal.Footer.PrimaryCTA
          disabled={isLoading}
          onClick={onClickConfirm}
          label="Reject Transaction"
          // @ts-ignore
          loadingWithLabel={isLoading}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default TransactionRejectModal
