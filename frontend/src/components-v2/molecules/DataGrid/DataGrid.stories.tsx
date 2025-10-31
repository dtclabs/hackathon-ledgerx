import React, { useState, useEffect } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import DataGrid from './DataGrid'
import type { ColumnDefs } from './DataGrid'
import useAgGrid from './useAgGrid'

export default {
  title: 'Molecules/Data Grid',
  component: DataGrid,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof DataGrid>

const Template: StoryFn<typeof DataGrid> = (args) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [isDataEmpty, setIsDataEmpty] = useState(false)
  const { gridRef, getSelectedRows, selectAllRows } = useAgGrid({
    isLoading
  })

  useEffect(() => {
    if (isMultiSelect) {
      selectAllRows()
    }
  }, [isMultiSelect])

  const columnDefs: ColumnDefs = [
    { field: 'nonce', checkboxSelection: true, hide: !isMultiSelect },
    { field: 'make', headerName: 'Make & Model', valueGetter: (p) => `${p.data.make} ${p.data.model}`, flex: 1 },
    { field: 'model', flex: 2 },
    { field: 'price', flex: 1 },
    { field: 'electric', flex: 2 }
  ]

  const onRowClicked = (_data) => {
    console.log('Row Clicked', _data)
  }

  const onRowSelected = (event) => {
    console.log('onRowSelected event', event)

    if (event.source === 'checkboxSelected') {
      const selectedState = event.node.isSelected()
      console.log(`Node is ${selectedState ? 'selected' : 'deselected'} by checkbox`)
    }
  }

  const toggleLoading = () => setIsLoading(!isLoading)

  const toggleNoData = () => setIsDataEmpty(!isDataEmpty)

  const toggleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect)
  }

  return (
    <div className="p-4 font-inter h-[300px]">
      <div className=" flex gap-4">
        <button className="mb-4 border" onClick={toggleMultiSelect} type="button">
          Toggle MultiSelect
        </button>
        <button className="mb-4 border" onClick={getSelectedRows} type="button">
          Get Selected
        </button>
        <button className="mb-4 border" onClick={toggleLoading} type="button">
          Toggle Loading
        </button>
        <button className="mb-4 border" onClick={toggleNoData} type="button">
          Toggle No Data
        </button>
      </div>
      <DataGrid
        debug
        gridRef={gridRef}
        isMultiSelect={isMultiSelect}
        columnDefs={columnDefs}
        onRowClicked={onRowClicked}
        onRowSelected={onRowSelected}
        rowData={
          isDataEmpty
            ? []
            : [
                { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
                { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
                { make: 'Toyota', model: 'Corolla', price: 29600, electric: false }
              ]
        }
      />
    </div>
  )
}
export const Default = Template.bind({})
Default.args = {}
