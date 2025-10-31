import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Pill from './index'

export default {
  title: 'Atoms/Pill',
  component: Pill
} as ComponentMeta<typeof Pill>

const Template: ComponentStory<typeof Pill> = (args) => <Pill {...args} />

export const PillExample = Template.bind({})
PillExample.args = {
  label: 'Active',
  bgColor: 'E4E4FF',
  fontColor: '2F2CFF'
}
