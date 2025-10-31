import Modal from '@/components/Modal'
import { ITransactionInQueueTab } from '@/views/Recipients/interfaces'
import React, { useState } from 'react'
import TransactionInQueueInfo from './TransactionInQueueInfo'
import TransactionInQueueItem from './TransactionInRecipientItem'

const TransactionInQueueTab: React.FC<ITransactionInQueueTab> = ({ dataListQueue }) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <div className="border border-dashboard-border-200 rounded-lg text-sm font-medium text-dashboard-main">
      <div className="flex bg-secondary-gray text-xs text-dashboard-sub gap-4 px-4 py-2">
        <div className="w-[26%]">To</div>
        <div className="w-[22%]">Total Amount</div>
        <div className="w-[23%]">Status</div>
        <div>Category</div>
      </div>
      {(dataListQueue || []).map((item) => (
        <TransactionInQueueInfo valueTransactionInQueue={item} />
      ))}
    </div>
  )
}

export default TransactionInQueueTab
