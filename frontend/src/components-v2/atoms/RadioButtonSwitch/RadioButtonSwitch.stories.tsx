import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import RadioButtonSwitch from './index'

export default {
  title: 'Atoms/RadioButtonSwitch',
  component: RadioButtonSwitch
} as ComponentMeta<typeof RadioButtonSwitch>

const Template: ComponentStory<typeof RadioButtonSwitch> = (args) => <RadioButtonSwitch {...args} />

export const RadioButtonSwitchExampleChecked = Template.bind({})
RadioButtonSwitchExampleChecked.args = {
  label: 'Annual Plan',
  subtitle: 'Save up to 25%',
  checked: true
}

export const RadioButtonSwitchExampleNoImageUnChecked = Template.bind({})
RadioButtonSwitchExampleNoImageUnChecked.args = {
  label: '6-month Plan',
  checked: false
}
