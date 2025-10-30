import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import WarningIcon from '@/public/svg/icons/blue-warning-icon.svg'
import React from 'react'

interface ISyncSettingsModal {
  provider: any
  onClickCTA?: () => void
  isLoading: boolean
  integrationName: string
  settings: {
    currency: string
    timezone: string
  }
}

const SyncSettingsModal: React.FC<ISyncSettingsModal> = ({ provider, onClickCTA, isLoading, settings }) => (
  <BaseModal provider={provider} width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={WarningIcon} />
      <BaseModal.Header.Title wraperClassName="max-w-[450px]">
        Do you want to switch your currency and time zone?
      </BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body extendedClass="pt-4 ml-1">
      <Typography color="secondary" variant="body2">
        Do you wish to switch over to <b>{settings?.currency}</b> and <b>{settings?.timezone}</b>? You may update this
        in your Organisation Settings any time.
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        classNames="w-full"
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation()
          provider.methods.setIsOpen(false)
        }}
        label="No, don't change"
      />
      <BaseModal.Footer.PrimaryCTA
        disabled={isLoading}
        type="submit"
        onClick={(e) => {
          e.stopPropagation()
          onClickCTA()
        }}
        label="Yes, switch over"
      />
    </BaseModal.Footer>
  </BaseModal>
)

export default SyncSettingsModal
