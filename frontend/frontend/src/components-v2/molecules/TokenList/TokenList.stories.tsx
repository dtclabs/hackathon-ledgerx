import React from 'react'
import { Meta, ComponentStory } from '@storybook/react'
import TokenList from './TokenList'

export default {
  title: 'Molecules/Token List',
  component: TokenList,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof TokenList>

const MOCK_DATA = [
  {
    id: '497fe05f-036b-4d6a-8624-2f6b3756cc4a',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_497fe05f-036b-4d6a-8624-2f6b3756cc4a_small.png',
    name: 'ETH'
  },
  {
    id: '112c8adf-9dd7-4d66-9563-45e3c43cf71e',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/GEN_daostack_112c8adf-9dd7-4d66-9563-45e3c43cf71e_small.png',
    name: 'GEN'
  },
  {
    id: '9f65488a-1f9b-429d-889a-5b862fb67284',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/GNO_gnosis_9f65488a-1f9b-429d-889a-5b862fb67284_small.png',
    name: 'GNO'
  },
  {
    id: '780b5fbe-d617-4efa-8d59-521020956405',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/KNCL_kyber-network_780b5fbe-d617-4efa-8d59-521020956405_small.png',
    name: 'KNCL'
  },
  {
    id: '71acaf25-9866-4a9e-bcab-ceb43fd20615',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/OMG_omisego_71acaf25-9866-4a9e-bcab-ceb43fd20615_small.png',
    name: 'OMG'
  },
  {
    id: '5f2f778f-ca80-4579-bdc5-3a19ab5ae887',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/RDN_raiden-network_5f2f778f-ca80-4579-bdc5-3a19ab5ae887_small.png',
    name: 'RDN'
  },
  {
    id: '4c6cfc60-667c-4e6a-a8aa-6c23e6a0a8d6',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/SAI_sai_4c6cfc60-667c-4e6a-a8aa-6c23e6a0a8d6_small.png',
    name: 'SAI'
  },
  {
    id: 'b7da0590-2085-4e33-86cb-816b2a164d10',
    imageUrl:
      'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/LUNC_wrapped-terra_b7da0590-2085-4e33-86cb-816b2a164d10_small.png',
    name: 'LUNC'
  }
]

const Template: ComponentStory<typeof TokenList> = (args) => (
  <div className="p-4 font-inter">
    <TokenList tokens={MOCK_DATA} id="8062f3f8-a3da-4783-b7a1-37589f73512a" />
  </div>
)

export const Default = Template.bind({})
Default.args = {}
