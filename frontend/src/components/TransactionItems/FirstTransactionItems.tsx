import { ITransaction } from '@/slice/old-tx/interface'
import React from 'react'

export interface IFirstTransactionItems {
  isChecked: boolean
  blockNumber: string
  amount: string
  noArrow: boolean
  disabled: boolean
  isExpanded: boolean
  nonce: string
  currentNonce?: number
  onSelectTransaction: (item: ITransaction) => void
  selectedList: ITransaction[]
  valueTransaction: ITransaction
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const FirstTransactionItems: React.FC<IFirstTransactionItems> = ({
  amount,
  blockNumber,
  isChecked,
  currentNonce,
  isExpanded,
  noArrow,
  nonce,
  onSelectTransaction,
  valueTransaction,
  selectedList,
  onClick
}) => (
  <div className="flex items-center gap-3 flex-shrink-0">
    <input
      checked={selectedList && selectedList.includes(valueTransaction)}
      id={`checkbox-${blockNumber}-${amount}`}
      type="checkbox"
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation()
        onSelectTransaction(valueTransaction)
      }}
      className="w-5 h-5 text-dashboard-main bg-gray-100 rounded-[4px] border-gray-300 focus:ring-dashboard-main checked:[#E83F6D] accent-dashboard-main"
    />
    <div>
      {!noArrow && (
        <button type="button" onClick={onClick} className="flex items-center gap-3">
          <div className={isExpanded ? '' : 'rotate-[30deg]'}>
            <img src="/svg/ExpandArrow.svg" alt="ExpandArrow" />
          </div>

          {(nonce || nonce === '0') && (
            <div className="bg-white rounded-lg px-4 py-[10px] min-w-[102px]">
              <div className="text-sm leading-5 font-mono font-normal whitespace-nowrap">Nonce {nonce}</div>
            </div>
          )}
        </button>
      )}
    </div>
  </div>
)

export default FirstTransactionItems
