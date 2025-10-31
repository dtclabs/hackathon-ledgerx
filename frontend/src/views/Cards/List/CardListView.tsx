import { Input } from '@/components-v2'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { useTableHook } from '@/components-v2/molecules/Tables/TableV2/table-v2-ctx'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import TabItem from '@/components/TabsComponent/TabItem'
import CreditCardIcon from '@/public/svg/icons/credit-card-white-icon.svg'
import { useCreateCardMutation, useGetCardTransactionsQuery, useGetCardsQuery } from '@/slice/cards/cards-api'
import { CardType, ICard, ICardTransaction } from '@/slice/cards/cards-type'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { debounce } from 'lodash'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import CardsTable from './components/CardsTable'
import CreateCardBanner from './components/CreateCardBanner'
import CreateCardModal from './components/CreateCardModal'
import TransactionsTable from './components/TransactionsTable'
import { toast } from 'react-toastify'
import { CARDS, CARD_TRANSACTIONS } from './components/mock'

export const CREATE_CARD_OPTIONS = [
  { value: CardType.VIRTUAL, label: 'Virtual Card' },
  { value: CardType.PHYSICAL, label: 'Physical Card' }
]

const CardListPage = () => {
  const txnSearchRef = useRef(null)
  const cardSearchRef = useRef(null)
  const cardType = useRef(null)
  const isExistCard = useRef(false)

  const organizationId = useOrganizationId()
  const transactionTableProvider = useTableHook({})
  const cardTableProvider = useTableHook({})

  const createCardModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const [search, setSearch] = useState('')
  const [cardSearch, setCardSearch] = useState('')
  const [activeTab, setActiveTab] = useState('transactions')
  const [selectedTxn, setSelectedTxn] = useState<ICardTransaction>(null)
  const [selectedCard, setSelectedCard] = useState<ICard>(null)

  const { data: cards, isLoading: cardLoading } = useGetCardsQuery(
    { organizationId, params: { search: cardSearch } },
    { skip: !organizationId }
  )
  const { data: transactions, isLoading: txnLoading } = useGetCardTransactionsQuery(
    { organizationId, params: { search } },
    { skip: !organizationId }
  )
  const [createCard, createCardRes] = useCreateCardMutation()

  const TABS = useMemo(
    () => [
      {
        key: 'transactions',
        name: 'Transactions',
        count: transactions?.totalItems
      },
      {
        key: 'cards',
        name: 'Cards',
        count: cards?.totalItems
      }
    ],
    [transactions?.totalItems, cards?.totalItems]
  )

  useEffect(() => {
    if (cards?.totalItems > 0) {
      isExistCard.current = true
    }
  }, [cards?.totalItems])

  useEffect(() => {
    if (createCardRes.isSuccess) {
      toast.success('Create card successfully')
    }
    if (createCardRes.isError) {
      toast.error('Failed to create card')
    }
  }, [createCardRes.isSuccess, createCardRes.isError])

  useEffect(() => {
    if (activeTab) {
      setSearch('')
      setCardSearch('')
      if (txnSearchRef.current) txnSearchRef.current.value = ''
      if (cardSearchRef.current) cardSearchRef.current.value = ''
    }
  }, [activeTab])

  const onOpenCreateCard = (type?: { value: CardType }) => {
    cardType.current = type?.value || CardType.VIRTUAL
    createCardModalProvider.methods.setIsOpen(true)
  }

  const handleCreateCard = (data) => {
    createCard({
      organizationId,
      payload: {
        assignee: '',
        contactNumber: '',
        holderName: '',
        name: '',
        tags: []
      }
    })
  }

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>All Cards</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          <ButtonDropdown>  
            <ButtonDropdown.CTA
              height={40}
              label="Create Draft"
              leadingIcon={<Image src={CreditCardIcon} alt="card" width={16} height={16} />}
            />
            <ButtonDropdown.Options
              extendedClass="min-w-[165px]"
              options={CREATE_CARD_OPTIONS}
              onClick={onOpenCreateCard}
            />
          </ButtonDropdown>
        </Header.Right>
      </Header>
      <View.Content>
        {!cards?.totalItems && !isExistCard.current && <CreateCardBanner onStart={onOpenCreateCard} />}
        <UnderlineTabs
          tabs={TABS}
          active={activeTab}
          setActive={setActiveTab}
          classNameBtn="font-semibold text-sm px-6 py-[10px]"
          wrapperClassName="border-b-[1px] border-grey-200"
        >
          <TabItem key={TABS[0].key}>
            <div className="flex flex-col gap-2 mt-4">
              <div className="w-[340px]">
                <Input
                  placeholder="Search by merchant name"
                  onChange={debounce((e) => {
                    setSearch(e.target.value)
                  }, 300)}
                  isSearch
                  classNames="h-[32px]"
                  ref={txnSearchRef}
                />
              </div>
              <TransactionsTable
                // data={transactions?.items || []}
                data={CARD_TRANSACTIONS}
                isFiltered={!!search}
                isLoading={txnLoading}
                onClickRow={(txn) => setSelectedTxn(txn)}
                totalPages={transactions?.totalPages}
                provider={transactionTableProvider}
                cards={cards?.items}
                onCreateCard={onOpenCreateCard}
              />
            </div>
          </TabItem>
          <TabItem key={TABS[1].key}>
            <div className="flex flex-col gap-2 mt-4">
              <div className="w-[340px]">
                <Input
                  placeholder="Search by name, last 4 digits or tags"
                  onChange={debounce((e) => {
                    setCardSearch(e.target.value)
                  }, 300)}
                  isSearch
                  classNames="h-[32px]"
                  ref={cardSearchRef}
                />
              </div>
              <CardsTable
                // cards={cards?.items || []}
                cards={CARDS}
                isFiltered={!!search}
                isLoading={cardLoading}
                onClickRow={(card) => setSelectedCard(card)}
                totalPages={cards?.totalPages}
                provider={cardTableProvider}
                onCreateCard={onOpenCreateCard}
              />
            </div>
          </TabItem>
        </UnderlineTabs>
      </View.Content>
      <CreateCardModal
        provider={createCardModalProvider}
        cardType={cardType.current}
        createdCard={null}
        onCreateCard={handleCreateCard}
      />
    </>
  )
}

export default CardListPage
