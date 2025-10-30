import DropDown from '@/components/DropDown/DropDown'
import { useEffect, useState } from 'react'
import Button from '@/components-v2/atoms/Button'

const SelectCollection = ({ collections, onSelectCollection, isGroupCollection }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [collection, setCollection] = useState<string>('All Collections')

  useEffect(() => {
    setCollection('All Collections')
  }, [isGroupCollection])

  const triggerButton = () => (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        setIsShowDropDown(!isShowDropDown)
      }}
      variant="ghost"
      height={32}
      label={collection}
      trailingIcon={<img src="/svg/Dropdown.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />}
    />
    // <button
    //   // disabled={isWalletSyncing}
    //   type="button"
    //   className={`${
    //     // collection ? 'bg-grey-100' : 'bg-white'
    //     'bg-white'
    //   } flex items-center justify-between p-[10px] rounded-lg focus:outline-none leading-5 border border-blanca-300 disabled:cursor-not-allowed disabled:opacity-50 gap-3 w-[148px] h-[32px]
    // ${isShowDropDown && 'shadow-button'}`}
    //   onClick={(e) => {
    //     e.stopPropagation()
    //     setIsShowDropDown(!isShowDropDown)
    //   }}
    // >
    //   <div className="flex items-center text-sm text-neutral-900">{collection}</div>
    //   <div className="cursor-pointer flex justify-between items-center w-fit h-fit py-[6px] px-1 rounded-sm flex-shrink-0">
    //     <img src="/svg/Dropdown.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
    //   </div>
    // </button>
  )

  const onChangeCollection = (item: string) => {
    setCollection(item)
  }
  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={triggerButton()}
      maxHeight="max-h-[300px]"
      // placement={top ? EPlacement.TOPRIGHT : EPlacement.BOTTOMRIGHT}
      // widthBtn={fullWidth ? 'w-full' : 'w-[235px]'}
      // position={top ? 'top' : 'bottom'}
      // bottomPosition={top && 'bottom-[54px]'}
    >
      <div className="w-full flex flex-col">
        {collections &&
          collections.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                setIsShowDropDown(false)
                onChangeCollection(item.name)
                onSelectCollection(item.id)
              }}
              className={`text-gray-700 flex justify-between items-center bg-white w-full h-[42px] py-2 px-4 max-w-[200px] truncate text-sm text-left hover:bg-grey-100 font-inter disabled:cursor-not-allowed ${
                item.name === collection && 'bg-grey-200'
              }`}
            >
              {item.name}
            </button>
          ))}
      </div>
    </DropDown>
  )
}

export default SelectCollection
