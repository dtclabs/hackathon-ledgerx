import React, { useEffect, useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { StateReducer } from './index'
import { StateProvider, CounterDisplay, CounterButtons } from './StateReducer'
import { useStateReducer } from './useStateReducer'

export default {
  title: 'Molecules/State Reducer',
  component: StateReducer,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof StateReducer>

const Template: ComponentStory<typeof StateReducer> = (args) => {
  const ctx = useStateReducer({ initial: 0 })

  useEffect(() => {
    setTimeout(() => {
      ctx.setCount(5)
    }, 5000)
  }, [])

  return (
    <div className="flex flex-col font-inter">
      <StateProvider value={ctx}>
        <CounterDisplay />
        <CounterButtons />
      </StateProvider>
    </div>
  )
}

export const Default = Template.bind({})
