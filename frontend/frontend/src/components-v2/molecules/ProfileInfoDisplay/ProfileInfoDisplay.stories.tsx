import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { ProfileInfoDisplay } from '.'

export default {
  title: 'Molecules/Profile Info Display',
  component: ProfileInfoDisplay,
  args: {},
  argTypes: {}
} as Meta<typeof ProfileInfoDisplay>

const Template: StoryFn<typeof ProfileInfoDisplay> = (args) => {
  const name = ''
  return (
    <div className="">
      <ProfileInfoDisplay>
        <ProfileInfoDisplay.Avatar />
        <ProfileInfoDisplay.Info>
          {name && <ProfileInfoDisplay.Info.Name>Hello</ProfileInfoDisplay.Info.Name>}
          <ProfileInfoDisplay.Info.Address address="0x0223232323" />
          {!name && <ProfileInfoDisplay.Info.Name color="secondary">Unknown</ProfileInfoDisplay.Info.Name>}
        </ProfileInfoDisplay.Info>
      </ProfileInfoDisplay>
    </div>
  )
}

export const Default = Template.bind({})
