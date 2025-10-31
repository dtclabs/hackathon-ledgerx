import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { CryptoFiatInfoDisplay } from '.'

export default {
  title: 'Molecules/Crypto Fiat Info Display',
  component: CryptoFiatInfoDisplay,
  args: {},
  argTypes: {}
} as Meta<typeof CryptoFiatInfoDisplay>

const Template: StoryFn<typeof CryptoFiatInfoDisplay> = (args) => (
  <div className="w-[100px]">
    <CryptoFiatInfoDisplay
      iso="US"
      cryptocurrency={{
        image:
          'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_225_thumb.png',
        amount: '10000.1',
        symbol: 'ETH'
      }}
      fiatcurrency={{
        iso: 'US',
        currencyCode: 'USD',
        currencySymbol: '$',
        fiatAmount: '1000000'
      }}
    />
  </div>
)

export const Default = Template.bind({})
