import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { SkeletonLoader } from './index'

export default {
  title: 'Molecules/Skeleton Loader',
  component: SkeletonLoader,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof SkeletonLoader>

const Template: ComponentStory<typeof SkeletonLoader> = (args) => (
  <div className="p-4">
    <SkeletonLoader {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  width: 200
}

export const CircleExample = Template.bind({})
CircleExample.args = {
  variant: 'circle',
  size: 150
}

export const BoxExample = Template.bind({})
BoxExample.args = {
  variant: 'box',
  width: 300,
  height: 100
}
