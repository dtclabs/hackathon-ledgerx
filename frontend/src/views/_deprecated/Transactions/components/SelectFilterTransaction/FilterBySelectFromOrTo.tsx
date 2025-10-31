import searchIcon from '@/assets/svg/search.svg'
import Checkbox from '@/components/Checkbox/Checkbox'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import TextField from '@/components/TextField/TextField'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import { useDebounce } from '@/hooks/useDebounce'
import Close from '@/public/svg/CloseGray.svg'
import { useAppDispatch } from '@/state'
import { toShort } from '@/utils/toShort'
import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit'
import Image from 'next/legacy/image'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'

interface IFilterBySelectFrom {
  onCloseModal: () => void
  dataAllTransactionsFiltered: {
    id: string
    name: string
    address: string
    network?: string
    src?: string
    symbol?: string
  }[]
  title: string
  setFilterValues: ActionCreatorWithOptionalPayload<string[], string>
  filterValues: string[]
  handleSubmit: () => void
}

const FilterBySelectFromOrTo: React.FC<IFilterBySelectFrom> = ({
  dataAllTransactionsFiltered,
  title,
  filterValues,
  setFilterValues,
  onCloseModal,
  handleSubmit
}) => {
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')
  const { debouncedValue: search } = useDebounce(text, 500)
  const [filterItemSelected, setFilterItemSelected] = useState<string[]>([])
  useEffect(() => {
    setFilterItemSelected(filterValues)
  }, [filterValues])

  // Handle select items
  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>, value: string) => {
    let cloneValue = [...filterItemSelected]
    if (event.target.checked) {
      cloneValue?.push(value)
    } else {
      cloneValue = cloneValue.filter((i) => i !== value)
    }
    setFilterItemSelected([...cloneValue])
  }
  const handleCheckValue = (value: string) => {
    setFilterItemSelected((prev) =>
      prev.includes(value) ? prev.filter((prevItem) => prevItem !== value) : prev.concat(value)
    )
  }

  // Handle search items in filter list
  const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }
  const handleResetText = () => {
    setText('')
  }
  const listData = useMemo(
    () =>
      dataAllTransactionsFiltered?.filter((item) => {
        if (!search) {
          return item
        }
        return (
          item?.name?.toLowerCase().includes(search.trim()?.toLowerCase()) ||
          item?.address?.toLowerCase().includes(search.trim()?.toLowerCase())
        )
      }),
    [dataAllTransactionsFiltered, search]
  )

  // Handle apply filter
  const handleApplyFilterByType = () => {
    dispatch(setFilterValues(filterItemSelected))
    setText('')
    handleSubmit()
    onCloseModal()
  }

  return (
    <div className="w-[300px] flex flex-col">
      <div className="text-xs text-grey-400 px-4 pt-3 pb-1">{title}</div>
      <div className="flex items-center border-grey-200 border rounded-lg w-full mb-2">
        <div className="flex pl-4 items-center">
          <Image src={searchIcon} width={12} height={12} />
        </div>
        <TextField
          placeholder="Search"
          textSearch="search"
          search
          classNameContainer=" w-full"
          name="searchKey"
          classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 leading-5  w-full font-inter flex items-center px-[14px] py-[10px] placeholder:italic"
          onChange={handleChangeText}
          value={text}
        />
        {text && (
          <div className="pr-4">
            <button
              type="button"
              onClick={handleResetText}
              className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
            >
              <Image src={Close} alt="close" height={10} width={10} />
            </button>
          </div>
        )}
      </div>
      {listData?.length ? (
        <div className="max-h-[calc(100vh-610px)] overflow-y-auto scrollbar">
          {listData?.map((item) => {
            const hasChecked = filterItemSelected?.findIndex((i) => i === item.address) !== -1
            return (
              item && (
                <button
                  type="button"
                  key={item.id}
                  className={`${
                    filterItemSelected && filterItemSelected.some((i) => i === item.address)
                      ? 'bg-dashboard-background'
                      : 'bg-white hover:bg-grey-200'
                  } p-3 text-sm text-dashboard-main cursor-pointer truncate w-full text-left rounded flex`}
                  onClick={() => {
                    handleCheckValue(item.address)
                  }}
                >
                  <Checkbox
                    value={item.address}
                    isChecked={hasChecked}
                    onChange={(event) => {
                      event.stopPropagation()
                      handleCheckbox(event, item.address)
                    }}
                  />
                  <div className="flex justify-between pl-3 flex-1 truncate">
                    {item.name ? (
                      <div className="truncate flex-1">
                        <div className="text-sm text-primary-pink truncate">{item.name}</div>
                        <div className="text-xs text-dashboard-sub mt-0.5 flex justify-between">
                          {toShort(item.address, 5, 4)}
                          <div className="flex items-center">
                            <div>{item?.network}</div>
                            {item?.src ? (
                              <>
                                <DividerVertical space="mx-2" />
                                <img src={item?.src} alt={item?.network} width={12} height={12} />
                                <div className="ml-1 w-9">{item?.symbol}</div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <WalletAddress
                          address={item.address}
                          noAvatar
                          noColor
                          showFirst={5}
                          showLast={4}
                          noScan
                          noCopy
                        />
                      </div>
                    )}
                  </div>
                </button>
              )
            )
          })}
        </div>
      ) : (
        <div className=" text-dashboard-main my-3 flex justify-center">No Results Found</div>
      )}

      <div className="flex gap-1 mt-2">
        <button
          type="button"
          className="text-grey-800 text-xs font-medium bg-[#F1F1EF] rounded-md px-3 py-2 grow-0 font-inter"
          onClick={onCloseModal}
        >
          Cancel
        </button>
        <button
          type="button"
          className={
            filterValues.length > 0 || filterItemSelected.length > 0
              ? 'text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter'
              : 'text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter opacity-60 cursor-not-allowed'
          }
          onClick={handleApplyFilterByType}
          disabled={filterValues.length < 1 && filterItemSelected.length < 1}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default FilterBySelectFromOrTo
