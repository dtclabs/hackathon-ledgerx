import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import WalletIconSquare from '@/views/Wallets/components/WalletIconSquare'
import ETH from '@/public/svg/CyanETH.svg'
import Safe from '@/public/svg/Gnosis.svg'

export default {
  title: 'Atoms/WalletIconSquare',
  component: WalletIconSquare
} as ComponentMeta<typeof WalletIconSquare>

const Template: ComponentStory<typeof WalletIconSquare> = (args) => <WalletIconSquare {...args} />

export const WalletIconEthereum = Template.bind({})
WalletIconEthereum.args = {
  walletImage: ETH,
  walletName: 'Ethereum'
}

export const WalletIconSafe = Template.bind({})
WalletIconSafe.args = {
  walletImage: Safe,
  walletName: 'Safe'
}
