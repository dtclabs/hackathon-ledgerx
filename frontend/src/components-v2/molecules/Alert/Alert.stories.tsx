import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { Alert } from '.'
import WarningIcon from '@/public/svg/icons/warning-icon.svg'

export default {
  title: 'Molecules/Alert',
  component: Alert,
  args: {
    isVisible: true,
    variant: 'warning'
  },
  argTypes: {
    variant: {
      description: 'State of alert',
      options: ['success', 'error', 'warning'],
      control: { type: 'radio' }
    }
  }
} as Meta<typeof Alert>

const Template: StoryFn<typeof Alert> = (args) => {
  const handleOnClickClose = () => {
    console.log('close')
  }
  return (
    <div className="w-[500px]">
      <Alert onClickClose={handleOnClickClose} isVisible={args.isVisible} variant={args.variant}>
        <Alert.Icon icon={WarningIcon} />
        <Alert.Text>Success</Alert.Text>
      </Alert>
    </div>
  )
}
export const Default = Template.bind({})
