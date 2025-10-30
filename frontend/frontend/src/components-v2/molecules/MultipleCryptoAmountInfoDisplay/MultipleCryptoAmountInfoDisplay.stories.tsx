import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { MultipleCryptoAmountInfoDisplay } from '.'

export default {
  title: 'Molecules/Multiple Crypto Amount Info Display',
  component: MultipleCryptoAmountInfoDisplay,
  args: {},
  argTypes: {}
} as Meta<typeof MultipleCryptoAmountInfoDisplay>

const tokens = [
  {
    image:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_225_thumb.png',
    amount: '10000.1',
    symbol: 'ETH'
  },
  {
    image:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_225_thumb.png',
    amount: '10000.1',
    symbol: 'ETH'
  },
  {
    image:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_225_thumb.png',
    amount: '10000.1',
    symbol: 'ETH'
  }
]

const Template: StoryFn<typeof MultipleCryptoAmountInfoDisplay> = (args) => (
  <div className="w-[500px]">
    <MultipleCryptoAmountInfoDisplay id="token-demo" displayNumber={2} tokens={tokens} />
  </div>
)

export const Default = Template.bind({})
