import React, { useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import SuccessIcon from '@/public/svg/icons/success-icon.svg'
import { IntegrationName, integrationNameMap } from '@/api-v2/organization-integrations'

// This modal is when a user has successfully submit their whitelist request

const RequestIntegrationModal = ({ provider, integrationName = IntegrationName.XERO }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={SuccessIcon} />
      <BaseModal.Header.Title>Request submitted</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography color="secondary" variant="body2">
        You have already submitted your interest for {integrationNameMap[integrationName]} Integration. The team will
        reach out to you on your registered email within 1-2 working days.
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.PrimaryCTA onClick={() => provider.methods.setIsOpen(false)} label="OK" />
    </BaseModal.Footer>
  </BaseModal>
)

export default RequestIntegrationModal
