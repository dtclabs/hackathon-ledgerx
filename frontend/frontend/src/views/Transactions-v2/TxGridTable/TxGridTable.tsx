/* eslint-disable react/no-array-index-key */
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { TablePagination } from '@/components/TablePagination'
import TxGridTableRow from './TxGridTableRow'
import { Pagination } from '@/components-v2/Pagination-v2'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import Checkbox from '@/components/Checkbox/Checkbox'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import TransactionsLoading from '../TransactionLoading'
import { parseISO, compareDesc } from 'date-fns'
import { ITagHandler, TRANSACTION_TABLE_COLUMNS_LIST, TransactionTableColumn } from '../interface'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import InfoIcon from '@/public/svg/icons/info-icon-circle-grey.svg'
import Typography from '@/components-v2/atoms/Typography'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { ITag } from '@/slice/tags/tag-type'

interface IFinancialTxTableProps {
  data: any
  currentPage: number
  totalItems: number
  totalPages: number
  limit: number
  handleOnePageBack: any
  handleOnePageForward: any
  handleGoToPage: any
  handleOnClickRow: any
  chartOfAccounts: any
  onClickAddContact: any
  handleOnClickCheckbox: any
  checkedItems: any
  onClickChangeCategory: any
  onSelectAllTx: () => void
  originalData: any
  handleChangeLimit: (limit: number) => void
  onRetryExport: () => void
  loading: boolean
  txnTableColumns: any
  tagsHandler: ITagHandler
  tagsMap: { [id: string]: ITag[] }
  onInitTempTags: (txnId, tags) => void
}

const TableHeader = ({ label, value, style, ...rest }) => (
  <th
    style={{ ...style }}
    className={`px-2 text-left border-[#CECECC] border-b-1 border-[1px] border-t-0 py-3 h-12 ${
      value === 'checkbox' ? 'border-r-1' : 'border-r-0'
    } ${label === 'Invoice' ? 'border-l-1' : 'border-l-0'}`}
    key={value}
  >
    <Typography
      variant="caption"
      styleVariant="semibold"
      classNames={`whitespace-nowrap tracking-wider flex items-center ${label === 'Invoice' ? 'justify-center' : ''}`}
    >
      {label}
      {rest?.tooltip && (
        <div className="ml-2 flex items-center">
          <Image
            data-tip={`txn-grid-header-tooltip-${value}`}
            data-for={`txn-grid-header-tooltip-${value}`}
            src={InfoIcon}
            width={14}
            height={14}
          />
          <ReactTooltip
            id={`txn-grid-header-tooltip-${value}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg max-w-[240px]"
          >
            <Typography variant="caption" styleVariant="regular" classNames="whitespace-normal">
              {rest?.tooltip}
            </Typography>
          </ReactTooltip>
        </div>
      )}
    </Typography>
  </th>
)

const TxGridTable: FC<IFinancialTxTableProps> = ({
  data,
  currentPage,
  totalItems,
  totalPages,
  limit = 25,
  handleGoToPage,
  handleOnePageBack,
  handleOnePageForward,
  handleOnClickRow,
  chartOfAccounts,
  onClickAddContact,
  handleOnClickCheckbox,
  onClickChangeCategory,
  onSelectAllTx,
  checkedItems,
  originalData,
  handleChangeLimit,
  onRetryExport,
  loading,
  txnTableColumns,
  tagsHandler,
  tagsMap,
  onInitTempTags
}) => {
  const tableRef = useRef(null)
  const showBanner = useAppSelector(showBannerSelector)
  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))

  useEffect(() => {
    tableRef.current.scrollTop = 0
  }, [currentPage])

  const onClickRow = (_row) => () => {
    handleOnClickRow(_row)
  }

  const handleOnClickAddContact = (_data) => {
    onClickAddContact(_data)
  }

  const [parentHash, setParentHash] = useState('')

  const handleHoverParent = (hash) => {
    setParentHash(hash)
  }

  const HEADERS_MAP = useMemo(
    () =>
      TRANSACTION_TABLE_COLUMNS_LIST.filter((header) => {
        if (!isAnnotationEnabled && header.value === TransactionTableColumn.TAGS) {
          return false
        }
        return txnTableColumns[header.value] || header.isDefault
      }).map((header) => {
        if (header.value === 'checkbox') {
          return {
            ...header,
            label: (
              <div className="flex items-center justify-center">
                <Checkbox
                  className="cursor-pointer relative w-4 h-4"
                  classNameCheckbox="rounded accent-dashboard-main w-4 h-4"
                  onChange={onSelectAllTx}
                  isChecked={originalData?.every((item) => checkedItems[item.id])}
                  indeterminate={
                    !originalData?.every((item) => checkedItems[item.id]) &&
                    originalData?.some((item) => checkedItems[item.id])
                  }
                  indeterminateClassName="top-[7px] h-[2px] left-[3px]"
                />
              </div>
            )
          }
        }
        return { ...header }
      }),
    [checkedItems, originalData, txnTableColumns]
  )

  const rowsToCount = data ?? []
  const totalLength = data.length === 0 ? 0 : rowsToCount.reduce((total, innerArray) => total + innerArray.length, 0)
  const emptyRows = limit - totalLength

  function sortByTimestampDescending(_data) {
    return _data.sort((a, b) => {
      const dateA = parseISO(a[0]?.financialTransactionParent?.valueTimestamp)
      const dateB = parseISO(b[0]?.financialTransactionParent?.valueTimestamp)
      return compareDesc(dateA, dateB)
    })
  }

  return (
    <>
      <div
        ref={tableRef}
        className={`w-full ${
          isFeatureEnabledForThisEnv
            ? showBanner
              ? 'h-[calc(100vh-460px)]'
              : 'h-[calc(100vh-382px)]'
            : showBanner
            ? 'h-[calc(100vh-396px)]'
            : 'h-[calc(100vh-332px)]'
        } overflow-auto scrollbar border-y border-[#CECECC] border-[1px]`}
        style={{ border: '1px solid #CECECC' }}
      >
        <table className="min-w-fit w-full text-xs leading-4 rounded-[4px] border-0 font-medium">
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }} className="bg-[#FBFAFA]">
            <tr>
              {HEADERS_MAP.map(({ value, label, style, ...rest }, index) => (
                <TableHeader key={index} value={value} label={label} style={style} {...rest} />
              ))}
            </tr>
          </thead>
          {loading ? (
            <TransactionsLoading emptyRows={emptyRows} txnTableColumns={txnTableColumns} />
          ) : (
            sortByTimestampDescending(data).map((rowGroup) => {
              const isIgnored = rowGroup.some((childRow) => childRow.status === 'ignored')

              if (rowGroup.length > 1) {
                const childData = []

                rowGroup.slice(1).forEach((childRow) => {
                  const isChecked = checkedItems[childRow.id]

                  childData.push(
                    <TxGridTableRow
                      key={childRow.id}
                      chartOfAccounts={chartOfAccounts}
                      data={childRow}
                      batchSize={0}
                      isChild
                      onClickRow={onClickRow}
                      onClickCheckbox={handleOnClickCheckbox}
                      handleOnClickAddContact={handleOnClickAddContact}
                      isChecked={isChecked}
                      onClickChangeCategory={onClickChangeCategory}
                      isIgnored={isIgnored}
                      parentHash={parentHash}
                      onHoverParent={handleHoverParent}
                      isLastRow={childRow.isLastRow}
                      tabelRef={tableRef}
                      onRetryExport={onRetryExport}
                      txnTableColumns={txnTableColumns}
                      tagsHandler={tagsHandler}
                      onInitTempTags={onInitTempTags}
                      tags={tagsMap[childRow.id]}
                    />
                  )
                })

                const isChecked = checkedItems[rowGroup[0].id]

                return (
                  <tbody className="border-0">
                    <TxGridTableRow
                      key={rowGroup[0].id}
                      data={rowGroup[0]}
                      chartOfAccounts={chartOfAccounts}
                      batchSize={rowGroup.length}
                      onClickRow={onClickRow}
                      handleOnClickAddContact={handleOnClickAddContact}
                      onClickCheckbox={handleOnClickCheckbox}
                      isChecked={isChecked}
                      onClickChangeCategory={onClickChangeCategory}
                      isIgnored={isIgnored}
                      parentHash={parentHash}
                      onHoverParent={handleHoverParent}
                      isLastRow={rowGroup[0].isLastRow}
                      tabelRef={tableRef}
                      onRetryExport={onRetryExport}
                      txnTableColumns={txnTableColumns}
                      tagsHandler={tagsHandler}
                      tags={tagsMap[rowGroup[0].id]}
                      onInitTempTags={onInitTempTags}
                    />
                    {childData}
                  </tbody>
                )
              }

              const isChecked = checkedItems[rowGroup[0].id]

              return (
                <tbody className="border-0">
                  <TxGridTableRow
                    key={rowGroup[0].id}
                    data={rowGroup[0]}
                    batchSize={0}
                    chartOfAccounts={chartOfAccounts}
                    onClickRow={onClickRow}
                    onClickCheckbox={handleOnClickCheckbox}
                    handleOnClickAddContact={handleOnClickAddContact}
                    isChecked={isChecked}
                    onClickChangeCategory={onClickChangeCategory}
                    isIgnored={isIgnored}
                    parentHash={parentHash}
                    onHoverParent={handleHoverParent}
                    isLastRow={rowGroup[0].isLastRow}
                    tabelRef={tableRef}
                    onRetryExport={onRetryExport}
                    txnTableColumns={txnTableColumns}
                    tagsHandler={tagsHandler}
                    onInitTempTags={onInitTempTags}
                    tags={tagsMap[rowGroup[0].id]}
                  />
                </tbody>
              )
            })
          )}
        </table>
      </div>

      {!loading && data?.length && (
        <div className="mt-4 flex justify-start">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage + 1}
            onPageChange={(page, direction) => {
              if (direction === 'forward') {
                handleOnePageForward(page)
              } else {
                handleOnePageBack(page)
              }
            }}
            rowsPerPage={limit}
            rowsPerPageOptions={[25, 50, 100]}
            onRowsPerPageChange={(row) => {
              handleChangeLimit(row)
            }}
            onSelectPage={handleGoToPage}
          />
        </div>
      )}
    </>
  )
}
export default TxGridTable
