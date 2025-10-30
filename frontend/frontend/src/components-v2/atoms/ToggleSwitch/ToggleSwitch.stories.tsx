import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import ToggleSwitch from './index'

export default {
  title: 'Atoms/ToggleSwitch',
  component: ToggleSwitch
} as ComponentMeta<typeof ToggleSwitch>

const Template: ComponentStory<typeof ToggleSwitch> = (args) => <ToggleSwitch {...args} />

export const ToggleSwitchExampleChecked = Template.bind({})
ToggleSwitchExampleChecked.args = {
  checked: true
}

export const ToggleSwitchExampleUnChecked = Template.bind({})
ToggleSwitchExampleUnChecked.args = {
  checked: false
}
