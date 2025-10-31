import React, { useState } from 'react'
import Image from 'next/legacy/image'
import AddIcon from '@/public/svg/icons/add-icon-white.svg'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import ButtonDropdown from './ButtonDropdown'

export default {
  title: 'Molecules/Button Dropdown',
  component: ButtonDropdown,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof ButtonDropdown>

const Template: ComponentStory<typeof ButtonDropdown> = (args) => {
  const handleOnClick = (option) => {
    console.log(option)
  }

  const handleOnClickOption = (_option) => {
    console.log(_option)
  }
  return (
    <div className="flex font-inter p-4">
      <ButtonDropdown>
        <ButtonDropdown.CTA
          leadingIcon={<Image src={AddIcon} alt="Add Icon" />}
          label="Add Something"
          onClick={handleOnClick}
        />
        <ButtonDropdown.Options
          onClick={handleOnClickOption}
          options={[
            { value: 'ssd', label: 'sds' },
            { value: 'ssd', label: 'sds' },
            { value: 'ssd', label: 'sds' }
          ]}
        />
      </ButtonDropdown>
      {/* <ButtonDropdown
        label="Add New"
        onClick={handleOnClick}
        options={[
          { value: 'ssd', label: 'sds' },
          { value: 'ssd', label: 'sds' },
          { value: 'ssd', label: 'sds' }
        ]}
      /> */}
    </div>
  )
}

export const Default = Template.bind({})
// Default.args = {
//   isSyncing: false,
//   lastUpdated: '5 seconds ago'
// }
