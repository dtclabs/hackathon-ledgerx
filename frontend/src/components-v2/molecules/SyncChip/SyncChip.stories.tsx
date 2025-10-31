import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import SyncChip from './index'

export default {
  title: 'Molecules/Sync Chip',
  component: SyncChip,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof SyncChip>

const Template: ComponentStory<typeof SyncChip> = (args) => (
  <div className="flex">
    <SyncChip {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  isSyncing: false,
  lastUpdated: '5 seconds ago'
}
