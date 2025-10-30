import DropDown from '@/components/DropDown/DropDown'
import { useEffect, useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import Button from '@/components-v2/atoms/Button'

const SelectWallet = ({ wallets, onSelectWallet, isGroupCollection, btnClassName = '', dropdownClassName = '' }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [wallet, setWallet] = useState<string>('All Wallets')

  useEffect(() => {
    setWallet('All Wallets')
  }, [isGroupCollection])

  const triggerButton = () => (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        setIsShowDropDown(!isShowDropDown)
      }}
      variant="ghost"
      height={32}
      label={wallet.length < 16 ? wallet : `${wallet.slice(0, 15)}...`}
      trailingIcon={<img src="/svg/Dropdown.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />}
      width="w-full"
    />

    // <button
    //   // disabled={isWalletSyncing}
    //   type="button"
    //   className={`${
    //     // collection ? 'bg-grey-100' : 'bg-white'
    //     'bg-white'
    //   } flex items-center justify-between p-[10px] rounded-lg focus:outline-none leading-5 border border-blanca-300 disabled:cursor-not-allowed disabled:opacity-50 gap-3 w-[148px] h-[32px]
    // ${isShowDropDown && 'shadow-button'}`}
    // >
    //   <div className="cursor-pointer flex justify-between items-center w-fit h-fit py-[6px] px-1 rounded-sm flex-shrink-0">
    //   <img src="/svg/Dropdown.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
    // </div>
    // </button>
  )

  const onChangeWallet = (item: string) => {
    setWallet(item)
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
      <div className={`w-full flex flex-col ${dropdownClassName}`}>
        {wallet?.length > 0 &&
          wallets.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                setIsShowDropDown(false)
                onChangeWallet(item.name)
                onSelectWallet(item.address)
              }}
              className={`text-gray-700 flex justify-between items-center bg-white w-full h-[42px] py-2 px-4 truncate text-sm text-left hover:bg-grey-100 font-inter disabled:cursor-not-allowed ${
                item.name === wallet && 'bg-grey-200'
              }`}
            >
              {item.id !== 'all' && (
                <div className="flex gap-3 max-w-[210px]">
                  <Typography variant="body1" classNames="truncate max-w-[80px]">
                    {item.name}
                  </Typography>
                  <Typography color="secondary">
                    {item.address.slice(0, 6)}...{item.address.slice(-4)}
                  </Typography>
                </div>
              )}
              {item.id === 'all' && (
                <div className="flex gap-3 max-w-[210px]">
                  <Typography variant="body1">{item.name}</Typography>
                </div>
              )}
            </button>
          ))}
      </div>
    </DropDown>
  )
}

export default SelectWallet
