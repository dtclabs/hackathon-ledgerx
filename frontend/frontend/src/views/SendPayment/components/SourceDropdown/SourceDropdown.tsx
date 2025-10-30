import React, { useMemo, useState } from 'react'
import Image from 'next/legacy/image'
import { useWeb3React } from '@web3-react/core'
import DropDown from '@/components/DropDown/DropDown'
import { toShort } from '@/utils/toShort'
import arrowDown from '@/assets/svg/arrowDown.svg'
import SourceButton from './components/SourceButton/SourceButton'
import { formatNumber } from '@/utils/formatNumber'
import { useAppSelector } from '@/state'
import { freeSelectors } from '@/state/free/reducer'
import { logEvent } from '@/utils/logEvent'

interface ISourceDropdown {
  source: string
  setSource: (source: string) => void
  sourceList: string[]
  refreshLoading: boolean
}

const SourceDropdown: React.FC<ISourceDropdown> = ({ source, setSource, sourceList, refreshLoading }) => {
  const { account } = useWeb3React()
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const sourceListSelector = useAppSelector(freeSelectors.sourceListSelector)

  const selectedSource = useMemo(
    () => sourceListSelector.find((item) => item.address && item.address.toLowerCase() === source.toLowerCase()),
    [sourceListSelector, source]
  )

  const groundButtonOption = () => (
    <button
      type="button"
      className={`pl-3 pr-6 h-12  items-center border overflow-y-auto  border-gray-300 rounded-md py-2 font-inter w-full relative flex flex-wrap gap-3  cursor-pointer ${
        refreshLoading ? 'bg-gray-50' : 'bg-white'
      }`}
      id="group-button"
      aria-expanded="true"
      disabled={refreshLoading}
      aria-haspopup="true"
      onClick={() => setIsShowDropDown(!isShowDropDown)}
    >
      <div className="text-sm disabled:bg-white placeholder:text-black-0 placeholder:text-sm  font-medium w-full flex items-center justify-between cursor-pointer">
        {source &&
          `${
            (account && source === account) || (sourceList && source === sourceList[0])
              ? `Metamask - ${toShort(source, 5, 4)}`
              : `Gnosis Safe - ${toShort(source, 5, 4)}`
          }`}
        {selectedSource && typeof selectedSource.balance !== 'undefined' ? (
          <div title={formatNumber(selectedSource.balance)} className="flex gap-1 mr-8 text-xs text-grey-700">
            Total Balance:
            <span className="max-w-[200px] truncate">
              ~ {formatNumber(selectedSource.balance, { maximumFractionDigits: 3, minimumFractionDigits: 3 })}{' '}
            </span>{' '}
            USD
          </div>
        ) : account ? (
          <img className="animate-spin h-6 w-auto mr-8" src="/svg/Loader.svg" alt="loader" />
        ) : (
          <div className="text-sm text-grey-700 leading-5 font-medium">Please connect your wallet to make payment</div>
        )}
      </div>
      <div className="absolute cursor-pointer rounded-[100%] bg-remove-icon h-6 w-6 right-4 flex items-center justify-center">
        <Image src={arrowDown} alt="DownArrow" />
      </div>
    </button>
  )

  return (
    <DropDown
      width="w-full"
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={groundButtonOption()}
    >
      {sourceList && sourceList.length > 0 ? (
        <div className="w-full text-sm" id="group-item-1">
          {sourceList.map((item) => (
            <SourceButton
              account={account}
              key={item}
              sourceList={sourceList}
              item={sourceListSelector && sourceListSelector.find((sourceItem) => sourceItem.address === item)}
              onClick={() => {
                setSource(item)
                setIsShowDropDown(false)
                logEvent({
                  event: 'add_safe',
                  payload: {
                    event_category: 'Payment app',
                    event_label: '',
                    value: item
                  }
                })
              }}
            />
          ))}
        </div>
      ) : (
        <div className="max-h-60 w-full  overflow-y-auto">
          <button
            type="button"
            className="text-black-0 w-full font-medium font-inter flex items-center pl-5 pr-20 py-3 text-sm text-left hover:bg-gray-50"
            tabIndex={-1}
            onClick={() => setIsShowDropDown(false)}
          >
            No source available
          </button>
        </div>
      )}
    </DropDown>
  )
}

export default SourceDropdown
