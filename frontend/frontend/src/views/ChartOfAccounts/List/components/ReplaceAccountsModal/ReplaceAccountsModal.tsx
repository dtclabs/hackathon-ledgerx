import React, { useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import WarningIcon from '@/public/svg/icons/blue-warning-icon.svg'

const RequestIntegrationModal = ({ provider, onClickPrimaryCTA }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={WarningIcon} />
      <BaseModal.Header.Title>Replace Existing Accounts</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography color="secondary" variant="body2">
        Please note that the data migration process is irreversible. By syncing your Chart of Accounts with Xero, all
        existing Accounts with HQ will be replaced. You will have to un-map or re-map the affected transactions to
        confirm action.
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA onClick={() => provider.methods.setIsOpen(false)} label="Cancel" />
      <BaseModal.Footer.PrimaryCTA
        onClick={() => {
          provider.methods.setIsOpen(false)
          onClickPrimaryCTA()
        }}
        label="Continue"
      />
    </BaseModal.Footer>
  </BaseModal>
)

export default RequestIntegrationModal
