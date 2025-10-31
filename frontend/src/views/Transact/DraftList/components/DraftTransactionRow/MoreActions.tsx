/* eslint-disable react/no-array-index-key */
import DropDown from '@/components/DropDown/DropDown'
import MoreAction from '@/public/svg/MoreAction.svg'
import Image from 'next/legacy/image'
import { useState } from 'react'
import Button from '@/components-v2/atoms/Button'

const MoreActions = ({ actions, rowData }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)

  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      zIndex={9}
      triggerButton={
        <Button
          variant="ghost"
          leadingIcon={<Image src={MoreAction} />}
          height={32}
          classNames="px-3 border-none !justify-start"
          onClick={(e) => {
            e.stopPropagation()
            setIsShowDropDown(!isShowDropDown)
          }}
        />
      }
    >
      <div className="w-[140px] flex flex-col">
        {actions?.map((_item, index) => (
          <Button
            key={index}
            variant="ghost"
            label={_item.label}
            height={32}
            classNames={`px-3 border-none !justify-start ${_item.label === 'Delete' && '!text-error-500'}`}
            onClick={(e) => {
              e.stopPropagation()
              _item.onClick(rowData)
              setIsShowDropDown(!isShowDropDown)
            }}
          />
        ))}
      </div>
    </DropDown>
  )
}

export default MoreActions
