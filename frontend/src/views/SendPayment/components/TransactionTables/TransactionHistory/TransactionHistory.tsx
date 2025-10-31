/* eslint-disable react/no-array-index-key */
import React from 'react'
import { size } from '@/constants/pagePagination'
import ArrowPagination from '@/components/ArrowPagination/ArrowPagination'
import { ITransactionHistory } from '../interface'
import MetamaskHistory from '../../MetamaskHistory/MetamaskHistory'
import TransactionHistoryItem from './TransactionHistoryItem'

const TransactionHistory: React.FC<ITransactionHistory> = ({
  account,
  page,
  price,
  sourceList,
  sourceAddress,
  metamaskHistory,
  totalCountHistory,
  expandListHistory,
  setMetamaskTransactions,
  currentTableDataHistory,
  setPage,
  onShowTransaction,
  toggleExpandTransaction,
  onShowTransactionMetaMask,
  setConnectError
}) => (
  <div className="overflow-x-auto font-inter py-6 relative ">
    {sourceAddress && sourceList && (sourceAddress !== account || sourceAddress !== sourceList[0]) ? (
      currentTableDataHistory.length > 0 ? (
        currentTableDataHistory
          .filter((data) => data.isExecuted === true)
          .map((item, index) => (
            <TransactionHistoryItem
              key={index}
              expandListHistory={expandListHistory}
              item={item}
              index={index}
              price={price}
              onShowTransaction={onShowTransaction}
              toggleExpandTransaction={toggleExpandTransaction}
            />
          ))
      ) : (
        <div className="flex justify-center font-inter flex-col py-16 items-center h-[316px]">
          <img src="/svg/Transaction.svg" alt="Transaction" />
          <h1 className="text-black-0 font-semibold mt-4">No transactions found.</h1>
        </div>
      )
    ) : (
      <MetamaskHistory
        price={price}
        sourceList={sourceList}
        sourceAddress={sourceAddress}
        metamaskHistory={metamaskHistory}
        setMetamaskTransactions={setMetamaskTransactions}
        toggleExpandTransaction={toggleExpandTransaction}
        onShowTransactionMetaMask={onShowTransactionMetaMask}
        setConnectError={setConnectError}
      />
    )}
    {sourceList &&
      sourceAddress !== sourceList[0] &&
      currentTableDataHistory.filter((data) => data.isExecuted === true).length > 0 && (
        <div className="pt-4 border-t mt-8">
          <ArrowPagination
            loading
            currentPage={page}
            onPageChange={setPage}
            pageSize={size}
            totalCount={totalCountHistory && totalCountHistory}
          />
        </div>
      )}
  </div>
)
export default TransactionHistory
