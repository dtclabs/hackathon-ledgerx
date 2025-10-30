import React from 'react'
import SuccessIcon from '@/public/svg/icons/success-icon.svg'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { EmptyData } from './EmptyData2'

export default {
  title: 'Molecules/Empty Data',
  component: EmptyData,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof EmptyData>

const Template: ComponentStory<typeof EmptyData> = (args) => (
  <div className="flex flex-col h-screen justify-center items-center font-inter">
    <div className="p-4 w-[650px] h-[400px] border flex justify-center">
      <EmptyData {...args}>
        <EmptyData.Icon icon={SuccessIcon} />
        <EmptyData.Title>This is some title</EmptyData.Title>
        <EmptyData.Subtitle>This is some title</EmptyData.Subtitle>
        <EmptyData.CTA label="This is some title" />
      </EmptyData>
    </div>
  </div>
)

export const Default = Template.bind({})
Default.args = {}

export const LoadingEmptyData = Template.bind({})
LoadingEmptyData.args = {
  loading: true
}
