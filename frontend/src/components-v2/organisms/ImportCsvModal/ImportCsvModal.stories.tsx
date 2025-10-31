import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { ImportCsvModal } from './index'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'

export default {
  title: 'Organisms/Import Csv Modal',
  component: ImportCsvModal,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof ImportCsvModal>

const Template: ComponentStory<typeof ImportCsvModal> = (args) => {
  const provider = useModalHook({ defaultState: { isOpen: true } })

  const handleOnSuccess = () => {
    console.log('SUCCESS')
  }
  const handleOnError = () => {
    console.log('ERROR')
  }
  return (
    <div className="flex">
      <ImportCsvModal
        title="Import Chart of Accounts (CSV)"
        subtitle="This adds multiple accounts at the same time"
        onSuccess={handleOnSuccess}
        onError={handleOnError}
        provider={provider}
      >
        <div>dddd</div>
      </ImportCsvModal>
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {}
