import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import WarningIcon from '@/public/svg/icons/round-warning.svg'
import React from 'react'

interface IMappingUpdateConfirmModal {
  provider: any
  numOfTxns: number
  onConfirm: () => void
  onCancel: () => void
}

const MappingUpdateConfirmModal: React.FC<IMappingUpdateConfirmModal> = ({
  provider,
  numOfTxns,
  onCancel,
  onConfirm
}) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={WarningIcon} />
      <BaseModal.Header.Title wraperClassName="w-[450px]">
        Unable to map {numOfTxns} Transactions
      </BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body extendedClass="pl-[114px] !pr-24">
      <Typography color="primary" variant="body2">
        We’ve found {numOfTxns} Transaction with accounts that were manually mapped by you or your team. Would you like
        to update the accounts for these transactions as well?
      </Typography>
      <Typography color="primary" variant="body2" classNames="mt-4">
        <span className="italic font-bold">“Yes”</span> will update the accounts for all transactions including the ones
        that have been manually mapped.
      </Typography>
      <Typography color="primary" variant="body2" classNames="mt-4">
        <span className="italic font-bold">“No”</span> will only update the accounts for all transactions that were not
        manually mapped.
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA onClick={onCancel} label="No" classNames="w-full" />
      <BaseModal.Footer.PrimaryCTA onClick={onConfirm} label="Yes" />
    </BaseModal.Footer>
  </BaseModal>
)

export default MappingUpdateConfirmModal
