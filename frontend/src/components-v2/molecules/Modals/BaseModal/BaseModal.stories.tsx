import React, { useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { BaseModal } from './index'
import { useModalHook } from './state-ctx'

export default {
  title: 'Molecules/Modals/Base Modal',
  component: BaseModal,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof BaseModal>

const Template: ComponentStory<typeof BaseModal> = (args) => {
  const provider = useModalHook({ defaultState: { isOpen: true } })

  const handleOnClose = () => {
    provider.methods.setIsOpen(false)
  }
  return (
    <div className="flex font-inter p-4">
      <button type="button" onClick={() => provider.methods.setIsOpen(!provider.state.isOpen)}>
        Open Modal
      </button>
      <BaseModal provider={provider} width="600">
        <BaseModal.Header>
          <BaseModal.Header.HeaderIcon />
          <BaseModal.Header.Title>Submit request for Xero Integration</BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="secondary" variant="body2">
            The team will reach out to you on your registered email within 1-2 working days. Please confirm that you are
            contactable via the email address below.
          </Typography>
        </BaseModal.Body>
        <BaseModal.Footer>
          {/* <BaseModal.Footer.SecondaryCTA label="Close" /> */}
          <BaseModal.Footer.PrimaryCTA onClick={handleOnClose} label="OK" />
        </BaseModal.Footer>
      </BaseModal>
    </div>
  )
}

export const Default = Template.bind({})
// Default.args = {
//   isSyncing: false,
//   lastUpdated: '5 seconds ago'
// }
