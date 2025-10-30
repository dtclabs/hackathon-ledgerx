import { FC, useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { GridOptions, RowClassParams, RowStyle } from 'ag-grid-community'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ExecuteTransactionSkeletonRow from './components/ExecuteTransactionSkeletonRow'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import styles from './gridTable.module.css'

const DisplayEmptyData = ({ isLoading }) =>
  isLoading ? (
    <ExecuteTransactionSkeletonRow isLoading={isLoading} emptyRows={2} />
  ) : (
    <EmptyData>
      <EmptyData.Title>No Transactions</EmptyData.Title>
      <EmptyData.Subtitle>Once you have created transactions, they will be displayed here</EmptyData.Subtitle>
    </EmptyData>
  )

interface IGridTable {
  data: any[]
  columns: any[]
  onRowClicked: any
  onSelectionChanged: any
  isLoading: boolean
  gridRef: any
  permissionMap?: any
  isMultiSelectEnabled?: boolean
  tooltipShowDelay?: number
  getRowStyle?: (params: RowClassParams) => RowStyle | undefined
}

const GridTable: FC<IGridTable> = ({
  data,
  columns,
  onRowClicked,
  onSelectionChanged,
  isLoading,
  gridRef,
  getRowStyle,
  isMultiSelectEnabled,
  tooltipShowDelay
}) => {
  const [isInitalized, setIsInitialized] = useState(false)

  const gridOptions: GridOptions = {
    defaultColDef: {
      flex: 1,
      sortable: false,
      resizable: false
    },
    headerHeight: 42.5,
    suppressDragLeaveHidesColumns: true
  }

  const onGridReady = () => {
    setIsInitialized(true)
  }

  useEffect(() => {
    if (isInitalized && isLoading) {
      gridRef.current.api.showNoRowsOverlay()
    }
  }, [isLoading])

  return (
    <AgGridReact
      getRowStyle={getRowStyle}
      className={`ag-theme-quartz ${styles['ag-theme-quartz']}`}
      ref={gridRef}
      rowSelection={isMultiSelectEnabled ? 'multiple' : 'single'}
      suppressRowClickSelection={isMultiSelectEnabled}
      rowHeight={data?.length === 1 ? 150 : 80}
      gridOptions={gridOptions}
      rowData={isLoading ? [] : data}
      columnDefs={columns}
      domLayout="autoHeight"
      onSelectionChanged={onSelectionChanged}
      noRowsOverlayComponent={DisplayEmptyData}
      noRowsOverlayComponentParams={{ isLoading, data }}
      onGridReady={onGridReady}
      tooltipShowDelay={tooltipShowDelay}
      onRowClicked={(row) => {
        if (row.event.defaultPrevented) {
          return null
        }
        if (!isMultiSelectEnabled) {
          return onRowClicked(row)
        }
        return null
      }}
    />
  )
}
export default GridTable
