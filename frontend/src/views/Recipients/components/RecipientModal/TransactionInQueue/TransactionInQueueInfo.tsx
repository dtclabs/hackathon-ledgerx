import { IDataListQueue } from '@/views/Recipients/interfaces'
import React, { useState } from 'react'
import TransactionRecipientItem from './TransactionInRecipientItem'

interface ITransactionInQueueInfo {
  valueTransactionInQueue: IDataListQueue
}

const TransactionInQueueInfo: React.FC<ITransactionInQueueInfo> = ({ valueTransactionInQueue }) => (
  <TransactionRecipientItem
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

export default TransactionInQueueInfo
