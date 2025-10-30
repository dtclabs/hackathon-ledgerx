import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import WarningIcon from '@/public/svg/icons/round-warning.svg'

const DeleteContactModal = ({ provider, onDelete, name }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={WarningIcon} imageSize={60} />
      <BaseModal.Header.Title wraperClassName="w-[450px]">Delete contact?</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body extendedClass="!pl-[108px] !pr-24 !mt-0">
      <Typography color="primary" variant="body2">
        Do you wish to delete contact <b>{name}</b>?
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA onClick={() => provider.methods.setIsOpen(false)} label="Cancel" />
      <BaseModal.Footer.PrimaryCTA onClick={onDelete} label="Delete" classNames="w-full" />
    </BaseModal.Footer>
  </BaseModal>
)

export default DeleteContactModal
