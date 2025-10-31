import { IDataListQueue } from '@/views/Recipients/interfaces'
import React from 'react'
import TransactionRecipientItem from '../TransactionInQueue/TransactionInRecipientItem'

interface ITransactionHistoryInfo {
  valueTransactionInQueue: IDataListQueue
}

const TransactionHistoryInfo: React.FC<ITransactionHistoryInfo> = ({ valueTransactionInQueue }) => (
  <TransactionRecipientItem
    // onClick={handleShowTransactionDetail}
    key={valueTransactionInQueue.id}
    status={valueTransactionInQueue.status}
    subStatus={valueTransactionInQueue.subStatus}
    method={valueTransactionInQueue.method}
    time={valueTransactionInQueue.time}
    amount={valueTransactionInQueue.amount}
    price={valueTransactionInQueue.price}
    category={valueTransactionInQueue.category}
  />
)

export default TransactionHistoryInfo
