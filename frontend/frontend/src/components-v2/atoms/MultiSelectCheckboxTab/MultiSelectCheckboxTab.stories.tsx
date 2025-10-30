import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import MultiSelectCheckbox from './index'

export default {
  title: 'Atoms/MultiSelectCheckbox',
  component: MultiSelectCheckbox
} as ComponentMeta<typeof MultiSelectCheckbox>

const Template: ComponentStory<typeof MultiSelectCheckbox> = (args) => <MultiSelectCheckbox {...args} />

export const MultiSelectCheckboxExampleChecked = Template.bind({})
MultiSelectCheckboxExampleChecked.args = {
  label: 'Ethereum',
  imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
  checked: true
}

export const MultiSelectCheckboxExampleUnChecked = Template.bind({})
MultiSelectCheckboxExampleUnChecked.args = {
  label: 'Ethereum',
  imageUrl: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
  checked: false
}

export const MultiSelectCheckboxExampleUnCheckedNoImage = Template.bind({})
MultiSelectCheckboxExampleUnCheckedNoImage.args = {
  label: 'Ethereum',
  checked: false
}
