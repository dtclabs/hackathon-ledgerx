import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { DashboardQuickActionCard } from './index'
import wallet from '@/public/svg/icons/yellow-wallet-icon.svg'

export default {
  title: 'Molecules/Dashboard Quick Action Card',
  component: DashboardQuickActionCard,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof DashboardQuickActionCard>

const Template: ComponentStory<typeof DashboardQuickActionCard> = (args) => (
  <div className="flex font-inter bg-slate-200  p-4">
    <DashboardQuickActionCard {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  icon: wallet,
  title: 'Import a wallet',
  subTitle: 'Track assets & balances',
  width: 300
}

export const Disabled = Template.bind({})
Disabled.args = {
  icon: wallet,
  title: 'Import a wallet',
  subTitle: 'Track assets & balances',
  width: 300,
  disabled: true
}

export const DisabledWithTooltip = Template.bind({})
DisabledWithTooltip.args = {
  icon: wallet,
  title: 'Import a wallet',
  subTitle: 'Track assets & balances',
  width: 300,
  disabled: true,
  tooltipMessage: 'You cant use this'
}
