/* eslint-disable arrow-body-style */
import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Badge } from './Badge2'
import LinkIcon from '@/public/svg/icons/link-icon.svg'

export default {
  title: 'Molecules/Badge',
  component: Badge,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Badge>

const Template: ComponentStory<typeof Badge> = (args) => {
  return (
    <div className="flex font-inter p-4 gap-4">
      <Badge variant="rounded" color="success">
        <Badge.Icon icon={LinkIcon} />
        <Badge.Label>Label</Badge.Label>
      </Badge>
    </div>
  )
}

export const Default = Template.bind({})