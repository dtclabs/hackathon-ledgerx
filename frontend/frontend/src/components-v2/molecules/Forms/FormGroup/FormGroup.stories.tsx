import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { FormGroup } from './index'
import { TextInput2 } from '../TextInput'

export default {
  title: 'Molecules/Forms/Form Group',
  component: FormGroup,
  args: {
    label: 'Email'
  },
  argTypes: {
    label: {
      type: 'string',
      description: 'Label of the form field',
      control: 'text'
    },
    required: {
      type: 'boolean',
      description: 'Display asterix if required',
      control: 'radio',
      options: [true, false]
    }
  }
} as Meta<typeof FormGroup>

const Template: StoryFn<typeof FormGroup> = (args) => (
  <FormGroup {...args}>
    <TextInput2 placeholder="Enter email" />
  </FormGroup>
)

export const Default = Template.bind({})