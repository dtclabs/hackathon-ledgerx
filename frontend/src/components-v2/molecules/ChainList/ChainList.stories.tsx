import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { ChainList } from './ChainList'

export default {
  title: 'Molecules/Chain List',
  component: ChainList,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof ChainList>

const MOCK_DATA = [
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

const Template: ComponentStory<typeof ChainList> = (args) => (
  <div className="p-4 font-inter">
    <ChainList chains={MOCK_DATA} />
  </div>
)

export const Default = Template.bind({})
Default.args = {}
