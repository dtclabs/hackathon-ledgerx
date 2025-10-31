/* eslint-disable arrow-body-style */
import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import SimpleTable from './SimpleTable'
import { useTableHook } from './table-ctx'
import { useAsyncDebounce } from 'react-table'

export default {
  title: 'Molecules/Tables/Simple Table',
  component: SimpleTable,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof SimpleTable>

const columns = [
  {
    Header: 'Code',
    accessor: 'code'
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Type',
    accessor: 'type'
  },
  {
    Header: 'Description',
    accessor: 'description'
  }
]

const data = [
  { code: '200', name: 'Cat Account', type: 'Revenue', description: 'An Account about cats and stuff' },
  { code: '201', name: 'Dog Account', type: 'Expense', description: 'An account about dogs' },
  { code: '202', name: 'Whale Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Dolphin Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Dinosaur Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Hehe Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'WooWee Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Wow Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Game Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'PC Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Burger Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Cookie Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Doughnut Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Donut Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Cheesecake Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Pancake Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Paincake Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Gym Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Scam Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'ChewChew Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Treats Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Bao Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Ice Cream Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Haha Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '200', name: 'Cat Account', type: 'Revenue', description: 'An Account about cats and stuff' },
  { code: '201', name: 'Dog Account', type: 'Expense', description: 'An account about dogs' },
  { code: '202', name: 'Whale Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Dolphin Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Dinosaur Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Hehe Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'WooWee Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Wow Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Game Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'PC Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Burger Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Cookie Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Doughnut Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Donut Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Cheesecake Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Pancake Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Paincake Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Gym Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Scam Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'ChewChew Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Treats Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Bao Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Ice Cream Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Haha Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '200', name: 'Cat Account', type: 'Revenue', description: 'An Account about cats and stuff' },
  { code: '201', name: 'Dog Account', type: 'Expense', description: 'An account about dogs' },
  { code: '202', name: 'Whale Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Dolphin Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Dinosaur Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Hehe Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'WooWee Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Wow Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Game Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'PC Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Burger Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Cookie Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Doughnut Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Donut Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Cheesecake Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Pancake Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Paincake Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Gym Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Scam Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'ChewChew Account', type: 'Expense', description: 'Sales revenue' },
  { code: '200', name: 'Treats Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '201', name: 'Bao Account', type: 'Expense', description: 'Sales revenue' },
  { code: '202', name: 'Ice Cream Account', type: 'Revenue', description: 'Sales revenue' },
  { code: '203', name: 'Haha Account', type: 'Revenue', description: 'Sales revenue' }
]

const EmptyTable = () => (
  <div className="flex flex-col items-center justify-center h-[500px]">
    <div className="text-2xl font-bold">No data</div>
    <div className="text-gray-500">There is no data to display</div>
  </div>
)

const Template: ComponentStory<typeof SimpleTable> = (args) => {
  return (
    <div className="flex flex-col font-inter">
      <SimpleTable {...args} />
    </div>
  )
}

const PaginatedTableTemplate: ComponentStory<typeof SimpleTable> = (args) => {
  const provider = useTableHook({})

  const { state } = provider

  return (
    <div className="flex font-inter">
      <SimpleTable {...args} pagination multiSelect provider={provider} />
    </div>
  )
}

const PaginatedSearchTableTemplate: ComponentStory<typeof SimpleTable> = (args) => {
  const provider = useTableHook({})
  const [search, setSearch] = useState('')

  const onChange = (e) => {
    setSearch(e.target.value)
  }

  return (
    <div className="flex flex-col font-inter">
      <div className="mb-4 mt-2 ml-1">
        <input onChange={onChange} placeholder="Enter Something..." />
      </div>
      <SimpleTable {...args} pagination multiSelect provider={provider} clientSideSearch={search} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  data,
  columns
}

export const EmptyData = Template.bind({})
EmptyData.args = {
  data: [],
  columns,
  noData: <EmptyTable />
}

export const PaginatedTable = PaginatedTableTemplate.bind({})
PaginatedTable.args = {
  data,
  columns
}

export const PaginatedSearchTable = PaginatedSearchTableTemplate.bind({})
PaginatedSearchTable.args = {
  data,
  columns
}
