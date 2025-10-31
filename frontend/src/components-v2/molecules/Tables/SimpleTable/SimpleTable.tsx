/* eslint-disable no-unneeded-ternary */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-no-constructed-context-values */
import { uniqueId } from 'lodash'
import { Fragment, ReactNode, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { BaseTable } from '../BaseTable'
import { Pagination } from '../../Pagination'
import { TableCtx } from './table-ctx'
import { useTable, usePagination, useRowSelect, useGlobalFilter, useFilters } from 'react-table'
import ReactTooltip from 'react-tooltip'

interface ITableColumn {
  Header: any
  accessor: string
}

interface ITableData {
  [key: string]: any
}

interface ITableProps {
  columns: ITableColumn[]
  data: ITableData[]
  noData?: ReactNode
  renderRow?: any
  children?: ReactNode
  pagination?: boolean
  defaultPageSize?: number
  multiSelect?: boolean
  provider?: any
  onClickRow?: any
  tableHeight?: string
  onRowSelected?: any
  keepSelectedRows?: boolean
  isLoading?: boolean
  clientSideSearch?: string
  autoResetPage?: boolean
  columnFilters?: any
}

interface SimpleTableChildren extends React.FC<ITableProps> {
  Pagination: any
}

interface TableContextProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  data: any
}

const SimpleTable = forwardRef<any, ITableProps>(
  (
    {
      data = [],
      columns,
      noData,
      renderRow,
      pagination,
      defaultPageSize,
      multiSelect,
      tableHeight,
      onClickRow,
      onRowSelected,
      keepSelectedRows,
      provider,
      clientSideSearch,
      isLoading,
      autoResetPage = true,
      columnFilters
    },
    ref
  ) => {
    const checkboxRef = useRef(null)
    const tableRef = useRef(null)
    const wrapperRef = useRef(null)

    // To check should have border bottom or not
    const [isBigger, setIsBigger] = useState(tableRef.current?.clientHeight < wrapperRef.current?.clientHeight)
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      page,
      canPreviousPage,
      canNextPage,
      pageCount,
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
      selectedFlatRows,
      setGlobalFilter,
      state: { pageIndex, pageSize, globalFilter, selectedRowIds },
      preGlobalFilteredFlatRows,
      globalFilteredFlatRows,
      filteredFlatRows,
      ...rest
    } = useTable(
      {
        columns,
        data,
        initialState: {
          pageIndex: 0,
          pageSize: defaultPageSize ?? 5
        },
        autoResetPage
        // autoResetSelectedRows: keepSelectedRows ? false : true,
        // autoResetSelectedCell: keepSelectedRows ? false : true,
        // autoResetSelectedColumn: keepSelectedRows ? false : true
      },
      useGlobalFilter,
      useFilters,
      usePagination,
      useRowSelect,
      (hooks) => {
        // Add a checkbox selection column if enabled

        if (multiSelect) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          hooks.visibleColumns.push((columns) => [
            {
              id: 'selection',
              Header: ({ toggleRowSelected, isAllPageRowsSelected, page: _page }) => {
                const modifiedOnChange = (event) => {
                  _page.forEach((row) => {
                    if (!row.original.disabled) toggleRowSelected(row.id, event.currentTarget.checked)
                  })
                }

                let selectableRowsInCurrentPage = 0
                let selectedRowsInCurrentPage = 0
                _page.forEach((row) => {
                  if (row.isSelected) selectedRowsInCurrentPage++
                  if (!row.original.disabled) selectableRowsInCurrentPage++
                })

                const disabled = selectableRowsInCurrentPage === 0
                const checked =
                  (isAllPageRowsSelected || selectableRowsInCurrentPage === selectedRowsInCurrentPage) && !disabled
                return (
                  <input
                    className="rounded accent-dashboard-main flex-shrink-0 w-5 h-5"
                    type="checkbox"
                    disabled={disabled}
                    checked={checked}
                    onChange={(e) => {
                      e.stopPropagation()
                      modifiedOnChange(e)
                      checkboxRef.current = null
                    }}
                  />
                )
              },
              Cell: ({ row, rowsById }) => (
                <input
                  className="rounded accent-dashboard-main flex-shrink-0 w-5 h-5 disabled:cursor-not-allowed cursor-pointer"
                  type="checkbox"
                  disabled={row.original.disabled}
                  checked={row.original?.isSelected || row.isSelected}
                  onChange={(e) => {
                    e.stopPropagation()
                    onMultiChangeCheckBox(e, row, rowsById)
                  }}
                />
              )
            },
            ...columns
          ])
        }
      }
    )

    const onMultiChangeCheckBox = (e, row, rowsById) => {
      if (e.shiftKey && checkboxRef.current && row.id !== checkboxRef.current) {
        const start = row.id > checkboxRef.current ? checkboxRef.current : row.id
        const end = row.id > checkboxRef.current ? row.id : checkboxRef.current
        for (let i = start; i <= end; i++) {
          rowsById[i].toggleRowSelected(e.target.checked)
        }
      } else {
        row.toggleRowSelected(e.target.checked)
      }
      checkboxRef.current = row.id
    }

    useEffect(() => {
      setGlobalFilter(clientSideSearch)
    }, [clientSideSearch])

    useEffect(() => {
      if (columnFilters && Object.keys(columnFilters)?.length > 0) {
        Object.keys(columnFilters).forEach((columnId) => {
          rest.setFilter(columnId, columnFilters[columnId])
        })
      }
    }, [columnFilters])

    useEffect(() => {
      if (provider?.methods?.setFilteredItems) provider.methods.setFilteredItems(filteredFlatRows)
    }, [filteredFlatRows])

    useEffect(() => {
      if (multiSelect) {
        checkboxRef.current = null
      }
    }, [data, clientSideSearch])

    useEffect(() => {
      if (onRowSelected) {
        const selectedItems = preGlobalFilteredFlatRows.filter(
          (row) => selectedRowIds[row?.id] && !row?.original?.disabled
        )
        if (selectedItems.length > 0) {
          const parsedSelected = selectedItems.map((item) => item.original)
          onRowSelected(parsedSelected)
        } else {
          onRowSelected([])
        }
      }
    }, [selectedFlatRows.length])

    const handleOnClickRow = (_data) => () => {
      if (onClickRow) {
        onClickRow(_data)
      }
    }

    const renderTableBody = useMemo(() => {
      if (isLoading && noData) {
        return noData
      }

      if ((data.length === 0 || globalFilteredFlatRows.length === 0 || filteredFlatRows.length === 0) && noData) {
        const columnLength = multiSelect ? columns.length + 1 : columns.length
        return (
          <BaseTable.Body.Row extendedClass="h-[300px]">
            <BaseTable.Body.Row.Cell colSpan={columnLength}>
              <div className="flex justify-center">{noData}</div>
            </BaseTable.Body.Row.Cell>
          </BaseTable.Body.Row>
        )
      }

      const emptyRows = []

      const pages = page?.map((row, index) => {
        prepareRow(row)
        if (renderRow)
          return (
            <Fragment key={uniqueId(`simple-table-row-${index}`)}>
              <BaseTable.Body.Row
                onClick={handleOnClickRow(row)}
                {...row.getRowProps()}
                extendedClass={`h-[57px] ${onClickRow && 'hover:bg-grey-100 cursor-pointer'} ${
                  row.original?.disabled && ' cursor-not-allowed opacity-30'
                }`}
                data-tip={row.id}
                data-for={row.id}
              >
                {renderRow(row)}
              </BaseTable.Body.Row>
              {row.original?.disabled && (
                <ReactTooltip
                  id={row.id}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg !border-b-[1px]"
                >
                  {row.original?.tooltip}
                </ReactTooltip>
              )}
            </Fragment>
          )
        return (
          <BaseTable.Body.Row onClick={handleOnClickRow(row)} {...row.getRowProps()} extendedClass="h-[57px]">
            {row.cells.map((cell) => (
              <BaseTable.Body.Row.Cell {...cell.getCellProps()}>{cell.render('Cell')}</BaseTable.Body.Row.Cell>
            ))}
          </BaseTable.Body.Row>
        )
      })
      return [...pages, ...emptyRows]
    }, [data, globalFilteredFlatRows.length, isLoading, noData, page, prepareRow, renderRow])

    const onClickFirstPage = () => gotoPage(0)

    const onClickLastPage = () => gotoPage(pageCount - 1)

    const onClickChangePage = (pageNumber) => {
      wrapperRef.current.scrollTop = 0
      gotoPage(pageNumber - 1)
    }

    const onClickNextPage = () => {
      nextPage()
      wrapperRef.current.scrollTop = 0
    }
    const onClickPreviousPage = () => {
      previousPage()
      wrapperRef.current.scrollTop = 0
    }

    const pageSizeOptions = [5, 10, 20]

    const onChangePageSize = (e) => {
      provider?.methods?.setPageSize(e.target.value)
      setPageSize(Number(e.target.value))
    }

    useEffect(() => {
      setIsBigger(tableRef.current?.clientHeight < wrapperRef.current?.clientHeight)
    }, [pageSize, renderRow])

    // TODO - Check we need this
    useImperativeHandle(ref, () => ({
      toggleAllRowsSelected(value: boolean) {
        filteredFlatRows.forEach((row) => {
          if (!row.original.disabled) rest.toggleRowSelected(row.id, value)
        })
      }
    }))

    return (
      <TableCtx.Provider value={provider}>
        <div className="w-full h-full flex flex-col">
          <div
            ref={wrapperRef}
            className={`${tableHeight ?? 'h-full'} overflow-auto scrollbar border-[#CECECC] border rounded-lg`}
          >
            <BaseTable
              {...getTableProps()}
              tableRef={tableRef}
              extendedClass={`${!isBigger ? 'border-none' : 'border-x-0 border-t-0'} ${
                (page?.length || isLoading) && 'h-fit'
              }`}
            >
              <BaseTable.Header>
                {headerGroups.map((headerGroup) => (
                  <BaseTable.Header.Row {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => {
                      const { colSpan, ...restOfHeaderProps } = column.getHeaderProps()

                      return (
                        <BaseTable.Header.Row.Cell
                          extendedClass={column?.extendedClass}
                          colSpan={column.colSpan ?? 1}
                          {...restOfHeaderProps}
                        >
                          {column.render('Header')}
                        </BaseTable.Header.Row.Cell>
                      )
                    })}
                  </BaseTable.Header.Row>
                ))}
              </BaseTable.Header>
              <BaseTable.Body {...getTableBodyProps()}>{renderTableBody}</BaseTable.Body>
            </BaseTable>
          </div>
          {pagination && (
            <div className="mt-4">
              <Pagination
                currentPage={pageIndex}
                totalPages={pageCount === 0 ? 1 : pageCount}
                currentPageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onChangePageSize={onChangePageSize}
                onPageChange={(pageNum) => onClickChangePage(pageNum)}
                onClickPreviousPage={onClickPreviousPage}
                onClickNextPage={onClickNextPage}
                onClickFirstPage={onClickFirstPage}
                onClickLastPage={onClickLastPage}
                canPreviousPage={canPreviousPage}
                canNextPage={canNextPage}
              />
            </div>
          )}
        </div>
      </TableCtx.Provider>
    )
  }
)

export default SimpleTable
