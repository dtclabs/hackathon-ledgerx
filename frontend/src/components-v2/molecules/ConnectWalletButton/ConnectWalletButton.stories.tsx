import React from 'react'
import { Story, Meta } from '@storybook/react'
import ConnectWalletButton from './index'

export default {
  title: 'Molecules/ConnectWalletButton',
  component: ConnectWalletButton
} as Meta

const Template: Story<typeof ConnectWalletButton> = () => <ConnectWalletButton isDisabled={false} />

export const ConnectWalletButtonExample = Template.bind({})
