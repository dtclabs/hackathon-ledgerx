import React, { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Warning from '@/public/svg/icons/round-warning.svg'

interface IDeleteDraftModal {
  provider: any
  onClickDelete: () => void
  onClickCancel: () => void
}

const DeleteDraftModal: FC<IDeleteDraftModal> = ({ provider, onClickDelete, onClickCancel }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={Warning} />
      <BaseModal.Header.Title>Delete Payment?</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography color="secondary" variant="body2">
        The payment will be deleted permanently.
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        onClick={() => {
          onClickCancel()
          provider.methods.setIsOpen(false)
        }}
        type="button"
        label="Cancel"
      />
      <BaseModal.Footer.PrimaryCTA variant="redfilled" type="button" onClick={onClickDelete} label="Delete" />
    </BaseModal.Footer>
  </BaseModal>
)

export default DeleteDraftModal
