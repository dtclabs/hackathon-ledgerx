import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import TextInput from './TextInput2'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import BlackLock from '@/public/svg/icons/black-lock-icon.svg'

const ICON_MAP = { AddIcon, BlackLock, undefined }

export default {
  title: 'Molecules/Forms/Text Input',
  component: TextInput,
  args: {
    placeholder: 'Enter an email address',
    value: ''
  },
  argTypes: {
    value: {
      type: 'string',
      description: 'Value of input',
      control: 'text'
    },
    placeholder: {
      type: 'string',
      description: 'Text shown when there is no value',
      control: 'text'
    },
    size: {
      description: 'Size of input',
      options: ['sm', 'md', 'lg'],
      control: { type: 'radio' }
    },
    trailingIcon: {
      description: 'Add an icon to end of Input',
      name: 'Trailing Icon',
      options: Object.keys(ICON_MAP),
      mapping: ICON_MAP,
      control: {
        type: 'select',
        labels: {
          undefined: 'None',
          AddIcon: 'Add Icon',
          BlackLock: 'Lock Icon'
        }
      }
    },
    leadingIcon: {
      name: 'Leading Icon',
      description: 'Add an icon to start of Input',
      options: Object.keys(ICON_MAP),
      mapping: ICON_MAP,
      control: {
        type: 'select',
        labels: {
          undefined: 'None',
          AddIcon: 'Add Icon',
          BlackLock: 'Lock Icon'
        }
      }
    }
  }
} as Meta<typeof TextInput>

const Template: StoryFn<typeof TextInput> = (args) => {
  const [value, setValue] = useState('')
  const handleOnChange = (e) => setValue(e?.target?.value)
  return (
    <div className="font-inter">
      <TextInput value={value} onChange={handleOnChange} {...args} />
    </div>
  )
}

export const Default = Template.bind({})
