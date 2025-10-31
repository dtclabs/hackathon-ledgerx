import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Warning from '@/public/svg/icons/round-warning.svg'

const BulkUpdateErrorModal = ({ provider, onClickPrimaryCTA, title, decription }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={Warning} />
      <BaseModal.Header.Title>{title}</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      {decription && (
        <Typography color="secondary" variant="body2">
          {decription}
        </Typography>
      )}
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.PrimaryCTA
        type="submit"
        onClick={(e) => {
          e.stopPropagation()
          onClickPrimaryCTA()
        }}
        label="Dimiss"
      />
    </BaseModal.Footer>
  </BaseModal>
)

export default BulkUpdateErrorModal
