/* eslint-disable react/no-array-index-key */
import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { size } from '@/constants/pagePagination'
import ArrowPagination from '@/components/ArrowPagination/ArrowPagination'
import { ITransactionQueue } from '../interface'
import TransactionQueueItem from './TransactionQueueItem'

const TransactionQueue: React.FC<ITransactionQueue> = ({
  setShowError,
  onReject,
  setError,
  source,
  list,
  page,
  setPage,
  onShowImportModal,
  currentTableData,
  expandList,
  toggleExpandTransaction,
  onExecuted,
  onSign,
  totalTransactions,
  sourceList,
  sourceAddress,
  onShowTransaction,
  totalCount,
  price
}) => {
  const { account } = useWeb3React()

  return (
    <div className="overflow-x-auto font-inter py-6 relative ">
      {sourceList && sourceAddress !== sourceList[0] && currentTableData && currentTableData.length > 0 ? (
        currentTableData.map((item, index) => (
          <TransactionQueueItem
            key={index}
            expandList={expandList}
            totalTransactions={totalTransactions}
            item={item}
            onShowTransaction={onShowTransaction}
            price={price}
            toggleExpandTransaction={toggleExpandTransaction}
            onExecuted={onExecuted}
            onReject={onReject}
            onSign={onSign}
            setError={setError}
            setShowError={setShowError}
            source={source}
          />
        ))
      ) : sourceList && sourceAddress !== sourceList[0] && currentTableData && currentTableData.length === 0 ? (
        account ? (
          <div className="flex justify-center font-inter flex-col py-16 items-center h-[316px]">
            <img src="/svg/Transaction.svg" alt="Transaction" />
            <h1 className="text-black-0 font-semibold mt-4">No transactions awaiting approval found.</h1>
          </div>
        ) : (
          <div className="flex justify-center font-inter flex-col py-24 items-center h-[364px]">
            <img src="/svg/Pig.svg" alt="Transaction" />
            <h1 className="text-black-0 font-semibold mt-4">Looking for your transaction queue?</h1>
            <p className=" text-sm text-black-70 mb-8">Connect your wallet to get started!</p>
          </div>
        )
      ) : (
        <div className="flex justify-center font-inter flex-col py-16 items-center h-[316px] ">
          <img src="/svg/Transaction.svg" alt="Transaction" />
          <h1 className="text-black-0 font-semibold mt-4">Don’t see any transactions awaiting approval yet?</h1>
          <p className=" text-sm text-black-70 mb-8">Connect a safe to view all pending transactions</p>
          <button
            type="button"
            onClick={onShowImportModal}
            className="bg-gray-1200 px-8 py-4 rounded-lg text-black-0 font-semibold"
          >
            Connect a safe
          </button>
        </div>
      )}
      {list && list.length > 0 && (
        <div className="pt-4 border-t mt-8">
          <ArrowPagination
            loading
            currentPage={page}
            onPageChange={setPage}
            pageSize={size}
            totalCount={totalCount && totalCount}
          />
        </div>
      )}
    </div>
  )
}

export default TransactionQueue
