/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react'
import { IRecipientList } from '../../interfaces'
import RecipientListItem from './RecipientListItem'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'

const RecipientList: React.FC<IRecipientList> = ({ dataRecipient, onShowDetailModal, onCheckboxChange }) => {
  const tableRef = useRef<HTMLDivElement>(null)
  const showBanner = useAppSelector(showBannerSelector)
  const [isTableOverflowed, setIsTableOverflowed] = useState(false)

  useEffect(() => {
    if (tableRef.current) {
      setIsTableOverflowed(tableRef.current.scrollHeight > tableRef.current.clientHeight)
    }
  }, [dataRecipient])
  return (
    <div className="rounded-lg border border-[#CECECC]">
      <div className="bg-grey-100 border-b border-[#CECECC] flex w-full justify-between text-xs text-dashboard-sub rounded-t-lg">
        <div className="pl-4 py-2 flex items-center flex-1">
          <div className="w-1/2 flex gap-8">
            {/* <Checkbox
            isChecked={totalCheck}
            onChange={(e) => setTotalCheck(e.target.checked)}
            accentColor="accent-grey-900"
          /> */}
            <div>Name</div>
          </div>
          <div className="flex-1">Address</div>
        </div>
        <div className="flex w-[37%] items-center pr-4">
          <div className="w-1/2">Last Updated</div>
          <div className="w-1/2 flex">
            <div>Actions</div>
          </div>
        </div>
      </div>
      <div
        ref={tableRef}
        className={`${showBanner ? 'h-[calc(100vh-478px)]' : 'h-[calc(100vh-412px)]'}  overflow-auto scrollbar`}
      >
        {dataRecipient?.map((item, index) => (
          <RecipientListItem
            organisationName={item.organisationName}
            id={item.id}
            key={index}
            name={item.name}
            time={item.time}
            updatedAt={item.updatedAt}
            active={item.active}
            checked={item.checked}
            addresses={item.addresses}
            onShowDetailRecipient={() => onShowDetailModal(item)}
            onCheckboxChange={() => onCheckboxChange(item.id)}
            isLastItem={index + 1 === dataRecipient?.length}
            isTableOverflowed={isTableOverflowed}
          />
        ))}
      </div>
    </div>
  )
}

export default RecipientList
