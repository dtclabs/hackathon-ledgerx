import Loading from '@/components/Loading'
import PaginateTransactions from '@/components/PaginateTransactions'
import TextField from '@/components/TextField/TextField'
import Image from 'next/legacy/image'
import { IOutGoingTransactions } from '../../interface'
import OutgoingTransactionsInfo from './OutgoingTransactionsInfo'
import document from '@/public/svg/Document.svg'
import { csvHeaders } from '@/constants/csvHeader'
import { csvExportData } from '@/utils/csvExportData'
import { CSVLink } from 'react-csv'
import { format } from 'date-fns'
import { useCurrentOrganization } from '@/hooks/useCurrentTransaction'
import { createRef, useEffect, useRef, useState } from 'react'
import { ETransactionType, ITransaction } from '@/slice/old-tx/interface'
import { useAppDispatch, useAppSelector } from '@/state'
import useFreeContext from '@/hooks/useFreeContext'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useLazyGetTransactionsQuery } from '@/api-v2/old-tx-api'
import NotFound from '@/components/NotFound'
import { contactsSelector } from '@/slice/contacts/contacts-slice'

const OutgoingTransactions: React.FC<IOutGoingTransactions> = ({
  dataOutgoingTransactions,
  price,
  isSource,
  currentPage,
  setPage,
  setSearch,
  size,
  totalItems,
  totalPages,
  categories,
  chainId,
  refetch,
  setShowImportFund,
  sourceOfFunds,
  // account,
  search,
  control,
  loading,
  activeTab,
  isExportCsv,
  setIsExportCsv,
  selectedList,
  setSelectedList
}) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const [csvData, setCSVData] = useState<ITransaction[]>([])
  const [csvLoading, setCsvLoading] = useState(false)
  const csvLink = useRef()
  const currentOrganization = useCurrentOrganization()
  const [isTableOverflowed, setIsTableOverflowed] = useState(false)
  const dispatch = useAppDispatch()
  const { tokens } = useFreeContext()
  const organizationId = useOrganizationId()
  const recipients = useAppSelector(contactsSelector)

  const [triggerTxn, { data: txnData }] = useLazyGetTransactionsQuery()

  useEffect(() => {
    if (tableRef.current) {
      setIsTableOverflowed(tableRef.current.scrollHeight > tableRef.current.clientHeight)
    }
  }, [dataOutgoingTransactions])

  useEffect(() => {
    if (activeTab !== ETransactionType.OUTGOING) {
      setSelectedList([])
    }
  }, [activeTab])

  // Export CSV
  useEffect(() => {
    if (isExportCsv && activeTab === ETransactionType.OUTGOING) {
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
              type: ETransactionType.OUTGOING
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
  }, [isExportCsv, selectedList, totalItems, dataOutgoingTransactions, activeTab])

  const handleSelectTransaction = (item: ITransaction) => {
    setSelectedList((prev) =>
      prev.find((prevItem) => prevItem.id === item.id) ? prev.filter((prevI) => prevI.id !== item.id) : [...prev, item]
    )
  }
  const handleSelectAllTransaction = () => {
    if (dataOutgoingTransactions.every((txn) => selectedList.findIndex((item) => item.id === txn.id) >= 0)) {
      for (const txn of dataOutgoingTransactions) {
        setSelectedList((prev) => prev.filter((prevI) => prevI.id !== txn.id))
      }
    } else {
      for (const txn of dataOutgoingTransactions) {
        setSelectedList((prev) =>
          prev.findIndex((prevItem) => prevItem.id === txn.id) >= 0 ? [...prev] : [...prev, txn]
        )
      }
    }
  }

  useEffect(() => {
    if (csvData.length > 0) {
      const { current } = csvLink as any
      current.link.click()
      setSelectedList([])
      setCSVData([])
      setCsvLoading(false)
    }
  }, [csvData])

  return (
    <div className="bg-white rounded-2xl mt-6 font-inter text-base px-6 pb-7">
      <div className="flex justify-between items-center">
        {dataOutgoingTransactions.length === 0 && !search ? (
          <div />
        ) : dataOutgoingTransactions.length > 0 && search ? (
          <TextField
            placeholder="Search by entering Transaction Hash or Contact"
            textSearch={search}
            search
            disabled={loading}
            handleReset={setSearch}
            classNameContainer="w-[46%] max-w-[385px]"
            name="searchKey"
            control={control}
            classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter flex items-center px-[14px] py-[10px]"
          />
        ) : (
          <TextField
            placeholder="Search by entering Transaction Hash or Contact"
            textSearch={search}
            search
            disabled={loading}
            handleReset={setSearch}
            classNameContainer="w-[46%] max-w-[385px]"
            name="searchKey"
            control={control}
            classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter flex items-center px-[14px] py-[10px]"
          />
        )}

        {dataOutgoingTransactions.length > 0 && (
          <div className="flex items-center ">
            <CSVLink
              target="_blank"
              ref={csvLink}
              filename={
                currentOrganization && `${currentOrganization.name}_outgoing_txns_${format(new Date(), 'dd-MM-yyyy')}`
              }
              data={csvExportData(csvData, sourceOfFunds, recipients, chainId, price)}
              headers={csvHeaders}
            />
          </div>
        )}
      </div>
      {loading && !sourceOfFunds ? (
        <Loading dark title="Fetching Data" />
      ) : dataOutgoingTransactions.length > 0 ? (
        <div
          className={`mt-4 ${
            dataOutgoingTransactions.length ? 'h-[calc(100vh-405px)]' : 'h-[calc(100vh-300px)]'
          }  overflow-auto scrollbar w-full rounded-lg border border-grey-200`}
        >
          <div className="min-w-fit">
            <div className="flex items-center flex-1 cursor-pointer bg-grey-100 px-4 py-3 text-xs text-blanca-600 border-b border-grey-200 rounded-t-lg">
              <div className="pl-2 pr-6">
                <input
                  checked={
                    selectedList &&
                    dataOutgoingTransactions &&
                    dataOutgoingTransactions.every((txn) => selectedList.findIndex((item) => item.id === txn.id) >= 0)
                  }
                  // id={`checkbox-${valueTransaction.id}-${amount}`}
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleSelectAllTransaction()
                  }}
                  className="w-5 h-5 text-dashboard-main bg-gray-100 rounded-[4px] border-gray-300 focus:ring-dashboard-main checked:[#E83F6D] accent-dashboard-main"
                />
              </div>
              <div className="flex items-center w-[207px] mr-6">To</div>
              <div className="flex flex-1 mr-6 justify-between">
                <div className="min-w-[150px] mr-6 ml-[80px] 3xl:ml-0">Asset Amount</div>
                <div className="min-w-[160px] flex items-center mr-6">Category</div>
                <div className="items-center flex min-w-[127px] 3xl:mr-0 mr-[80px]">Status</div>
              </div>
              <div className="w-[220px]">Actions</div>
            </div>
            <div
              ref={tableRef}
              className={`${
                dataOutgoingTransactions.length ? 'h-[calc(100vh-470px)]' : 'h-[calc(100vh-300px)]'
              }  overflow-auto scrollbar w-full`}
            >
              {dataOutgoingTransactions.length > 0 &&
                dataOutgoingTransactions.map((item, index) => (
                  <OutgoingTransactionsInfo
                    selectedList={selectedList}
                    onSelectTransaction={handleSelectTransaction}
                    isSource={isSource}
                    key={item.id}
                    valuesOutgoingTransactions={item}
                    categories={categories}
                    refetch={refetch}
                    setSelectedList={setSelectedList}
                    isLastItem={index + 1 === dataOutgoingTransactions.length}
                    isTableOverflowed={isTableOverflowed}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : sourceOfFunds.items.length > 0 ? (
        <NotFound
          title="No Outgoing Transactions Found."
          // subTitle="Connect a safe to initiate payouts and deposits."
          icon={document}
          // onClick={onShowImportFund}
          // label="Connect a Safe"
        />
      ) : (
        <NotFound
          title="No Source of Funds Connected"
          subTitle="Add a source of fund to view all outgoing transactions"
          icon={document}
          className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
          label="Add Fund"
          onClick={() => setShowImportFund(true)}
        />
      )}

      {dataOutgoingTransactions.length > 0 && (
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

export default OutgoingTransactions
