import TabItem from '@/components/TabsComponent/TabItem'
import Tabs from '@/components/TabsComponent/Tabs'
import useFreeContext from '@/hooks/useFreeContext'
import { useUSDPrice } from '@/hooks/useUSDPrice'
import { CHAINID } from '@/constants/chains'
import { useAppDispatch, useAppSelector } from '@/state'
import { setCurrentPage } from '@/state/global/actions'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Loader from '@/components/Loader/Loader'
import Modal from '@/components/Modal'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import NotificationSending from '@/components/NotificationSending/NotificationSending'
import SyncButton from '@/components/SyncButton/SyncButton'
import { useDebounce } from '@/hooks/useDebounce'
import { useTransaction } from '@/hooks/useTransaction'
import { globalSelectors } from '@/state/global/reducer'
import { EOptions } from '@/views/Wallets/types'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import { EProcessStatus } from '../../Organization/interface'
import AllTransactions from './components/AllTransactions'
import IncomingTransactions from './components/IncomingTransactions'
import OutgoingTransactions from './components/OutgoingTransactions'
import QueueTransactions from './components/QueueTransactions'
import DropDownFilterTransaction from './components/SelectFilterTransaction/DropdownFilterTransaction'
import { transactionsTabs } from './data'
import { useGetFinancialTransactionsQuery } from '@/api-v2/financial-tx-api'
import { filtersSearchSelector, setFiltersSearch } from '@/slice/categories/categories-slice'
import { useGetCategoriesQuery } from '@/api-v2/categories-api'
import {
  useGetListFilterAddressesQuery,
  useGetQueueTransactionsQuery,
  useGetTransactionsQuery
} from '@/api-v2/old-tx-api'
import { ETransactionType, ITransaction } from '@/slice/old-tx/interface'
import {
  filterItemsSelector,
  setFilterFromItemList,
  setFilterToItemList,
  setFilterTokenItemList,
  setListFilter
} from '@/slice/old-tx/transactions-slide'
import Typography from '@/components-v2/atoms/Typography'

const Transactions: React.FC = () => {
  // Hooks
  const organizationId = useOrganizationId()
  const { control, resetField } = useForm<{ searchKey: string }>({ defaultValues: { searchKey: '' } })
  const searchKey = useWatch({ control, name: 'searchKey' })
  const [activeTab, setActiveTab] = useState<string>(ETransactionType.ALL)

  // Custom hooks and context
  const { library, chainId: connectedChainId, account } = useWeb3React()
  const [chainId, setChainId] = useState(1)

  const { price } = useUSDPrice()
  const { tokens, networkConfig } = useFreeContext()
  const { pending, debouncedValue: search, setDebouncedValue } = useDebounce(searchKey, 500)
  const [page, setPage] = useState(0)
  const dispatch = useAppDispatch()
  const offset = process.env.NEXT_PUBLIC_MAXIMUM_TRANSACTIONS_HISTORY || '20'

  const router = useRouter()

  const { data: categories } = useGetCategoriesQuery(
    {
      orgId: organizationId,
      params: {
        size: 999
      }
    },
    { skip: !organizationId }
  )

  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const sourceOfFunds = useAppSelector(walletsSelector)
  const [showImportFund, setShowImportFund] = useState(false)
  const [modal, setModal] = useState<EOptions>(EOptions.OPTIONS)
  const [responseError, setResponseError] = useState<string>()
  const [status, setStatus] = useState<EProcessStatus>(EProcessStatus.PENDING)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const currentPage = useAppSelector(globalSelectors.currentPageSelector)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [openDate, setOpenDate] = useState(false)
  const [timeSubmitted, setTimeSubmitted] = useState(false)
  const [showErrorMsg, setShowErrorMsg] = useState(false)
  const [submit, setSubmit] = useState(false)
  const [resetFilter, setResetFilter] = useState(0)
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const filtersSearch = useAppSelector(filtersSearchSelector)
  const filterItems = useAppSelector(filterItemsSelector)

  const [showDropdownExportCsv, setShowDropDownExportCsv] = useState(false)
  const [isExportCsv, setIsExportCsv] = useState(false)
  const [isExportCsvXero, setIsExportCsvXero] = useState(false)
  const [selectedListIncoming, setSelectedListIncoming] = useState<ITransaction[]>([])
  const [selectedListOutgoing, setSelectedListOutgoing] = useState<ITransaction[]>([])
  const [selectedListPending, setSelectedListPending] = useState<ITransaction[]>([])
  const [selectedListHistory, setSelectedListHistory] = useState<ITransaction[]>([])
  const [selectedXeroList, setSelectedXeroList] = useState<ITransaction[]>([])
  const [exportWarning, setExportWarning] = useState(false)

  useEffect(() => {
    if (account && connectedChainId) {
      setChainId(connectedChainId)
    } else {
      const currentChainId = window.localStorage.getItem(CHAINID)
      if (currentChainId) {
        setChainId(parseInt(currentChainId))
      } else {
        setChainId(1)
      }
    }
  }, [connectedChainId])

  const {
    executeLoading,
    confirmLoading,
    nonExecuteLoading,
    error,
    handleCloseModal,
    getCurrentNonce,
    handleExecuted,
    handleReject,
    handleSign,
    isSource,
    isTransactionExecutable,
    isTransactionSignedByAddress,
    reset,
    setShowError,
    showError,
    setShowSuccessExecute,
    showSuccessExecute
  } = useTransaction()

  const {
    data: allTransactions,
    isLoading: transactionLoading,
    refetch: fetchAllTransactions
  } = useGetTransactionsQuery(
    {
      organizationId,
      price,
      tokens,
      params: {
        startTime: startDate && endDate ? `${format(new Date(startDate), 'yyyy-MM-dd ')} 00:00:00` : '',
        endTime: startDate && endDate ? `${format(new Date(endDate), 'yyyy-MM-dd ')} 23:59:59` : '',
        symbols: filterItems.tokenList.length ? filterItems.tokenList.map((e) => e.name).join() : '',
        page,
        size: offset,
        search,
        chainId,
        categoryIds: filtersSearch && filtersSearch.length ? filtersSearch.map((item) => item.id).join() : undefined,
        fromAddress: filterItems.fromList.join(),
        toAddress: filterItems.toList.join()
      }
    },
    { skip: !organizationId || !chainId || !price }
  )
  const {
    data: outgoingTransactions,
    isLoading: getOutgoingTransactionsLoading,
    refetch: fetchOutgoingTransactions
  } = useGetTransactionsQuery(
    {
      organizationId,
      price,
      tokens,
      params: { page, size: offset, search, type: ETransactionType.OUTGOING, chainId }
    },
    { skip: !organizationId || !chainId || !price }
  )
  const {
    data: incomingTransactions,
    isLoading: getIncomingTransactionsLoading,
    refetch: fetchIncomingTransactions
  } = useGetTransactionsQuery(
    {
      organizationId,
      price,
      tokens,
      params: { page, size: offset, search, type: ETransactionType.INCOMING, chainId }
    },
    { skip: !organizationId || !chainId || !price }
  )

  const {
    data: pendingTransactions,
    isLoading: getAllPendingTransactionsLoading,
    refetch: fetchPendingTransactions
  } = useGetQueueTransactionsQuery(
    {
      organizationId,
      price,
      tokens,
      params: { page, size: offset, search, type: ETransactionType.QUEUE, chainId }
    },
    { skip: !organizationId || !chainId || !price }
  )
  const { data: listFilter, isSuccess: getListFilterSuccessfull } = useGetListFilterAddressesQuery(
    {
      organizationId,
      chainId
    },
    { skip: !organizationId || !chainId }
  )

  useEffect(() => {
    if (getListFilterSuccessfull) {
      dispatch(setListFilter(listFilter))
    }
  }, [getListFilterSuccessfull, listFilter])

  useEffect(() => {
    dispatch(setFiltersSearch(undefined))
  }, [dispatch])

  useEffect(() => {
    if (reset > 0) {
      fetchPendingTransactions()
      fetchOutgoingTransactions()
      fetchIncomingTransactions()
      fetchAllTransactions()
    }
  }, [reset, isWalletSyncing])

  // Logic
  useEffect(() => {
    dispatch(setCurrentPage('Transaction Records'))
  }, [dispatch])

  // Navigate to the tab follow query
  useEffect(() => {
    const { typeTransaction } = router.query
    if (typeTransaction) {
      setActiveTab(typeTransaction as string)
    }
  }, [router.query])

  useEffect(() => {
    if (activeTab) {
      setPage(0)
      resetField('searchKey', { defaultValue: '' })
    }
  }, [activeTab, resetField])

  useEffect(() => {
    if (page !== 0) setPage(0)
  }, [search])

  const handleRefetchData = () => {
    if (activeTab === ETransactionType.ALL) {
      fetchAllTransactions()
    }
    if (activeTab === ETransactionType.QUEUE) {
      fetchPendingTransactions()
    }
    if (activeTab === ETransactionType.OUTGOING) {
      fetchOutgoingTransactions()
    }

    if (activeTab === ETransactionType.INCOMING) {
      fetchIncomingTransactions()
    }
  }

  const handleRetryImportFund = () => {
    setResponseError(undefined)
    setShowErrorModal(false)
    setShowImportFund(true)
  }

  useEffect(() => {
    if (status === EProcessStatus.SUCCESS) {
      setShowSuccessModal(true)
      setShowImportFund(false)
    }
    if (status === EProcessStatus.PENDING) {
      setShowSuccessModal(false)
    }
    if (status === EProcessStatus.FAILED) {
      setShowErrorModal(true)
      setShowImportFund(false)
    }
  }, [status])

  useEffect(() => {
    if (responseError) {
      setShowErrorModal(true)
      setShowImportFund(false)
    }
    if (!responseError) {
      setShowErrorModal(false)
    }
  }, [responseError])

  const handleChangeTab = (tab: string) => {
    setActiveTab(tab)
    setPage(0)
    setResetFilter((prev) => prev + 1)
    setDebouncedValue('')
  }

  const handleSubmit = () => {
    // if (!isChange) {
    //   setStartDate(new Date())
    //   setEndDate(new Date())
    // }
    setPage(0)
    setTimeSubmitted(true)
    setOpenDate(false)
    setSubmit(true)
    // setIsShowDropDown(false)
  }

  const handleShowDate = () => {
    setOpenDate(true)
  }

  useEffect(() => {
    if (activeTab !== ETransactionType.ALL) {
      setTimeSubmitted(false)
      setSubmit(false)
      setIsShowDropDown(false)
      setStartDate(null)
      setEndDate(null)
      dispatch(setFiltersSearch(undefined))
      setOpenDate(false)
    }
  }, [activeTab])

  const handleReset = () => {
    setTimeSubmitted(false)
    setStartDate(null)
    setEndDate(null)
  }

  const handleSetStartDate = (time: Date) => {
    setStartDate(time)
  }

  const handleSetEndDate = (time: Date) => {
    setEndDate(time)
  }

  const handleClose = () => {
    setOpenDate(false)
  }

  const handleResetDate = () => {
    setStartDate(null)
    setEndDate(null)
  }

  const handleResetAll = () => {
    // setStartDate(null)
    // setEndDate(null)
    setResetFilter((prev) => prev + 1)
    dispatch(setFilterTokenItemList([]))
    dispatch(setFiltersSearch([]))
    dispatch(setFilterFromItemList([]))
    dispatch(setFilterToItemList([]))
  }
  // Export
  const handleShowDropDownExportCsv = () => {
    setShowDropDownExportCsv(!showDropdownExportCsv)
  }

  const handleExportCsv = () => {
    if (price) {
      setIsExportCsv(true)
    } else {
      setExportWarning(true)
    }
  }
  const handleExportCsvXero = () => {
    setIsExportCsvXero(true)
  }

  const exportCsvElement = useMemo(
    () =>
      activeTab === ETransactionType.ALL ? (
        allTransactions?.items.length ? (
          <DropDownFilterTransaction
            isShowDropDown={showDropdownExportCsv}
            setIsShowDropDown={setShowDropDownExportCsv}
            triggerButton={
              <button
                type="button"
                onClick={handleShowDropDownExportCsv}
                className="bg-grey-900 rounded-[4px] px-4 py-[10px] flex gap-2 items-center text-sm text-white leading-5 whitespace-nowrap"
              >
                {selectedListHistory.length ? 'Export Selected' : 'Export CSV'}
                <img
                  src="/svg/DropDownWhite.svg"
                  alt="DownArrow"
                  className={!showDropdownExportCsv ? 'rotate-180 ' : ''}
                />
              </button>
            }
            maxHeight="max-h-[500px]"
          >
            <div className="w-[220px]">
              <button
                type="button"
                onClick={handleExportCsvXero}
                className="mb-1 flex items-center gap-3 hover:opacity-90 rounded-lg text-neutral-900 p-3 border border-transparent text-sm leading-5 font-medium w-full whitespace-nowrap hover:bg-grey-200"
              >
                <img src="/svg/Xero.svg" alt="Export" />
                Export Xero ready CSV
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-3 hover:opacity-90 rounded-lg text-neutral-900 p-3 border border-transparent text-sm leading-5 font-medium w-full whitespace-nowrap hover:bg-grey-200"
              >
                <img src="/svg/DocumentWhite.svg" alt="Export" />
                Export raw CSV
              </button>
            </div>
          </DropDownFilterTransaction>
        ) : null
      ) : (incomingTransactions?.items.length && activeTab === ETransactionType.INCOMING) ||
        (outgoingTransactions?.items.length && activeTab === ETransactionType.OUTGOING) ||
        (pendingTransactions?.items.length && activeTab === ETransactionType.QUEUE) ? (
        <button
          type="button"
          onClick={handleExportCsv}
          className="bg-grey-900 rounded-[4px] px-4 py-[10px] flex gap-2 items-center text-sm text-white leading-5 whitespace-nowrap"
        >
          {selectedListIncoming.length || selectedListOutgoing.length || selectedListPending.length
            ? 'Export Selected'
            : 'Export All'}
        </button>
      ) : null,
    [
      activeTab,
      allTransactions,
      incomingTransactions,
      outgoingTransactions,
      pendingTransactions,
      selectedListHistory,
      selectedListIncoming,
      selectedListOutgoing,
      selectedListPending,
      showDropdownExportCsv
    ]
  )

  return (
    // <div className="bg-white rounded-2xl font-inter m-0 mr-4 mt-0">
    //   <div className="flex items-center justify-between p-6">
    //     <div className="flex items-center gap-4 h-10 pb-3">
    //       <div className="font-acid text-2xl text-[#2D2D2C] leading-8 font-bold">Transactions</div>
    //       <SyncButton wrapperClassName="max-h-9 min-w-max leading-5 text-sm bg-dashboard-background px-2 py-1 rounded" />
    //     </div>
    //     <div className="flex items-center gap-3">{exportCsvElement}</div>
    //   </div>
    <div className="bg-white rounded-2xl font-inter shadow-free-modal mr-4">
      <div className="flex justify-between py-5 px-6">
        <div className="flex flex-row items-center">
          <Typography classNames="mr-4" variant="heading2" color="black">
            Transactions
          </Typography>
          <SyncButton wrapperClassName="max-h-9 min-w-max leading-5 text-sm bg-dashboard-background px-2 py-1 rounded" />
        </div>
        <div>
          <div className="-mt-1 flex flex-row items-center">{exportCsvElement}</div>
        </div>
      </div>
      <Tabs
        setActive={handleChangeTab}
        active={activeTab}
        tabs={transactionsTabs}
        activeStyle="bg-grey-200 "
        wrapperClassName="border-b border-dashboard-border"
        className="px-6 pb-4 gap-4"
        classNameBtn="font-inter text-grey-800 font-medium text-sm px-4 py-2 rounded-lg"
      >
        <TabItem key={ETransactionType.ALL}>
          <AllTransactions
            offset={offset}
            page={page}
            handleResetAll={handleResetAll}
            handleResetDate={handleResetDate}
            isShowDropDown={isShowDropDown}
            setIsShowDropDown={setIsShowDropDown}
            endDate={endDate}
            startDate={startDate}
            handleSubmit={handleSubmit}
            setEndDate={handleSetEndDate}
            setStartDate={handleSetStartDate}
            control={control}
            account={account}
            sourceOfFunds={sourceOfFunds}
            chainId={chainId}
            price={price}
            transactionLoading={transactionLoading}
            isSource={isSource}
            totalPages={(allTransactions && allTransactions.totalPages) || 1}
            currentPage={page}
            setPage={setPage}
            setSearch={() => {
              resetField('searchKey', { defaultValue: '' })
            }}
            size={Number(offset)}
            totalItems={(allTransactions && allTransactions.totalItems) || 0}
            dataAllTransactions={(allTransactions && allTransactions.items) || []}
            refetch={handleRefetchData}
            categories={categories?.items || []}
            setShowImportFund={setShowImportFund}
            search={search}
            activeTab={activeTab}
            isExportCsv={isExportCsv}
            isExportCsvXero={isExportCsvXero}
            setIsExportCsvXero={setIsExportCsvXero}
            setIsExportCsv={setIsExportCsv}
            filterItemsSelector={filterItems}
            selectedList={selectedListHistory}
            setSelectedList={setSelectedListHistory}
            selectedXeroList={selectedXeroList}
            setSelectedXeroList={setSelectedXeroList}
          />
        </TabItem>
        <TabItem key={ETransactionType.QUEUE}>
          <QueueTransactions
            nonExecuteLoading={nonExecuteLoading}
            executeLoading={executeLoading}
            loading={getAllPendingTransactionsLoading}
            control={control}
            search={search}
            account={account}
            sourceOfFunds={sourceOfFunds}
            confirmLoading={confirmLoading}
            chainId={chainId}
            price={price}
            tokens={tokens}
            isTransactionExecutable={isTransactionExecutable}
            isTransactionSignedByAddress={isTransactionSignedByAddress}
            onExecuted={handleExecuted}
            onReject={handleReject}
            onSign={handleSign}
            isSource={isSource}
            pending={pending}
            setSearch={() => resetField('searchKey', { defaultValue: '' })}
            totalItems={(pendingTransactions && pendingTransactions.totalItems) || 0}
            currentPage={page}
            setPage={setPage}
            size={Number(offset)}
            totalPages={(pendingTransactions && pendingTransactions.totalPages) || 0}
            dataQueueTransactions={(pendingTransactions && pendingTransactions.items) || []}
            refetch={handleRefetchData}
            // categories={categoriesTransactionFiltered || []}
            categories={categories?.items || []}
            setShowImportFund={setShowImportFund}
            isExportCsv={isExportCsv}
            setIsExportCsv={setIsExportCsv}
            activeTab={activeTab}
            selectedList={selectedListPending}
            setSelectedList={setSelectedListPending}
          />
        </TabItem>
        <TabItem key={ETransactionType.OUTGOING}>
          <OutgoingTransactions
            loading={getOutgoingTransactionsLoading}
            control={control}
            search={search}
            account={account}
            sourceOfFunds={sourceOfFunds}
            chainId={chainId}
            organizationId={organizationId}
            price={price}
            tokens={tokens}
            // categories={categoriesTransactionFiltered || []}
            categories={categories?.items || []}
            isSource={isSource}
            totalPages={(outgoingTransactions && outgoingTransactions.totalPages) || 0}
            currentPage={page}
            setPage={setPage}
            setSearch={() => resetField('searchKey', { defaultValue: '' })}
            size={Number(offset)}
            totalItems={(outgoingTransactions && outgoingTransactions.totalItems) || 0}
            dataOutgoingTransactions={(outgoingTransactions && outgoingTransactions.items) || []}
            refetch={handleRefetchData}
            setShowImportFund={setShowImportFund}
            isExportCsv={isExportCsv}
            setIsExportCsv={setIsExportCsv}
            activeTab={activeTab}
            selectedList={selectedListOutgoing}
            setSelectedList={setSelectedListOutgoing}
          />
        </TabItem>
        <TabItem key={ETransactionType.INCOMING}>
          <IncomingTransactions
            loading={getIncomingTransactionsLoading}
            control={control}
            search={search}
            account={account}
            sourceOfFunds={sourceOfFunds}
            chainId={chainId}
            price={price}
            tokens={tokens}
            isSource={isSource}
            totalPages={(incomingTransactions && incomingTransactions.totalPages) || 1}
            currentPage={page}
            setPage={setPage}
            setSearch={() => resetField('searchKey', { defaultValue: '' })}
            size={Number(offset)}
            totalItems={(incomingTransactions && incomingTransactions.totalItems) || 0}
            dataIncomingTransactions={(incomingTransactions && incomingTransactions.items) || []}
            refetch={handleRefetchData}
            // categories={categoriesTransactionFiltered || []}
            categories={categories?.items || []}
            setShowImportFund={setShowImportFund}
            isExportCsv={isExportCsv}
            setIsExportCsv={setIsExportCsv}
            activeTab={activeTab}
            selectedList={selectedListIncoming}
            setSelectedList={setSelectedListIncoming}
          />
        </TabItem>
        {/* <TabItem key={transactionsTabs[3].key}>
          <NotFound
            title="Don’t see any drafts yet?"
            subTitle="Add new team member to get started"
            icon={user}
            label="Make A Transfer"
            className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
          />
        </TabItem> */}
      </Tabs>
      {showError && (
        <NotificationPopUp
          type="error"
          title="Unable to send transfer."
          description="There was an issue in transfer. Please try again."
          showModal={showError}
          setShowModal={setShowError}
          onClose={handleCloseModal}
          onAccept={handleCloseModal}
        />
      )}

      {nonExecuteLoading && (
        <Modal showModal zIndex="z-30">
          <Loader title="Waiting on blockchain" />
        </Modal>
      )}

      {/* {showImportFund && (
        <ImportFund
          modal={modal}
          setModal={setModal}
          setResponseError={setResponseError}
          setStatus={setStatus}
          setShowImportFund={setShowImportFund}
          showImportFund={showImportFund}
        />
      )} */}

      {showErrorModal && (
        <NotificationPopUp
          onAccept={handleRetryImportFund}
          acceptText="Retry"
          title="Unable to add fund"
          description={responseError || 'There was an issue adding the safe. Please try again.'}
          type="error"
          option
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => setResponseError(undefined)}
        />
      )}

      {showSuccessModal && (
        <NotificationPopUp
          title="Successfully added fund"
          description="You may now tag your transactions and view your balances. Please note that synchronizing your transactions for the first-time could take a few minutes."
          type="success"
          setShowModal={setShowSuccessModal}
          showModal={showSuccessModal}
          onClose={() => setStatus(EProcessStatus.PENDING)}
        />
      )}

      {executeLoading && (
        <NotificationSending
          showModal={executeLoading}
          title="Sending transfer."
          subTitle="Please wait until the transfer is completed."
        />
      )}

      {exportWarning && (
        <NotificationPopUp
          title="Error Fetching Prices"
          description="There was an error fetching prices from the service provider. You may still export without the prices or try again later. Do you want to export now?"
          type="custom"
          image="/svg/warningBig.svg"
          option
          setShowModal={setExportWarning}
          showModal={exportWarning}
          declineText="No, Don’t Export"
          acceptText="Yes, Export"
          onClose={() => {
            setExportWarning(false)
          }}
          onAccept={() => {
            setExportWarning(false)
            setIsExportCsv(true)
          }}
        />
      )}
    </div>
  )
}

export default Transactions
