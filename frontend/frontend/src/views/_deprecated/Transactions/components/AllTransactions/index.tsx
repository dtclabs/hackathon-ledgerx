import { useLazyGetTransactionsQuery, useLazyGetXeroTransactionsQuery } from '@/api-v2/old-tx-api'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import PaginateTransactions from '@/components/PaginateTransactions'
import TextField from '@/components/TextField/TextField'
import { csvHeaders } from '@/constants/csvHeader'
import { csvXeroHeader } from '@/constants/csvXeroHeader'
import { useCategoryFilters } from '@/hooks/useCategoryFilters'
import { useCurrentOrganization } from '@/hooks/useCurrentTransaction'
import useFreeContext from '@/hooks/useFreeContext'
import Close from '@/public/svg/CloseGray.svg'
import document from '@/public/svg/Document.svg'
import filter from '@/public/svg/filter-funnel-02.svg'
import { filtersSearchSelector } from '@/slice/categories/categories-slice'
import { ETransactionType, ITransaction } from '@/slice/old-tx/interface'
import { useAppDispatch, useAppSelector } from '@/state'
import { csvExportData } from '@/utils/csvExportData'
import { csvXeroExportData } from '@/utils/csvXeroExportData'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CSVLink } from 'react-csv'
import { IAllTransactions } from '../../interface'
import FilterTransactionByDate from '../FilterTransactionByDate'
import IncomingTransactionsInfo from '../IncomingTransactions/IncomingTransactionsInfo'
import OutgoingTransactionsInfo from '../OutgoingTransactions/OutgoingTransactionsInfo'
import SelectFilterTransaction from '../SelectFilterTransaction/SelectFilterTransaction'
import NotFound from '@/components/NotFound'
import { contactsSelector } from '@/slice/contacts/contacts-slice'

const AllTransactions: React.FC<IAllTransactions> = ({
  dataAllTransactions,
  currentPage,
  setPage,
  setSearch,
  size,
  price,
  chainId,
  totalItems,
  transactionLoading,
  totalPages,
  offset,
  isSource,
  categories,
  refetch,
  setShowImportFund,
  sourceOfFunds,
  // account,
  search,
  control,
  handleResetDate,
  isShowDropDown,
  setIsShowDropDown,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSubmit,
  page,
  handleResetAll,
  activeTab,
  isExportCsv,
  isExportCsvXero,
  setIsExportCsv,
  setIsExportCsvXero,
  filterItemsSelector,
  selectedList,
  setSelectedList,
  selectedXeroList,
  setSelectedXeroList
}) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const [csvData, setCSVData] = useState<ITransaction[]>([])
  const [csvXeroData, setCSVXeroData] = useState<ITransaction[]>([])
  const csvLink = useRef()
  const csvXeroLink = useRef()
  const [isExistData, setIsExistData] = useState(false)
  const currentOrganization = useCurrentOrganization()
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvXeroLoading, setCsvXeroLoading] = useState(false)
  const filtersSearch = useAppSelector(filtersSearchSelector)
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>()
  const [isTableOverflowed, setIsTableOverflowed] = useState(false)
  const recipients = useAppSelector(contactsSelector)
  const { tokens } = useFreeContext()
  const organizationId = useOrganizationId()
  useEffect(() => {
    if (tableRef.current) {
      setIsTableOverflowed(tableRef.current.scrollHeight > tableRef.current.clientHeight)
    }
  }, [dataAllTransactions])

  const {
    expandTypes,
    categoriesList,
    checkboxValues,
    categoryFilters,
    handleExpandTypes,
    handleCheckCategory,
    handleResetCheckboxValues,
    handleCheckAllCategoriesByType,
    handleAppendCheckboxValues
  } = useCategoryFilters()

  const countTotalFilterApplied = useMemo(
    () =>
      (filterItemsSelector.tokenList.length ? 1 : 0) +
      (filtersSearch?.length ? 1 : 0) +
      (filterItemsSelector.fromList.length ? 1 : 0) +
      (filterItemsSelector.toList.length ? 1 : 0),
    [filterItemsSelector, filtersSearch?.length]
  )

  const [triggerTxn, { data: txnData }] = useLazyGetTransactionsQuery()
  const [triggerXero, { data: xeroData }] = useLazyGetXeroTransactionsQuery()

  const handleSelectTransaction = (item: ITransaction) => {
    setSelectedList((prev) =>
      prev.find((prevItem) => prevItem.id === item.id) ? prev.filter((prevI) => prevI.id !== item.id) : [...prev, item]
    )
  }
  const handleSelectAllTransaction = () => {
    if (dataAllTransactions.every((txn) => selectedList.findIndex((item) => item.id === txn.id) >= 0)) {
      for (const txn of dataAllTransactions) {
        setSelectedList((prev) => prev.filter((prevI) => prevI.id !== txn.id))
      }
    } else {
      for (const txn of dataAllTransactions) {
        setSelectedList((prev) =>
          prev.findIndex((prevItem) => prevItem.id === txn.id) >= 0 ? [...prev] : [...prev, txn]
        )
      }
    }
  }
  // Export CSV
  useEffect(() => {
    if (isExportCsv && activeTab === ETransactionType.ALL) {
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
              startTime: startDate && endDate ? `${format(new Date(startDate), 'yyyy-MM-dd ')} 00:00:00` : '',
              endTime: startDate && endDate ? `${format(new Date(endDate), 'yyyy-MM-dd ')} 23:59:59` : '',
              symbols: filterItemsSelector.tokenList.length
                ? filterItemsSelector.tokenList.map((e) => e.name).join()
                : '',
              page: 0,
              size: 9999,
              search,
              chainId,
              categoryIds:
                filtersSearch && filtersSearch.length ? filtersSearch.map((item) => item.id).join() : undefined,
              fromAddress: filterItemsSelector.fromList.join(),
              toAddress: filterItemsSelector.toList.join()
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
  }, [isExportCsv, selectedList, totalItems, activeTab, dataAllTransactions])
  useEffect(() => {
    if (dataAllTransactions && dataAllTransactions.length) setIsExistData(true)
  }, [dataAllTransactions])

  useEffect(() => {
    if (activeTab !== ETransactionType.ALL) {
      setSelectedList([])
    }
  }, [activeTab])

  useEffect(() => {
    if (csvData.length > 0) {
      const { current } = csvLink as any
      current?.link?.click()
      setCSVData([])
      setSelectedList([])
      setCsvLoading(false)
    }
  }, [csvData])

  // handle xero csv export
  const handleXeroSelectTxn = (item: ITransaction) => {
    setSelectedXeroList((prev) =>
      prev.find((prevItem) => prevItem === item) ? prev.filter((prevI) => prevI !== item) : [...prev, item]
    )
  }
  const handleXeroSelectAllTxn = () => {
    if (selectedXeroList.length === dataAllTransactions.length) {
      setSelectedXeroList([])
    } else {
      setSelectedXeroList([...dataAllTransactions])
    }
  }
  // xero async data

  useEffect(() => {
    if (isExportCsvXero) {
      const asyncCSVXeroData = async () => {
        setCsvXeroLoading(true)
        triggerXero({
          organizationId: currentOrganization.publicId,
          orgName: currentOrganization.name,
          params: {
            startTime: startDate && endDate ? `${format(new Date(startDate), 'yyyy-MM-dd ')} 00:00:00` : '',
            endTime: startDate && endDate ? `${format(new Date(endDate), 'yyyy-MM-dd ')} 23:59:59` : '',
            symbols:
              filterItemsSelector.tokenList.length > 0 ? filterItemsSelector.tokenList.map((e) => e.name).join() : '',
            page,
            size: offset,
            search,
            chainId,
            categoryIds:
              filtersSearch && filtersSearch.length ? filtersSearch.map((item) => item.id).join() : undefined,
            fromAddress: filterItemsSelector.fromList.join(),
            toAddress: filterItemsSelector.toList.join()
          }
        })

        setCsvXeroLoading(false)
      }
      asyncCSVXeroData()
      setIsExportCsvXero(false)
    }
  }, [
    chainId,
    currentOrganization,
    endDate,
    filterItemsSelector,
    filtersSearch,
    isExportCsvXero,
    offset,
    page,
    search,
    startDate
  ])

  useEffect(() => {
    if (transactionLoading) {
      setSelectedXeroList([])
    }
  }, [transactionLoading])

  useEffect(() => {
    if (csvXeroData.length > 0) {
      const { current } = csvXeroLink as any
      current.link.click()
      setCSVXeroData([])
      setSelectedXeroList([])
      setCsvXeroLoading(false)
    }
  }, [csvXeroData])

  const tokenItems = []

  useEffect(() => {
    handleResetAllFilter()
  }, [activeTab])

  const handleResetAllFilter = (e?: any) => {
    e?.stopPropagation()
    handleResetAll()
    handleResetCheckboxValues()
    setSelectedCategoryFilters([])
  }

  return (
    <div className="bg-white rounded-2xl mt-6 font-inter text-base px-6 pb-7">
      {isExistData && (
        <>
          <div className="flex justify-between">
            <TextField
              placeholder="Search by entering Transaction Hash or Contact"
              textSearch={search}
              search
              handleReset={setSearch}
              classNameContainer="w-[43%] max-w-[385px]"
              name="searchKey"
              control={control}
              classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter flex items-center px-[14px] py-[10px] placeholder:italic"
            />
            <div className="flex items-center gap-2">
              <FilterTransactionByDate
                handleSubmit={handleSubmit}
                startDate={startDate}
                setStartDate={setStartDate}
                handleResetDate={handleResetDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
              <button
                type="button"
                className={`border rounded flex justify-center items-center border-dashboard-border-200 px-4 py-[9px] gap-2 text-sm leading-5 text-dashboard-main flex-1 ${
                  isShowDropDown && 'shadow-button'
                }`}
                onClick={() => {
                  setIsShowDropDown(!isShowDropDown)
                  // setOpenSubFilter(false)
                }}
              >
                {countTotalFilterApplied > 0
                  ? countTotalFilterApplied === 1
                    ? `${countTotalFilterApplied} Filter Applied`
                    : `${countTotalFilterApplied} Filters Applied`
                  : 'Filters'}

                <Image src={filter} alt="icon" width={16} height={16} />
                {countTotalFilterApplied > 0 && (
                  <>
                    <DividerVertical space="mx-2" />
                    <button
                      type="button"
                      onClick={handleResetAllFilter}
                      className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200 hover:bg-gray-200"
                    >
                      <Image src={Close} alt="close" height={10} width={10} />
                    </button>
                  </>
                )}
              </button>
            </div>
          </div>
          <SelectFilterTransaction
            categoriesList={categoriesList}
            isShowDropDown={isShowDropDown}
            onAppendCheckboxValues={handleAppendCheckboxValues}
            handleSubmit={handleSubmit}
            tokenList={tokenItems}
            expandTypes={expandTypes}
            checkboxValues={checkboxValues}
            categoryFilters={categoryFilters}
            onExpandTypes={handleExpandTypes}
            onCheckCategory={handleCheckCategory}
            onResetCheckboxValues={handleResetCheckboxValues}
            onCheckAllCategoriesByType={handleCheckAllCategoriesByType}
            setSelectedCategoryFilters={setSelectedCategoryFilters}
            selectedCategoryFilters={selectedCategoryFilters}
            filterItemsSelector={filterItemsSelector}
          />
        </>
      )}
      <div>
        <CSVLink
          target="_blank"
          ref={csvLink}
          filename={currentOrganization && `${currentOrganization.name}_txns_${format(new Date(), 'dd-MM-yyyy')}`}
          data={csvExportData(csvData, sourceOfFunds, recipients, chainId, price)}
          headers={csvHeaders}
        />
        <CSVLink
          target="_blank"
          ref={csvXeroLink}
          filename={currentOrganization && `${currentOrganization.name}_txns_${format(new Date(), 'dd-MM-yyyy')}`}
          data={csvXeroExportData(csvData, sourceOfFunds, chainId, price)}
          headers={csvXeroHeader}
        />
      </div>

      {
        // !account ? (
        //   <NotFound
        //     title="No Source of Funds Connected"
        //     subTitle="Add a source of fund to view all transactions"
        //     icon={document}
        //     className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
        //     label="Add Fund"
        //     onClick={() => setShowImportFund(true)}
        //   />
        // ) :
        dataAllTransactions.length > 0 ? (
          <div
            className={`mt-4 ${
              dataAllTransactions.length
                ? isShowDropDown
                  ? 'h-[calc(100vh-493px)]'
                  : 'h-[calc(100vh-407px)]'
                : 'h-[calc(100vh-364px)]'
            }  overflow-auto scrollbar w-full rounded-lg border border-grey-200`}
          >
            <div className="min-w-fit">
              <div className="flex items-center flex-1 cursor-pointer bg-grey-100 px-4 py-3 text-xs text-blanca-600 border-b border-grey-200 rounded-t-lg">
                <div className="pl-2 pr-6">
                  <input
                    checked={
                      selectedList &&
                      dataAllTransactions &&
                      dataAllTransactions.every((txn) => selectedList.findIndex((item) => item.id === txn.id) >= 0)
                    }
                    // id={`checkbox-${valueTransaction.id}-${amount}`}
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleXeroSelectAllTxn()
                      handleSelectAllTransaction()
                    }}
                    className="w-5 h-5 text-dashboard-main bg-gray-100 rounded-[4px] border-gray-300 focus:ring-dashboard-main checked:[#E83F6D] accent-dashboard-main"
                  />
                </div>
                <div className="flex items-center w-[207px] mr-6">To</div>
                <div className="flex flex-1 mr-6 justify-between">
                  <div className="min-w-[150px] mr-6 ml-[80px] 3xl:ml-0">Token Amount</div>
                  <div className="min-w-[160px] flex items-center mr-6">Category</div>
                  <div className="items-center flex min-w-[127px] 3xl:mr-0 mr-[80px]">Status</div>
                </div>
                <div className="w-[220px]">Actions</div>
              </div>
              <div
                ref={tableRef}
                className={`${
                  dataAllTransactions.length
                    ? isShowDropDown
                      ? 'h-[calc(100vh-560px)]'
                      : 'h-[calc(100vh-470px)]'
                    : 'h-[calc(100vh-364px)]'
                }  overflow-auto scrollbar w-full`}
              >
                {dataAllTransactions.length > 0 &&
                  dataAllTransactions.map((item, index) => {
                    if (item.type === ETransactionType.INCOMING) {
                      return (
                        <IncomingTransactionsInfo
                          setSelectedList={setSelectedList || setSelectedXeroList}
                          selectedList={selectedList || selectedXeroList}
                          onSelectTransaction={handleSelectTransaction || handleXeroSelectTxn}
                          // categories={categoriesTransactionFiltered(item.type)}
                          categories={categories}
                          refetch={refetch}
                          isSource={isSource}
                          key={item.id}
                          valuesIncomingTransactions={item}
                          isLastItem={index + 1 === dataAllTransactions.length}
                          isTableOverflowed={isTableOverflowed}
                        />
                      )
                    }
                    return (
                      <OutgoingTransactionsInfo
                        setSelectedList={setSelectedList || setSelectedXeroList}
                        selectedList={selectedList || selectedXeroList}
                        onSelectTransaction={handleSelectTransaction || handleXeroSelectTxn}
                        isSource={isSource}
                        key={item.id}
                        valuesOutgoingTransactions={item}
                        // categories={categoriesTransactionFiltered(item.type)}
                        categories={categories}
                        refetch={refetch}
                        isLastItem={index + 1 === dataAllTransactions.length}
                        isTableOverflowed={isTableOverflowed}
                      />
                    )
                  })}
              </div>
            </div>
            {/* {dataAllTransactions.length > 0 && (
            <PaginateTransactions
              currentPage={currentPage}
              setPage={setPage}
              size={size}
              totalPages={totalPages}
              totalItems={totalItems}
            />
          )} */}
          </div>
        ) : sourceOfFunds.items.length > 0 ? (
          <NotFound
            title="No Transactions Found."
            // subTitle="Connect a safe to initiate payouts and deposits."
            icon={document}
            // onClick={onShowImportFund}
            // label="Connect a Safe"
          />
        ) : (
          <NotFound
            title="No Source of Funds Connected"
            subTitle="Add a source of fund to view all transactions"
            icon={document}
            className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
            label="Add Fund"
            onClick={() => setShowImportFund(true)}
          />
        )
      }
      {dataAllTransactions.length > 0 && (
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

export default AllTransactions
