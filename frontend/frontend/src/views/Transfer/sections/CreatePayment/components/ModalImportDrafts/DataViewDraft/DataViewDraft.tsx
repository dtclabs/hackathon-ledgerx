import { IPayment } from '@/api-v2/payment-api'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'
import { FC } from 'react'
import DraftItem from './DraftItem'

interface IDataViewDraftProps {
  data: IPayment[]
  fiatCurrency: any
  isLoading: boolean
  filters: any
  cryptocurrencyPrices: any
  tableRef: any
  tableProvider: any
  setSelectedRows: (row) => void
  onDownloadFile: (draftId: string, fileId: string) => void
  onCreateDraft: () => void
}

function multiSelectFilter(rows, columnIds, filterValue) {
  return filterValue.length === 0 ? rows : rows.filter((row) => filterValue.includes(row.original[columnIds]))
}
function destinationCurrencyFilter(rows, columnIds, filterValue) {
  return filterValue.length === 0
    ? rows
    : rows.filter((row) =>
        filterValue.includes(row.original?.destinationCurrency?.symbol || row.original?.destinationCurrency?.code)
      )
}
function recipientFilter(rows, columnIds, filterValue) {
  return filterValue.length === 0
    ? rows
    : rows.filter((row) =>
        filterValue.includes(
          `${row.original?.destinationAddress?.toLowerCase() || ''} ${
            row.original?.destinationName?.toLowerCase() || ''
          }`
        )
      )
}

const HEADERS = [
  { Header: 'Recipient', accessor: 'destinationAddress', filter: recipientFilter, extendedClass: 'pl-0 pr-[12px]' },
  { Header: 'Amount', accessor: 'cryptocurrency', filter: destinationCurrencyFilter, extendedClass: 'px-[12px]' },
  { Header: 'Account', accessor: 'type', extendedClass: 'px-[12px]' },
  { Header: 'Created On', accessor: 'created_on', extendedClass: 'px-[12px]' },
  { Header: 'Notes', accessor: 'notes', extendedClass: 'px-[12px]' },
  { Header: 'Tags', accessor: 'tags', extendedClass: 'px-[12px]' },
  { Header: 'Files', accessor: 'files', extendedClass: 'px-[12px]' },
  {
    Header: 'Status',
    accessor: 'status',
    filter: multiSelectFilter
  }
]

const DataViewDraft: FC<IDataViewDraftProps> = ({
  data,
  isLoading,
  fiatCurrency,
  setSelectedRows,
  cryptocurrencyPrices,
  tableRef,
  onDownloadFile,
  filters,
  tableProvider
}) => (
  <SimpleTable
    ref={tableRef}
    provider={tableProvider}
    noData={
      <EmptyData loading={isLoading}>
        <EmptyData.Icon />
        <EmptyData.Title>No payment draft found</EmptyData.Title>
        <EmptyData.Subtitle>Create payments and save them as draft.</EmptyData.Subtitle>
        {/* <EmptyData.CTA label="Create Draft" onClick={onCreateDraft} /> */}
      </EmptyData>
    }
    multiSelect
    tableHeight="h-[calc(100vh-360px)]"
    defaultPageSize={10}
    onRowSelected={(rows) => setSelectedRows(rows)}
    renderRow={(row) => {
      const selectionCell = row.cells?.find((c) => c.column.id === 'selection')
      const fiatAmount =
        parseFloat(row?.original.amount) * cryptocurrencyPrices[row?.original?.destinationCurrency?.symbol]
      return (
        <>
          <BaseTable.Body.Row.Cell {...selectionCell.getCellProps()}>
            {selectionCell.render('Cell')}
          </BaseTable.Body.Row.Cell>
          <DraftItem
            item={row?.original}
            fiatAmount={fiatAmount}
            fiatCurrency={fiatCurrency}
            onDownloadFile={onDownloadFile}
          />
        </>
      )
    }}
    columns={HEADERS}
    data={!isLoading ? data : [] || []}
    columnFilters={filters}
    pagination
  />
)

export default DataViewDraft
