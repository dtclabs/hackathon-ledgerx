import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { Table } from '@/components-v2/molecules/Tables/TableV2'
import PalmWithCoinsIcon from '@/public/svg/empty-data-icons/palm-with-coins.svg'
import BlackCaretIcon from '@/public/svg/icons/caret-icon.svg'
import CreditCardIcon from '@/public/svg/icons/credit-card-icon.svg'
import { ICard } from '@/slice/cards/cards-type'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import Image from 'next/image'
import React from 'react'
import { CREATE_CARD_OPTIONS } from '../../CardListView'
import CardItem from './CardItem'
import CardLoader from './CardLoader'

interface ICardsTable {
  cards: ICard[]
  provider: any
  isLoading: boolean
  totalPages: number
  isFiltered: boolean
  onClickRow: (row: ICard) => void
  onCreateCard: (type) => void
}

export const HEADERS = [
  { label: 'Name', value: 'name' },
  { label: 'Ends With', value: 'card_number' },
  { label: 'Assignee', value: 'assignee' },
  { label: 'Tags', value: 'tags' },
  { label: 'Status', value: 'status' }
]

const CardsTable: React.FC<ICardsTable> = ({
  cards,
  provider,
  isLoading,
  totalPages,
  isFiltered,
  onClickRow,
  onCreateCard
}) => {
  const showBanner = useAppSelector(showBannerSelector)

  return (
    <Table
      pagination
      data={cards}
      provider={provider}
      headers={HEADERS}
      isLoading={isLoading}
      multiSelect={false}
      onClickRow={onClickRow}
      totalPages={totalPages}
      tableClassNames="table-fixed"
      tableHeight={showBanner ? 'h-[calc(100vh-414px)]' : 'h-[calc(100vh-346px)]'}
      emptyState={
        isLoading ? (
          <CardLoader emptyRows={5} />
        ) : (
          <EmptyData loading={isLoading}>
            <EmptyData.Icon icon={PalmWithCoinsIcon} />
            <EmptyData.Title>{isFiltered ? 'No cards found' : 'You do not have any cards yet.'}</EmptyData.Title>
            {!isFiltered && <EmptyData.Subtitle>Create your card and start spending.</EmptyData.Subtitle>}
            {!isFiltered && (
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
      renderRow={(row) => <CardItem card={row} />}
    />
  )
}

export default CardsTable
