import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { CryptoInfoDisplay } from '.'

export default {
  title: 'Molecules/Crypto Info Display',
  component: CryptoInfoDisplay,
  args: {},
  argTypes: {}
} as Meta<typeof CryptoInfoDisplay>

const Template: StoryFn<typeof CryptoInfoDisplay> = (args) => (
  <div className="">
    <CryptoInfoDisplay
      iso="US"
      amount="1000"
      image="https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_225_thumb.png"
      symbol="ETH"
    />
  </div>
)

export const Default = Template.bind({})
