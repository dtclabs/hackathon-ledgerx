import PaginateTransactions from '@/components/PaginateTransactions'
import TextField from '@/components/TextField/TextField'
import { IQueueTransactions } from '../../interface'
import QueueTransactionsInfo from './QueueTransactionsInfo'
import document from '@/public/svg/Document.svg'
import Loading from '@/components/Loading'
import { CSVLink } from 'react-csv'
import { csvHeaders } from '@/constants/csvHeader'
import { csvExportData } from '@/utils/csvExportData'
import { format } from 'date-fns'
import { useCurrentOrganization } from '@/hooks/useCurrentTransaction'
import { createRef, useEffect, useRef, useState } from 'react'
import { ETransactionType, ITransaction } from '@/slice/old-tx/interface'
import { useAppDispatch, useAppSelector } from '@/state'
import useFreeContext from '@/hooks/useFreeContext'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { SourceType } from '@/slice/wallets/wallet-types'
import { useLazyGetTransactionsQuery } from '@/api-v2/old-tx-api'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import NotFound from '@/components/NotFound'
import { contactsSelector } from '@/slice/contacts/contacts-slice'

const QueueTransactions: React.FC<IQueueTransactions> = ({
  size,
  price,
  search,
  loading,
  // account,
  control,
  totalPages,
  chainId,
  currentPage,
  sourceOfFunds,
  executeLoading,
  confirmLoading,
  nonExecuteLoading,
  dataQueueTransactions,
  totalItems,
  categories,
  setPage,
  isSource,
  onExecuted,
  onReject,
  onSign,
  setSearch,
  isTransactionExecutable,
  isTransactionSignedByAddress,
  refetch,
  setShowImportFund,
  activeTab,
  isExportCsv,
  setIsExportCsv,
  selectedList,
  setSelectedList
}) => {
  const [csvData, setCSVData] = useState<ITransaction[]>([])
  const csvLink = useRef()
  const currentOrganization = useCurrentOrganization()
  const [activeList, setActiveList] = useState<ITransaction[]>([])
  const [remainingList, setRemainingList] = useState<ITransaction[]>([])
  const [csvLoading, setCsvLoading] = useState(false)
  const [collapse, setCollapse] = useState(false)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const dispatch = useAppDispatch()
  const { tokens } = useFreeContext()
  const organizationId = useOrganizationId()
  const recipients = useAppSelector(contactsSelector)
  const [triggerTxn, { data: txnData }] = useLazyGetTransactionsQuery()

  useEffect(() => {
    if (remainingList || activeList) setSelectedList([...activeList, ...remainingList])
  }, [activeList, remainingList])

  useEffect(() => {
    if (!selectedList.length) {
      setActiveList([])
      setRemainingList([])
    }
  }, [selectedList.length])

  const handleSelectRemainingTransaction = (item: ITransaction) => {
    setRemainingList((prev) =>
      prev.find((prevItem) => prevItem.id === item.id) ? prev.filter((prevI) => prevI.id !== item.id) : [...prev, item]
    )
  }
  const handleSelectAllRemainingTransaction = () => {
    const remainingTransaction = dataQueueTransactions.filter((item) => !item.isReady)
    if (remainingTransaction.every((txn) => selectedList.findIndex((item) => item.id === txn.id) >= 0)) {
      for (const txn of remainingTransaction) {
        setRemainingList((prev) => prev.filter((prevI) => prevI.id !== txn.id))
      }
    } else {
      for (const txn of remainingTransaction) {
        setRemainingList((prev) =>
          prev.findIndex((prevItem) => prevItem.id === txn.id) >= 0 ? [...prev] : [...prev, txn]
        )
      }
    }
  }
  const handleSelectActiveTransaction = (item: ITransaction) => {
    setActiveList((prev) =>
      prev.find((prevItem) => prevItem.id === item.id) ? prev.filter((prevI) => prevI.id !== item.id) : [...prev, item]
    )
  }
  const handleSelectAllActiveTransaction = () => {
    const activeTransaction = dataQueueTransactions.filter((item) => item.isReady)
    if (activeTransaction.every((txn) => selectedList.findIndex((item) => item.id === txn.id) >= 0)) {
      for (const txn of activeTransaction) {
        setActiveList((prev) => prev.filter((prevI) => prevI.id !== txn.id))
      }
    } else {
      for (const txn of activeTransaction) {
        setActiveList((prev) =>
          prev.findIndex((prevItem) => prevItem.id === txn.id) >= 0 ? [...prev] : [...prev, txn]
        )
      }
    }
  }
  // Export CSV
  useEffect(() => {
    if (isExportCsv && activeTab === ETransactionType.QUEUE) {
      const asyncCSVData = async () => {
        if (selectedList && selectedList.length > 0) {
          setCsvLoading(true)
          setCSVData(selectedList)

          return
        }
        if (totalItems > 0) {
          triggerTxn({
            organizationId,
            price,
            tokens,
            params: {
              page: 0,
              size: 9999,
              search,
              chainId,
              type: ETransactionType.QUEUE
            }
          })
            .unwrap()
            .then((res) => {
              setCSVData(res.items)
              setCsvLoading(true)
            })
        }
      }
      asyncCSVData()
      setIsExportCsv(false)
    }
  }, [isExportCsv, selectedList, totalItems, dataQueueTransactions, activeTab])

  useEffect(() => {
    if (activeTab !== ETransactionType.QUEUE) {
      setSelectedList([])
      setRemainingList([])
      setActiveList([])
    }
  }, [activeTab])

  useEffect(() => {
    if (csvData.length > 0) {
      const { current } = csvLink as any
      current.link.click()
      setSelectedList([])
      setRemainingList([])
      setActiveList([])
      setCSVData([])

      setCsvLoading(false)
    }
  }, [csvData])

  return (
    <div className="bg-white rounded-2xl mt-6 font-inter text-base px-6 pb-7">
      {/* {!account ? (
        <NotFound
          title="Pending transactions require a safe to be connected"
          subTitle="Add a safe to view all pending transactions"
          label="Add Safe"
          onClick={() => setShowImportFund(true)}
          icon={document}
          className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
          disabled={
            syncProgressing.balance ||
            syncProgressing.transactions ||
            syncProgressing.sourceTransactions ||
            syncProgressing.sourceTransactionById ||
            syncProgressing.sourceBalance
          }
        />
      ) : (
   
      )} */}

      <div className="flex justify-between items-center">
        {dataQueueTransactions.length === 0 && !search ? (
          <div />
        ) : dataQueueTransactions.length > 0 && search ? (
          <TextField
            placeholder="Search by entering Safe Transaction Hash or Contact"
            textSearch={search}
            search
            disabled={loading || loading}
            handleReset={setSearch}
            classNameContainer="w-[50%] max-w-[420px]"
            name="searchKey"
            control={control}
            classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter flex items-center px-[14px] py-[10px]"
          />
        ) : (
          <TextField
            placeholder="Search by entering Safe Transaction Hash or Contact"
            textSearch={search}
            search
            disabled={loading || loading}
            handleReset={setSearch}
            classNameContainer="w-[50%] max-w-[420px]"
            name="searchKey"
            control={control}
            classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter flex items-center px-[14px] py-[10px]"
          />
        )}

        {dataQueueTransactions.length > 0 && (
          <div className="flex items-center ">
            <CSVLink
              target="_blank"
              ref={csvLink}
              filename={
                currentOrganization && `${currentOrganization.name}_awaiting_txns_${format(new Date(), 'dd-MM-yyyy')}`
              }
              data={csvExportData(csvData, sourceOfFunds, recipients, chainId, price)}
              headers={csvHeaders}
            />
          </div>
        )}
      </div>
      {loading && !sourceOfFunds ? (
        <Loading dark title="Fetching Data" />
      ) : dataQueueTransactions.length > 0 ? (
        <div
          className={`mt-4 ${
            dataQueueTransactions.length ? 'h-[calc(100vh-406px)]' : 'h-[calc(100vh-307px)]'
          }  overflow-auto scrollbar w-full`}
        >
          <div className="min-w-fit">
            {dataQueueTransactions.find((item) => item.isReady) && (
              <div className="mb-4 mt-2">
                <div className="flex items-center gap-2 mb-6 px-1">
                  <div className="text-[#535251] text-base leading-6 font-medium font-inter">Active Transaction</div>
                  <div className="text-[#777675] text-xs leading-4.5 font-medium font-inter">
                    You must execute this transaction before executing others in queue
                  </div>
                </div>
                <div className="min-w-fit rounded-lg border border-grey-200">
                  <div className="flex items-center flex-1 cursor-pointer bg-grey-100 px-4 py-3 text-xs text-blanca-600 rounded-t-lg">
                    <div className="pl-2 pr-6">
                      <input
                        checked={
                          activeList &&
                          activeList.length === dataQueueTransactions.filter((item) => item.isReady).length
                        }
                        // id={`checkbox-${valueTransaction.id}-${amount}`}
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectAllActiveTransaction()
                          // onSelectTransaction(valueTransaction)
                        }}
                        className="w-5 h-5 text-dashboard-main bg-gray-100 rounded-[4px] border-gray-300 focus:ring-dashboard-main checked:[#E83F6D] accent-dashboard-main"
                      />
                    </div>
                    <div className="flex items-center w-[207px] mr-6">
                      <div className="mr-3 w-8">#</div>
                      <div>To</div>
                    </div>
                    <div className="flex flex-1 mr-6 justify-between">
                      <div className="min-w-[160px] mr-6 ml-[80px] 3xl:ml-0">Asset Amount</div>
                      <div className="min-w-[160px] flex items-center mr-6">Category</div>
                      <div className="items-center flex min-w-[127px] 3xl:mr-0 mr-[80px]">Status</div>
                    </div>
                    <div className="w-[215px]">Actions</div>
                  </div>
                  <div>
                    {dataQueueTransactions.map(
                      (item, index) =>
                        item.isReady && (
                          <QueueTransactionsInfo
                            setSelectedList={setSelectedList}
                            nonExecuteLoading={nonExecuteLoading}
                            executeLoading={executeLoading}
                            confirmLoading={confirmLoading}
                            onSelectTransaction={handleSelectActiveTransaction}
                            selectedList={activeList}
                            isTransactionExecutable={isTransactionExecutable}
                            onExecuted={onExecuted}
                            onReject={onReject}
                            onSign={onSign}
                            isSource={isSource}
                            isTransactionSignedByAddress={isTransactionSignedByAddress}
                            key={item.id}
                            valuesQueueTransactions={item}
                            refetch={refetch}
                            categories={categories}
                            index={index}
                          />
                        )
                    )}
                  </div>
                </div>
              </div>
            )}
            {dataQueueTransactions.find((item) => !item.isReady) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-6 px-1">
                  <div className="flex items-center gap-3">
                    <div className="text-[#535251] text-base leading-6 font-medium font-inter">
                      Remaining Transactions in Queue
                    </div>
                    <div className="bg-[#F1F1EF] text-grey-700 rounded-sm text-xs leading-4.5 font-medium font-inter px-2 py-1">
                      {dataQueueTransactions.filter((item) => !item.isReady).length}
                    </div>
                    <div className="text-[#777675] text-xs leading-4.5 font-medium font-inter">
                      Please approve or reject the following transactions to execute them above
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`bg-[#F1F1EF] rounded-sm cursor-pointer p-2 ${!collapse && 'rotate-180'}`}
                    onClick={() => {
                      setCollapse(!collapse)
                    }}
                  >
                    <img src="/svg/Dropdown.svg" alt="dropdown" width={8} height={8} />
                  </button>
                </div>
                {!collapse && (
                  <div className="min-w-fit rounded-lg border border-grey-200">
                    <div className="flex items-center flex-1 cursor-pointer bg-grey-100 px-4 py-3 text-xs text-blanca-600 rounded-t-lg">
                      <div className="pl-2 pr-6">
                        <input
                          checked={
                            remainingList &&
                            remainingList.length === dataQueueTransactions.filter((item) => !item.isReady).length
                          }
                          // id={`checkbox-${valueTransaction.id}-${amount}`}
                          type="checkbox"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectAllRemainingTransaction()
                          }}
                          className="w-5 h-5 text-dashboard-main bg-gray-100 rounded-[4px] border-gray-300 focus:ring-dashboard-main checked:[#E83F6D] accent-dashboard-main"
                        />
                      </div>
                      <div className="flex items-center w-[207px] mr-6">
                        <div className="mr-3 w-8">#</div>
                        <div>To</div>
                      </div>
                      <div className="flex flex-1 mr-6 justify-between">
                        <div className="min-w-[160px] mr-6 ml-[80px] 3xl:ml-0">Asset Amount</div>
                        <div className="min-w-[160px] flex items-center mr-6">Category</div>
                        <div className="items-center flex min-w-[127px] 3xl:mr-0 mr-[80px]">Status</div>
                      </div>
                      <div className="w-[215px]">Actions</div>
                    </div>
                    <div>
                      {dataQueueTransactions.map(
                        (item, index) =>
                          !item.isReady && (
                            <QueueTransactionsInfo
                              setSelectedList={setSelectedList}
                              nonExecuteLoading={nonExecuteLoading}
                              executeLoading={executeLoading}
                              confirmLoading={confirmLoading}
                              onSelectTransaction={handleSelectRemainingTransaction}
                              selectedList={remainingList}
                              isTransactionExecutable={isTransactionExecutable}
                              onExecuted={onExecuted}
                              onReject={onReject}
                              onSign={onSign}
                              isSource={isSource}
                              isTransactionSignedByAddress={isTransactionSignedByAddress}
                              key={item.id}
                              valuesQueueTransactions={item}
                              refetch={refetch}
                              categories={categories}
                              index={index}
                            />
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : loading ? (
        <Loading dark title="Fetching Data" />
      ) : sourceOfFunds &&
        sourceOfFunds.items.filter((item) => item.sourceType.toLowerCase() === SourceType.GNOSIS).length > 0 ? (
        <NotFound title="No Pending Transactions Found." icon={document} />
      ) : sourceOfFunds &&
        sourceOfFunds.items.filter((item) => item.sourceType.toLowerCase() === SourceType.ETH).length > 0 ? (
        <EmptyData>
          <EmptyData.Icon icon={document} />
          <EmptyData.Title>Pending transactions require a safe to be connected</EmptyData.Title>
          <EmptyData.Subtitle>Add a safe to view all pending transactions</EmptyData.Subtitle>
          <EmptyData.CTA onClick={() => setShowImportFund(true)} disabled={isWalletSyncing} label="Add Safe" />
        </EmptyData>
      ) : (
        <EmptyData>
          <EmptyData.Icon icon={document} />
          <EmptyData.Title>Pending transactions require a safe to be connected</EmptyData.Title>
          <EmptyData.Subtitle>Add a safe to view all pending transactions</EmptyData.Subtitle>
          <EmptyData.CTA onClick={() => setShowImportFund(true)} disabled={isWalletSyncing} label="Add Safe" />
        </EmptyData>
      )}

      {dataQueueTransactions.length > 0 && (
        <div className="flex justify-start items-center mt-4">
          <PaginateTransactions
            currentPage={currentPage}
            setPage={setPage}
            size={size}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  )
}

export default QueueTransactions
