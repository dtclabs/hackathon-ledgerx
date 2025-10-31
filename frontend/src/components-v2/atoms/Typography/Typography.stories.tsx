import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import Typography from './index'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Atoms/Typography',
  component: Typography,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Typography>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Typography> = (args) => <Typography {...args} />

export const Display1 = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Display1.args = {
  variant: 'display1',
  children: 'This is display 1'
}

export const Display2 = Template.bind({})
Display2.args = {
  variant: 'display2'
}

export const Display3 = Template.bind({})
Display3.args = {
  variant: 'display3'
}

export const Heading1 = Template.bind({})
Heading1.args = {
  variant: 'heading1'
}

export const Heading2 = Template.bind({})
Heading2.args = {
  variant: 'heading2'
}

export const Heading3 = Template.bind({})
Heading3.args = {
  variant: 'heading3'
}

export const Subtitle1 = Template.bind({})
Subtitle1.args = {
  variant: 'subtitle1'
}

export const Subtitle2 = Template.bind({})
Subtitle2.args = {
  variant: 'subtitle2'
}

export const Body1 = Template.bind({})
Body1.args = {
  variant: 'body1'
}

export const Body2 = Template.bind({})
Body2.args = {
  variant: 'body2'
}

export const Caption = Template.bind({})
Caption.args = {
  variant: 'caption'
}

export const Overline = Template.bind({})
Overline.args = {
  variant: 'overline'
}

export const Body1SemiBold = Template.bind({})
Body1SemiBold.args = {
  variant: 'body1',
  styleVariant: 'semibold'
}

export const Body1Underline = Template.bind({})
Body1Underline.args = {
  variant: 'body1',
  styleVariant: 'underline'
}

export const Body2Medium = Template.bind({})
Body2Medium.args = {
  variant: 'body2',
  styleVariant: 'medium'
}

export const Body2SemiBold = Template.bind({})
Body2SemiBold.args = {
  variant: 'body2',
  styleVariant: 'semibold'
}

export const Body2Underline = Template.bind({})
Body2Underline.args = {
  variant: 'body2',
  styleVariant: 'underline'
}

export const CaptionSemiBold = Template.bind({})
CaptionSemiBold.args = {
  variant: 'caption',
  styleVariant: 'semibold'
}

export const CaptionUnderline = Template.bind({})
CaptionUnderline.args = {
  variant: 'caption',
  styleVariant: 'underline'
}
