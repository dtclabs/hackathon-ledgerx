import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import MultiSelectDropdown from './MultiSelectDropdown'

export default {
  title: 'Molecules/Forms/Multi-Select Dropdown',
  component: MultiSelectDropdown,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof MultiSelectDropdown>

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]

const Template: StoryFn<typeof MultiSelectDropdown> = (args) => {
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOnChange = (_options) => {
    setSelectedOptions(_options)
  }
  return <MultiSelectDropdown options={options} value={selectedOptions} onChange={handleOnChange} />
}

export const Default = Template.bind({})
Default.args = {
  showCaret: true
}
