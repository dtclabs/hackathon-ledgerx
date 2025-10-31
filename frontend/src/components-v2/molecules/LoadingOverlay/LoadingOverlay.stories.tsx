import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { LoadingOverlay } from './index'

export default {
  title: 'Molecules/Loading Overlay',
  component: LoadingOverlay,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof LoadingOverlay>

const Template: ComponentStory<typeof LoadingOverlay> = (args) => (
  <div className="h-screen">
    <LoadingOverlay />
    <div>some content</div>
  </div>
)

export const Default = Template.bind({})
// Default.args = {
//   isSyncing: false,
//   lastUpdated: '5 seconds ago'
// }
