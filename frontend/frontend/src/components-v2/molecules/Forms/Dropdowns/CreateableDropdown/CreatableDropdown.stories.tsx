import React from 'react'
import { StoryFn, Meta } from '@storybook/react'
import CreateableDropdown from './CreateableDropdown'

export default {
  title: 'Molecules/Forms/Createable Dropdown',
  component: CreateableDropdown,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof CreateableDropdown>

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]

const Template: StoryFn<typeof CreateableDropdown> = (args) => {
  const onChange = (value) => console.log(value)
  return (
    <div className="font-inter">
      <CreateableDropdown {...args} options={options} onChange={onChange} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  showCaret: true
}
