import { Meta, StoryFn } from '@storybook/react'
import PaymentLineItem from './PaymentLineItem'

export default {
  title: 'Molecules/Payment Line Item',
  component: PaymentLineItem,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof PaymentLineItem>

const ACCOUNT_OPTIONS = [
  {
    value: null,
    label: 'No Account'
  },
  {
    label: 'ASSET',
    options: [
      {
        value: '4ba91e65-fda8-463e-a3b0-3936825d0ead',
        label: '090 - Business Bank Account',
        code: '090',
        name: 'Business Bank Account',
        type: 'ASSET'
      },
      {
        value: '95b62734-03dc-4836-9b62-54f75c2e7866',
        label: '091 - Business Savings Account',
        code: '091',
        name: 'Business Savings Account',
        type: 'ASSET'
      }
    ]
  },
  {
    label: 'EXPENSE',
    options: [
      {
        value: 'dd2466ab-d2b2-4a8c-abdc-057a2ed06c05',
        label: '300 - Purchases',
        code: '300',
        name: 'Purchases',
        type: 'EXPENSE'
      },
      {
        value: '03e738eb-2529-400b-a65a-9a91c1e4b88e',
        label: '310 - Cost of Goods Sold',
        code: '310',
        name: 'Cost of Goods Sold',
        type: 'EXPENSE'
      }
    ]
  }
]

const TOKEN_OPTIONS = [
  {
    value: '5ffac931-db3c-4eec-9126-c6d974c2e5b0',
    label: 'ETH',
    src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_225_small.png',
    address: {
      blockchainId: 'goerli',
      type: 'Coin',
      decimal: 18,
      address: null
    }
  },
  {
    value: '5b4ec273-02ac-4dba-aec9-8fcd06a3fe89',
    label: 'USDC',
    src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/USDC_usd-coin_5b4ec273-02ac-4dba-aec9-8fcd06a3fe89_small.png',
    address: {
      blockchainId: 'goerli',
      type: 'Token',
      decimal: 6,
      address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'
    }
  },
  {
    value: 'da4607ae-4155-4f31-b488-1110cc089e58',
    label: 'MATIC',
    src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/MATIC_matic-network_1098_small.png',
    address: {
      blockchainId: 'goerli',
      type: 'Token',
      decimal: 18,
      address: '0xA108830A23A9a054FfF4470a8e6292da0886A4D4'
    }
  }
]

const CONTACT_OPTIONS = [
  {
    value: '0xDD0b9EB53739598cA4cd43ac3e09f927813F7912',
    label: 'Contact 1',
    address: '0xDD0b9EB53739598cA4cd43ac3e09f927813F7912',
    src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
    chainId: 'ethereum',
    supportedBlockchains: ['ethereum']
  },
  {
    value: '0xb5FdC3FF7659E39e5990dD45dF12f67bd744FcD8',
    label: 'Contact 2',
    address: '0xb5FdC3FF7659E39e5990dD45dF12f67bd744FcD8',
    src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/goerli.png',
    chainId: 'goerli',
    supportedBlockchains: ['ethereum', 'goerli', 'polygon', 'bsc']
  }
]

const Template: StoryFn<typeof PaymentLineItem> = (args) => {
  const handleChange = (value: any, index?: any) => {
    console.log(value)
  }
  return (
    <div className="font-inter">
      <PaymentLineItem
        index={args?.index}
        contact={args?.contact}
        token={args?.token}
        account={args?.account}
        amount={args?.amount}
        note={args?.note}
        files={args?.files}
        errors={args?.errors}
        removeDisabled
        accountOptions={args?.accountOptions}
        contactOptions={args?.contactOptions}
        tokenOptions={args?.tokenOptions}
        onInputChange={handleChange}
        onContactChange={handleChange}
        onPreviewFile={handleChange}
        onAccountChange={handleChange}
        onAmountChange={handleChange}
        onNoteChange={handleChange}
        onTokenChange={handleChange}
        onFileChange={handleChange}
        onCopyItem={handleChange}
        onRemoveItem={handleChange}
        onSaveContact={handleChange}
      />
    </div>
  )
}

export const Default = Template.bind({})
export const Error = Template.bind({})
export const Unknown = Template.bind({})

Default.args = {
  index: 0,
  accountOptions: ACCOUNT_OPTIONS,
  contactOptions: CONTACT_OPTIONS,
  tokenOptions: TOKEN_OPTIONS,
  contact: CONTACT_OPTIONS[0],
  account: ACCOUNT_OPTIONS[1].options[0],
  token: TOKEN_OPTIONS[0],
  files: [],
  amount: '0.001',
  errors: {},
  note: 'Note here'
}
Error.args = {
  index: 0,
  accountOptions: ACCOUNT_OPTIONS,
  contactOptions: CONTACT_OPTIONS,
  tokenOptions: TOKEN_OPTIONS,
  token: TOKEN_OPTIONS[0],
  files: [],
  amount: '0.001',
  errors: {
    recipients: [
      {
        walletAddress: {
          message: 'Recipient is required.',
          type: 'required'
        },
        amount: {
          message: 'Amount is required.',
          type: 'required'
        }
      }
    ]
  },
  note: 'Note here'
}
Unknown.args = {
  index: 0,
  contact: {
    value: '0xDD0b9EB53739598cA4cd43ac3e09f927813F7912',
    label: '0xDD0b9EB53739598cA4cd43ac3e09f927813F7912',
    address: '0xDD0b9EB53739598cA4cd43ac3e09f927813F7912',
    src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
    chainId: 'ethereum',
    isUnknown: true,
    supportedBlockchains: ['ethereum']
  },
  accountOptions: ACCOUNT_OPTIONS,
  contactOptions: CONTACT_OPTIONS,
  tokenOptions: TOKEN_OPTIONS,
  token: TOKEN_OPTIONS[0],
  files: [],
  amount: '0.001',
  errors: {},
  note: 'Note here'
}
