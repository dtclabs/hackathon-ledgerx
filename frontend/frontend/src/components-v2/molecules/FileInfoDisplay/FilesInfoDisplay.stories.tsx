import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { FileInfoDisplay } from '.'

export default {
  title: 'Molecules/File Info Display',
  component: FileInfoDisplay,
  args: {},
  argTypes: {}
} as Meta<typeof FileInfoDisplay>

const files = [
  { filename: 'test', path: 'image/png', name: 'test.png' },
  { filename: 'test', path: 'image/png', name: 'test.png' },
  { filename: 'test', path: 'image/png', name: 'test.png' }
]

const Template: StoryFn<typeof FileInfoDisplay> = (args) => {
  const onClickFile = (file) => {
    console.log(file)
  }
  const onDownloadFile = (file) => {
    console.log(file)
  }
  return (
    <div className="">
      <FileInfoDisplay onClickFile={onClickFile} onDownloadFile={onDownloadFile} id="sss" files={files} />
    </div>
  )
}

export const Default = Template.bind({})
