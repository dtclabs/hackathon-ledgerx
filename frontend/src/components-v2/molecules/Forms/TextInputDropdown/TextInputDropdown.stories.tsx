import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import TextInputDropdown from './TextInputDropdown'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import BlackLock from '@/public/svg/icons/black-lock-icon.svg'

const ICON_MAP = { AddIcon, BlackLock, undefined }

export default {
  title: 'Molecules/Forms/Text Input Dropdown',
  component: TextInputDropdown,

  argTypes: {}
} as Meta<typeof TextInputDropdown>

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]

const Template: StoryFn<typeof TextInputDropdown> = (args) => {
  const handleOnOptionChange = (_option) => {
    console.log('OPTION: ', _option)
  }
  const handleInputChange = (_e) => console.log(_e)
  return (
    <div>
      <TextInputDropdown
        onInputChange={handleInputChange}
        onOptionChange={handleOnOptionChange}
        options={options}
        placeholder="Enter amount..."
      />
    </div>
  )
}

export const Default = Template.bind({})
