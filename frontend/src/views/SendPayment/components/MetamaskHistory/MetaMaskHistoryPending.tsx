/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react'
import { useRecentlyHash } from '@/hooks/useRecentlyHash'
import { IMetamaskHistoryPending } from './interface'
import { IRecentlyTransaction } from '@/state/free/interface'
import MetamaskPendingTransactionTab from '../TransactionTables/TransactionTab/MetamaskPendingTransactionTab'
import MetamaskTransactionProcessingDetail from '../TransactionDetail/MetamaskTransactionProcessingDetail'

export interface IRecentlyTransactionExpanded extends IRecentlyTransaction {
  isExpanded: boolean
}

const MetamaskHistoryPending: React.FC<IMetamaskHistoryPending> = ({ price }) => {
  const { recentlyTransactions } = useRecentlyHash()
  const [transactionDetail, setTransactionDetail] = useState<IRecentlyTransaction>()
  const [showModal, setShowModal] = useState(false)

  const handleShowModal = (transaction: IRecentlyTransaction) => {
    setTransactionDetail(transaction)
    setShowModal(true)
  }

  const [metamaskTransactions, setMetamaskTransactions] = useState<IRecentlyTransactionExpanded[]>([])

  const toggleExpandTransaction = (hash: string) => {
    setMetamaskTransactions((prev) =>
      prev.map((item) => ({ ...item, isExpanded: item.hash === hash ? !item.isExpanded : item.isExpanded }))
    )
  }

  useEffect(() => {
    if (recentlyTransactions) {
      setMetamaskTransactions(
        recentlyTransactions
          .map((item) => ({ ...item, isExpanded: false }))
          .sort((a, b) => b.timestamp - a.timestamp)
      )
    }
  }, [recentlyTransactions])

  return (
    <div>
      {metamaskTransactions && metamaskTransactions.length > 0 && (
        <div>
          {metamaskTransactions &&
            metamaskTransactions.map((item, index) => (
              <MetamaskPendingTransactionTab
                key={index}
                price={price}
                transaction={item}
                onShowModal={handleShowModal}
                toggleExpandTransaction={toggleExpandTransaction}
              />
            ))}
        </div>
      )}
      {showModal && (
        <MetamaskTransactionProcessingDetail
          price={price}
          transaction={transactionDetail}
          setShowModal={setShowModal}
          showModal={showModal}
        />
      )}
    </div>
  )
}

export default MetamaskHistoryPending
