import Checkbox from '@/components/Checkbox/Checkbox'
import { FC, Fragment, ReactNode, useEffect, useMemo, useRef } from 'react'
import ReactTooltip from 'react-tooltip'
import { Pagination } from '../../Pagination'
import { BaseTable } from '../BaseTable'
import { ITableState, TableCtx } from './table-v2-ctx'

interface ITableProps {
  data: any[]
  headers: { label: string; value: string; [key: string]: any }[]
  totalPages?: number
  provider: { methods: any; state: ITableState; dispatch: any }
  emptyState?: ReactNode
  tableHeight?: string
  multiSelect?: boolean
  isLoading?: boolean
  pagination?: boolean
  tableClassNames?: string
  renderRow: (row: any) => ReactNode
  onClickRow?: (row: any) => void
  groupCallBack?: (data: any[]) => { [key: string]: any[] }
}

const PAGE_SIZE_OPTIONS = [5, 10, 25]

const TableV2: FC<ITableProps> = ({
  data = [],
  headers,
  provider,
  tableHeight,
  multiSelect,
  totalPages,
  isLoading,
  pagination,
  emptyState,
  tableClassNames,
  renderRow,
  onClickRow,
  groupCallBack
}) => {
  const tableRef = useRef(null)
  const wrapperRef = useRef(null)
  const checkboxRef = useRef(null)

  const showLastBorder = useMemo(
    () => tableRef.current?.clientHeight < wrapperRef.current?.clientHeight,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, renderRow]
  )

  useEffect(() => {
    wrapperRef.current.scrollTop = 0
  }, [provider?.state?.pageIndex])

  useEffect(() => {
    if (multiSelect) {
      checkboxRef.current = null
    }
  }, [data])

  const handleToggleSelectAllRows = () => {
    const isSelectedAll =
      data?.length &&
      data?.every((_item) => provider.state.selectedItems.some((selectedItem) => selectedItem?.id === _item?.id))
    const selectedItemIds = provider.state.selectedItems?.map((_item) => _item.id) || []
    const dataIds = data?.map((_item) => _item.id) || []

    if (pagination) {
      const checkedData = provider.state.selectedItems?.filter((_item) => !dataIds.includes(_item?.id))
      const unCheckedData = data?.filter((_item) => !selectedItemIds.includes(_item?.id))
      provider.methods.selectAllItems(
        isSelectedAll ? [...checkedData] : [...provider.state.selectedItems, ...unCheckedData]
      )
    } else {
      provider.methods.selectAllItems(isSelectedAll ? [] : [...data])
    }

    checkboxRef.current = null
  }

  const handleMultiSelect = (e, row, index) => {
    if (e.shiftKey && checkboxRef.current && row.id !== checkboxRef.current?.id) {
      let clone = [...provider.state.selectedItems]

      const start = index > checkboxRef.current?.index ? checkboxRef.current?.index : index
      const end = index > checkboxRef.current?.index ? index : checkboxRef.current?.index

      for (let i = start; i <= end; i++) {
        const isExist = provider.state.selectedItems.findIndex((item) => item.id === data?.[i]?.id) > -1
        if (e?.target?.checked && !isExist) {
          clone = [...clone, data[i]]
        } else if (!e?.target?.checked && isExist) {
          clone = clone.filter((item) => item.id !== data?.[i]?.id)
        }
      }
      provider.methods.selectAllItems([...clone])
    } else {
      provider.methods.setSelectedItem(row)
    }
    checkboxRef.current = { id: row?.id, index }
  }

  const handleClickRow = (_row) => () => {
    if (onClickRow) onClickRow(_row)
  }

  const renderTableBody = () => {
    if (isLoading && emptyState) {
      return emptyState
    }
    if (data?.length === 0 && emptyState) {
      const columnLength = multiSelect ? headers.length + 1 : headers.length
      return (
        <BaseTable.Body.Row extendedClass="h-[300px]">
          <BaseTable.Body.Row.Cell colSpan={columnLength}>
            <div className="flex flex-col justify-center">{emptyState}</div>
          </BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
      )
    }

    if (groupCallBack) {
      const groupedData = groupCallBack(data) || {}
      const columnLength = multiSelect ? headers.length + 1 : headers.length

      return Object.entries(groupedData).map(([key, items]) => (
        <Fragment key={`group-rows-${key}`}>
          <BaseTable.Body.Row>
            <BaseTable.Body.Row.Cell
              colSpan={columnLength}
              extendedClass="!px-3 !py-2 bg-[#F2F4F7] !text-xs font-semibold text-[#777675]"
            >
              {key}
            </BaseTable.Body.Row.Cell>
          </BaseTable.Body.Row>
          {items?.map((row, index) => (
            <Fragment key={`listing-table-${row.id}`}>
              <BaseTable.Body.Row
                onClick={handleClickRow(row)}
                extendedClass={`h-[57px] ${onClickRow && 'hover:bg-grey-100 cursor-pointer'} ${
                  row?.disabled && 'cursor-not-allowed opacity-30'
                } ${row?.classNames}`}
                data-tip={`listing-table-tooltip-${row.id}`}
                data-for={`listing-table-tooltip-${row.id}`}
              >
                {multiSelect && (
                  <BaseTable.Body.Row.Cell key="select-row">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        className="cursor-pointer relative w-4 h-4"
                        classNameCheckbox="rounded accent-dashboard-main w-4 h-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMultiSelect(e, row, index)
                        }}
                        isChecked={provider.state.selectedItems.some((selectedItem) => selectedItem?.id === row?.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                        }}
                      />
                    </div>
                  </BaseTable.Body.Row.Cell>
                )}
                {renderRow(row)}
              </BaseTable.Body.Row>
              {row?.disabled && (
                <ReactTooltip
                  id={`listing-table-tooltip-${row.id}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg"
                >
                  {row?.tooltip}
                </ReactTooltip>
              )}
            </Fragment>
          ))}
        </Fragment>
      ))
    }

    return data?.map((row, index) => (
      <Fragment key={`listing-table-${row.id}`}>
        <BaseTable.Body.Row
          onClick={handleClickRow(row)}
          extendedClass={`h-[57px] ${onClickRow && 'hover:bg-grey-100 cursor-pointer'} ${
            row?.disabled && 'cursor-not-allowed opacity-30'
          } ${row?.classNames}`}
          data-tip={`listing-table-tooltip-${row.id}`}
          data-for={`listing-table-tooltip-${row.id}`}
        >
          {multiSelect && (
            <BaseTable.Body.Row.Cell key="select-row">
              <div className="flex items-center justify-center">
                <Checkbox
                  className="cursor-pointer relative w-4 h-4"
                  classNameCheckbox="rounded accent-dashboard-main w-4 h-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMultiSelect(e, row, index)
                  }}
                  isChecked={provider.state.selectedItems.some((selectedItem) => selectedItem?.id === row?.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                  }}
                />
              </div>
            </BaseTable.Body.Row.Cell>
          )}
          {renderRow(row)}
        </BaseTable.Body.Row>
        {row?.disabled && (
          <ReactTooltip
            id={`listing-table-tooltip-${row.id}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="top"
            className="!opacity-100 !rounded-lg"
          >
            {row?.tooltip}
          </ReactTooltip>
        )}
      </Fragment>
    ))
  }

  const handleOnChangePageSize = (_e) => {
    provider.methods.setPageSize(_e.target.value)
    provider.methods.setPageIndex(0)
  }
  return (
    <TableCtx.Provider value={provider}>
      <div ref={wrapperRef} className={`${tableHeight ?? 'h-full'} overflow-y-auto border-[#CECECC] border rounded-lg`}>
        <BaseTable
          tableRef={tableRef}
          extendedClass={`${(data?.length || isLoading) && 'h-fit'} ${tableClassNames} ${
            showLastBorder ? 'border-x-0 border-t-0' : 'border-none'
          }`}
        >
          <BaseTable.Header extendedClass="w-full">
            <BaseTable.Header.Row>
              {multiSelect && (
                <BaseTable.Header.Row.Cell key="select-all" extendedClass="w-[4%]">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      className="cursor-pointer relative w-4 h-4"
                      classNameCheckbox="rounded accent-dashboard-main w-4 h-4"
                      onChange={handleToggleSelectAllRows}
                      isChecked={
                        data?.length &&
                        data?.every((_item) =>
                          provider.state.selectedItems.some((selectedItem) => selectedItem?.id === _item?.id)
                        )
                      }
                    />
                  </div>
                </BaseTable.Header.Row.Cell>
              )}
              {headers.map(({ label, value, ...rest }) => (
                <BaseTable.Header.Row.Cell key={value} {...rest}>
                  {label}
                </BaseTable.Header.Row.Cell>
              ))}
            </BaseTable.Header.Row>
          </BaseTable.Header>
          <BaseTable.Body extendedClass="w-full">{renderTableBody()}</BaseTable.Body>
        </BaseTable>
      </div>
      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={provider.state.pageIndex}
            totalPages={totalPages || 1}
            currentPageSize={provider.state.pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            // onChangePageSize={(e) => provider.methods.setPageSize(e.target.value)}
            onChangePageSize={handleOnChangePageSize}
            onPageChange={(pageNum) => provider.methods.setPageIndex(pageNum - 1)}
            onClickPreviousPage={() => provider.methods.prevPage()}
            onClickNextPage={() => provider.methods.nextPage()}
            onClickFirstPage={() => provider.methods.setPageIndex(0)}
            onClickLastPage={() => provider.methods.setPageIndex(totalPages - 1)}
            canPreviousPage={provider.state.pageIndex > 0}
            canNextPage={provider.state.pageIndex + 1 < totalPages}
          />
        </div>
      )}
    </TableCtx.Provider>
  )
}

export default TableV2
