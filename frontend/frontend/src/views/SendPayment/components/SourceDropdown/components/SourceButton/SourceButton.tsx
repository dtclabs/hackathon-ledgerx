import React from 'react'
import { toShort } from '@/utils/toShort'
import { formatNumber } from '@/utils/formatNumber'

const SourceButton: React.FC<{
  item: { address: string; balance?: string }
  onClick: () => void
  sourceList: string[]
  account: string
}> = ({ item, onClick, sourceList, account }) => (
  <button
    type="button"
    className="text-black-0 font-medium w-full font-inter text-sm flex justify-between items-center px-3 py-3  text-left hover:bg-gray-50"
    tabIndex={-1}
    id="group-item-1"
    onClick={onClick}
  >
    {item && item.address && item.address === account ? 'Metamask ' : 'Gnosis Safe '} -{' '}
    {toShort(item && item.address, 5, 4)}
    {item && item.balance ? (
      <div className="flex gap-1 mr-2 text-xs text-grey-700">
        Total Balance:
        <span className="max-w-[200px] truncate ">
          ~ {formatNumber(item.balance, { maximumFractionDigits: 3, minimumFractionDigits: 3 })}{' '}
        </span>{' '}
        USD
      </div>
    ) : (
      <img className="animate-spin h-6 w-auto mr-2" src="/svg/Loader.svg" alt="loader" />
    )}
  </button>
)

export default SourceButton
