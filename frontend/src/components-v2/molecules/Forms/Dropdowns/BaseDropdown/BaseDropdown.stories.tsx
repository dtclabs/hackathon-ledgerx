import React from 'react'
import { StoryFn, Meta } from '@storybook/react'
import BaseDropdown from './BaseDropdown'
import Button from '@/components-v2/atoms/Button'

export default {
  title: 'Molecules/Forms/Dropdown',
  component: BaseDropdown,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof BaseDropdown>

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]

const Template: StoryFn<typeof BaseDropdown> = (args) => {
  const onChange = (value) => console.log(value)
  return (
    <div className="font-inter">
      <BaseDropdown {...args} options={options} onChange={onChange} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  showCaret: true
}

export const CustomMenuFooter = Template.bind({})
CustomMenuFooter.args = {
  showCaret: true,
  customBottomComponent: (
    <div className="flex flex-row p-2 gap-2">
      <Button height={40} width="w-full" variant="grey" label="Cancel" />
      <Button height={40} width="w-full" variant="black" label="Add" />
    </div>
  )
}
