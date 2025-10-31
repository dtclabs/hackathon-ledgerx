import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Dropdown from './index'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Atoms/Dropdown',
  component: Dropdown,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Dropdown>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Dropdown> = (args) => <Dropdown {...args} />

export const SearchableDropdown = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SearchableDropdown.args = {
  value: 'chocolate',
  options: [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'vanilla', label: 'Vanilla' }
  ],
  handleOnChange(val) {
    console.log(val)
  }
}
