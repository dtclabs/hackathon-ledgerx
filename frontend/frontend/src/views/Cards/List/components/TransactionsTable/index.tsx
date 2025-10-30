import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { Table } from '@/components-v2/molecules/Tables/TableV2'
import PalmWithCoinsIcon from '@/public/svg/empty-data-icons/palm-with-coins.svg'
import BlackCaretIcon from '@/public/svg/icons/caret-icon.svg'
import CreditCardIcon from '@/public/svg/icons/credit-card-icon.svg'
import { CardTransactionStatus, ICard, ICardTransaction } from '@/slice/cards/cards-type'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { format } from 'date-fns'
import Image from 'next/image'
import React from 'react'
import { CREATE_CARD_OPTIONS } from '../../CardListView'
import TransactionItem from './TransactionItem'
import TransactionLoader from './TransactionLoader'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'

interface ITransactionsTable {
  data: ICardTransaction[]
  cards: ICard[]
  provider: any
  isLoading: boolean
  totalPages: number
  isFiltered: boolean
  onClickRow: (row: ICardTransaction) => void
  onCreateCard: (type) => void
}

export const HEADERS = [
  { label: 'Description', value: 'description' },
  { label: 'Amount', value: 'amount' },
  { label: 'Card Used', value: 'card_used' }
]

const groupDataByDate = (data: ICardTransaction[]) => {
  const groupedData = {}

  data?.forEach((item) => {
    const date = format(new Date(item.timestamp), 'dd MMM yyyy')
    if (!groupedData[date]) {
      groupedData[date] = [item]
    } else {
      groupedData[date] = [...groupedData[date], item]
    }
  })

  return groupedData
}

const TransactionsTable: React.FC<ITransactionsTable> = ({
  data,
  cards,
  provider,
  isLoading,
  totalPages,
  isFiltered,
  onClickRow,
  onCreateCard
}) => {
  const showBanner = useAppSelector(showBannerSelector)
  const { country: countrySetting, timezone: timeZoneSetting } = useAppSelector(orgSettingsSelector)

  return (
    <Table
      pagination
      data={data?.map((item) => ({
        ...item,
        classNames: item.status === CardTransactionStatus.REVERTED ? 'opacity-50' : ''
      }))}
      provider={provider}
      headers={HEADERS}
      isLoading={isLoading}
      multiSelect={false}
      onClickRow={onClickRow}
      totalPages={totalPages}
      groupCallBack={groupDataByDate}
      tableClassNames="table-fixed"
      tableHeight={showBanner ? 'h-[calc(100vh-414px)]' : 'h-[calc(100vh-346px)]'}
      emptyState={
        isLoading ? (
          <TransactionLoader emptyRows={5} />
        ) : (
          <EmptyData loading={isLoading}>
            <EmptyData.Icon icon={PalmWithCoinsIcon} />
            <EmptyData.Title>
              {!cards?.length
                ? 'You do not have any cards yet.'
                : isFiltered
                ? 'No transactions found'
                : 'You do not have any transactions yet.'}
            </EmptyData.Title>
            {!cards?.length && <EmptyData.Subtitle>Create your card and start spending.</EmptyData.Subtitle>}
            {!cards?.length && (
              <ButtonDropdown>
                <ButtonDropdown.CTA
                  height={40}
                  label="Create Draft"
                  variant="grey"
                  leadingIcon={<Image src={CreditCardIcon} alt="card" width={16} height={16} />}
                  caretIcon={BlackCaretIcon}
                />
                <ButtonDropdown.Options
                  extendedClass="min-w-[165px]"
                  options={CREATE_CARD_OPTIONS}
                  onClick={onCreateCard}
                />
              </ButtonDropdown>
            )}
          </EmptyData>
        )
      }
      renderRow={(row) => <TransactionItem transaction={row} countrySetting={countrySetting} />}
    />
  )
}

export default TransactionsTable
