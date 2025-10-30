import { GridOptions } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import './styles/gridTable.css'
import { AgGridReact } from 'ag-grid-react'
import { FC, useEffect, useMemo, useRef } from 'react'
import { IGridTable } from './GridTable.type'
// import styles from './styles/gridTable.module.css'
import GridEmptyState from './GridEmptyState'

const GridTable: FC<IGridTable<any>> = ({
  id,
  data,
  columns = [],
  gridRef,
  gridSize = { height: '100%', width: '100%' },
  classNames,
  isMultiple,
  isLoading,
  emptyState,
  pagination,
  rowHeight,
  rowLoadingComponent,
  domLayout,
  emptyRows,
  hasCheckBox = false,
  dragColumn = false,
  sortable = false,
  isCheckboxEnabled,
  onRowClick
}) => {
  const init = useRef(false)

  const gridOptions: GridOptions = useMemo(
    () => ({
      defaultColDef: {
        flex: 1,
        sortable,
        resizable: false,
        rowDrag: false
      },
      headerHeight: 44,
      suppressDragLeaveHidesColumns: true,
      suppressRowClickSelection: true,
      suppressCellFocus: true
    }),
    []
  )

  const columnsDef = useMemo(
    () => [
      {
        hide: !hasCheckBox,
        headerCheckboxSelection: (params) => hasCheckBox && params.api.getRowGroupColumns().length === 0,
        checkboxSelection: (params) => {
          const isEnabled = isCheckboxEnabled ? isCheckboxEnabled(params.data) : true
          return hasCheckBox && isEnabled && params.api.getRowGroupColumns().length === 0
        },
        maxWidth: 40,
        cellStyle: { display: 'flex', alignItems: 'center' },
        showDisabledCheckboxes: true
      },
      ...columns.map((col) => ({
        ...col,
        suppressMovable: !dragColumn,
        cellStyle: (params) =>
          typeof col?.cellStyle === 'function'
            ? { display: 'flex', alignItems: 'center', ...col?.cellStyle(params) }
            : { display: 'flex', alignItems: 'center', ...col?.cellStyle }
      }))
    ],
    [columns]
  )

  const handleOnRowClick = (row) => {
    if (row.event.defaultPrevented) {
      return null
    }
    if (!isMultiple && row?.data) {
      return onRowClick(row.data)
    }
    return null
  }

  useEffect(() => {
    if (init.current && isLoading) {
      gridRef.current.api.showNoRowsOverlay()
    }
  }, [isLoading])

  return (
    <div style={gridSize} className={`${classNames} ag-theme-quartz`}>
      <AgGridReact
        ref={gridRef}
        rowData={isLoading ? [] : data}
        columnDefs={columnsDef}
        gridOptions={gridOptions}
        pagination={pagination}
        noRowsOverlayComponent={GridEmptyState}
        rowSelection={isMultiple ? 'multiple' : 'single'}
        rowHeight={data?.length > 0 && (rowHeight || 50)}
        onRowClicked={handleOnRowClick}
        domLayout={domLayout}
        paginationPageSize={20}
        viewportRowModelPageSize={1}
        viewportRowModelBufferSize={0}
        onGridReady={(e) => {
          init.current = true
        }}
        noRowsOverlayComponentParams={{
          id,
          isLoading,
          gridRef,
          hasCheckBox,
          emptyState,
          rowLoadingComponent,
          emptyRows,
          rowHeight
        }}
      />
    </div>
  )
}

export default GridTable
