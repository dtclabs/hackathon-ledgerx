import { FC, useState, useCallback, useMemo } from 'react'

import LoadingCellRenderer from './CustomLoader'
import { AgGridReact, AgGridReactProps } from 'ag-grid-react' // AG Grid Component
import 'ag-grid-community/styles/ag-grid.css' // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css' // Optional Theme applied to the grid

export type ColumnDefs = AgGridReactProps['columnDefs']

interface IDataGrid {
  gridRef: any
  isMultiSelect?: boolean
  rowData: any
  columnDefs: ColumnDefs
  onRowClicked?: any
  onRowSelected?: any
  debug?: boolean
}

const DataGrid: FC<IDataGrid> = ({
  gridRef,
  rowData,
  columnDefs,
  isMultiSelect = false,
  onRowClicked,
  onRowSelected,
  debug = false
}) => {
  // As Per AG Grid Docs, useMemo when defining table properties.
  // https://ag-grid.com/react-data-grid/react-hooks/
  const defaultColDef = useMemo(() => ({ sortable: false, resizable: false }), [])
  const data = useMemo(() => rowData, [rowData]) // Probably need to re-render on data change
  const colDefs = useMemo(() => columnDefs, [isMultiSelect])
  const onRowClickedCB = useCallback(onRowClicked, [])
  const onRowSelectedCB = useCallback(onRowSelected, [])
  const loadingCellRenderer = useCallback(LoadingCellRenderer, [])
  // Note - Maybe can do click events based on gridApi instead of passing callbacks

  return (
    <div
      className="ag-theme-quartz" // applying the grid theme
      style={{ height: '100%', width: '100%' }} // the grid will fill the size of the parent container
    >
      <AgGridReact
        debug={debug}
        ref={gridRef}
        rowData={data}
        columnDefs={colDefs}
        loadingCellRenderer={loadingCellRenderer}
        suppressMovableColumns
        suppressRowClickSelection
        suppressCellFocus
        defaultColDef={defaultColDef}
        rowSelection={isMultiSelect ? 'multiple' : 'single'} // These properties don't need to be memoized
        onRowClicked={onRowClickedCB}
        onRowSelected={onRowSelectedCB}
      />
    </div>
  )
}
export default DataGrid
