import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { Table } from '@/components-v2/molecules/Tables/TableV2'
import PalmWithCoinsIcon from '@/public/svg/empty-data-icons/palm-with-coins.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { format } from 'date-fns'
import PaymentHistoryItem from './PaymentHistoryItem'
import PaymentLoader from './PaymentLoader'

export const HEADERS = [
  { label: 'Recipient', value: 'recipient' },
  { label: 'Amount', value: 'amount' },
  { label: 'Sent From', value: 'sent_from' },
  { label: 'Status', value: 'status' }
]

const groupDataByDate = (data: any[]) => {
  const groupedData = {}

  data?.forEach((item) => {
    const date = format(new Date(item.executedAt), 'dd MMM yyyy')
    if (!groupedData[date]) {
      groupedData[date] = [item]
    } else {
      groupedData[date] = [...groupedData[date], item]
    }
  })

  return groupedData
}
const PaymentHistoryTable = ({
  data,
  provider,
  isLoading,
  onClickRow,
  totalPages,
  onClickEmptyDataCta,
  isFiltered
}) => {
  const showBanner = useAppSelector(showBannerSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)

  return (
    <Table
      data={data}
      provider={provider}
      headers={HEADERS}
      tableClassNames="table-fixed"
      tableHeight={showBanner ? 'h-[calc(100vh-362px)]' : 'h-[calc(100vh-294px)]'}
      isLoading={isLoading}
      pagination
      multiSelect={false}
      onClickRow={onClickRow}
      totalPages={totalPages}
      groupCallBack={groupDataByDate}
      emptyState={
        isLoading ? (
          <PaymentLoader emptyRows={5} />
        ) : (
          <EmptyData loading={isLoading}>
            <EmptyData.Icon icon={PalmWithCoinsIcon} />
            <EmptyData.Title>{isFiltered ? 'No Payments Found' : 'Make your first payment today!'}</EmptyData.Title>
            {!isFiltered && <EmptyData.CTA onClick={onClickEmptyDataCta} label="Make payment" />}
          </EmptyData>
        )
      }
      renderRow={(row) => <PaymentHistoryItem item={row} supportedChains={supportedChains} />}
    />
  )
}

export default PaymentHistoryTable
