import { IDataListQueue } from '@/views/Recipients/interfaces'
import React, { useState } from 'react'
import TransactionHistoryInfo from './TransactionHistoryInfo'

interface ITransactionHistoryOfRecipientTab {
  dataTransactionHistory: IDataListQueue[]
}

const TransactionHistoryOfRecipientTab: React.FC<ITransactionHistoryOfRecipientTab> = ({ dataTransactionHistory }) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <div className="border border-dashboard-border-200 rounded-lg text-sm font-medium text-dashboard-main">
      <div className="flex bg-secondary-gray text-xs text-dashboard-sub gap-4 px-4 py-2">
        <div className="w-[26%]">To</div>
        <div className="w-[22%]">Total Amount</div>
        <div className="w-[23%]">Status</div>
        <div>Category</div>
      </div>
      {(dataTransactionHistory || []).map((item) => (
        <TransactionHistoryInfo valueTransactionInQueue={item} />
      ))}
    </div>
  )
}

export default TransactionHistoryOfRecipientTab
