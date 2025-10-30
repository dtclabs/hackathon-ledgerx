import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Warning from '@/public/svg/icons/round-warning.svg'
import { FC } from 'react'

interface IDiscardChangesModal {
  provider: any
  onDiscardChanges: () => void
}

const DiscardChangesModal: FC<IDiscardChangesModal> = ({ provider, onDiscardChanges }) => (
  <BaseModal provider={provider} width="600" zIndex="z-[1001]">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={Warning} />
      <BaseModal.Header.Title>Discard Changes?</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography color="secondary" variant="body2">
        You have unsaved changes. Do you wish to proceed?
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        onClick={() => {
          provider.methods.setIsOpen(false)
        }}
        type="button"
        label="Cancel"
      />
      <BaseModal.Footer.PrimaryCTA type="button" onClick={onDiscardChanges} label="Discard" />
    </BaseModal.Footer>
  </BaseModal>
)

export default DiscardChangesModal
