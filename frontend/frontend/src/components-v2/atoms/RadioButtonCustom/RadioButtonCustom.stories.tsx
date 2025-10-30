import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import RadioButtonCustom from './index'

export default {
  title: 'Atoms/RadioButtonCustom',
  component: RadioButtonCustom
} as ComponentMeta<typeof RadioButtonCustom>

const Template: ComponentStory<typeof RadioButtonCustom> = (args) => <RadioButtonCustom {...args} />

export const RadioButtonCustomExampleWithImageChecked = Template.bind({})
RadioButtonCustomExampleWithImageChecked.args = {
  label: 'Ethereum',
  imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
  checked: true
}

export const RadioButtonCustomExampleWithImageUnChecked = Template.bind({})
RadioButtonCustomExampleWithImageUnChecked.args = {
  label: 'Ethereum',
  imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
  checked: false
}

export const RadioButtonCustomExampleNoImageUnChecked = Template.bind({})
RadioButtonCustomExampleNoImageUnChecked.args = {
  label: 'Ethereum',
  checked: false
}
