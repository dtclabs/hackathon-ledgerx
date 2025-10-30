import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import CheckboxCustom from './index'

export default {
  title: 'Atoms/CheckboxCustom',
  component: CheckboxCustom
} as ComponentMeta<typeof CheckboxCustom>

const Template: ComponentStory<typeof CheckboxCustom> = (args) => <CheckboxCustom {...args} />

export const CheckboxCustomExampleChecked = Template.bind({})
CheckboxCustomExampleChecked.args = {
  label: 'Ethereum',
  imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
  checked: true
}

export const CheckboxCustomExampleUnChecked = Template.bind({})
CheckboxCustomExampleUnChecked.args = {
  label: 'Ethereum',
  imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
  checked: false
}

export const CheckboxCustomExampleUnCheckedNoImage = Template.bind({})
CheckboxCustomExampleUnCheckedNoImage.args = {
  label: 'Ethereum',
  checked: false
}
