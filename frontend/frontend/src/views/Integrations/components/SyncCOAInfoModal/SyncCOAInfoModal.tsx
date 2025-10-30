/* eslint-disable react/no-unescaped-entities */

import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import SuccessIcon from '@/public/svg/Success.svg'
import { IntegrationName } from '@/api-v2/organization-integrations'

interface ISyncCOAInfoModal {
  provider: any
  onClickRedirect?: () => void
  isLoading: boolean
  icon?: string
  integrationName: string
}

const SyncCOAInfoModal: React.FC<ISyncCOAInfoModal> = ({
  provider,
  onClickRedirect,
  isLoading,
  icon,
  integrationName
}) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={icon || SuccessIcon} />
      <BaseModal.Header.Title>
        {integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'} connection successful
      </BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body extendedClass="pt-4 mr-8">
      <Typography color="secondary" variant="body2">
        You may now import your Chart of Accounts into the HQ app.
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.PrimaryCTA
        disabled={isLoading}
        type="submit"
        onClick={(e) => {
          e.stopPropagation()
          onClickRedirect()
        }}
        label="Go to Chart of Accounts"
      />
    </BaseModal.Footer>
  </BaseModal>
)

export default SyncCOAInfoModal
