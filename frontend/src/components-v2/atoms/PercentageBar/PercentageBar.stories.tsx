import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import PercentageBar from './index'

export default {
  title: 'Atoms/PercentageBar',
  component: PercentageBar
} as ComponentMeta<typeof PercentageBar>

const Template: ComponentStory<typeof PercentageBar> = (args) => <PercentageBar {...args} />

const EthTooltip = () => (
  <div>
    <p>Ethereum</p>
    <p>Value: 3.3</p>
    <p>Ratio: 3.3</p>
  </div>
)

export const PercentageBarExample = Template.bind({})
PercentageBarExample.args = {
  inputs: [
    { ratioInPercentage: 3.3, color: '#627EE9', tooltip: EthTooltip(), tooltipId: 'eth' },
    { ratioInPercentage: 30, color: '#F0B90C' },
    { ratioInPercentage: 66.7, color: '#8345E5' }
  ]
}
