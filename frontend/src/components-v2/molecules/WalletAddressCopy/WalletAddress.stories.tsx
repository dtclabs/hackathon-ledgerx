import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { WalletAddress } from './WalletAddress'

export default {
  title: 'Molecules/Wallet Address',
  component: WalletAddress,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof WalletAddress>

const MOCK_CHAIN_DATA = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: '1',
    isTestnet: false,
    blockExplorer: 'https://etherscan.io/',
    apiUrl: 'https://api.etherscan.io/',
    imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png'
  },
  {
    id: 'goerli',
    name: 'Goerli',
    chainId: '5',
    isTestnet: true,
    blockExplorer: 'https://goerli.etherscan.io/',
    apiUrl: 'https://api-goerli.etherscan.io/',
    imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/goerli.png'
  }
]

export const Default: ComponentStory<typeof WalletAddress> = (args) => (
  <div className="p-4 font-inter">
    <WalletAddress address="0x0000000000000000" {...args} />
  </div>
)

export const WalletLink: ComponentStory<typeof WalletAddress> = (args) => (
  <div className="p-4 font-inter">
    <WalletAddress address="0x0000000000000000" {...args}>
      <WalletAddress.Link address="0x0000000000000000" options={MOCK_CHAIN_DATA} />
    </WalletAddress>
  </div>
)

export const WalletCopy: ComponentStory<typeof WalletAddress> = (args) => (
  <div className="p-4 font-inter">
    <WalletAddress address="0x0000000000000000" {...args}>
      <WalletAddress.Copy address="0x0000000000000000" />
    </WalletAddress>
  </div>
)

export const WalletCopyLink: ComponentStory<typeof WalletAddress> = (args) => (
  <div className="p-4 font-inter">
    <WalletAddress address="0x0000000000000000" {...args}>
      <WalletAddress.Copy address="0x0000000000000000" />
      <WalletAddress.Link address="0x0000000000000000" options={MOCK_CHAIN_DATA} />
    </WalletAddress>
  </div>
)

WalletCopy.args = {
  split: 6
}

WalletLink.args = {
  split: 6
}

WalletCopyLink.args = {
  split: 6
}
