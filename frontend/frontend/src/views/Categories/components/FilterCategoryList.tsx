import searchIcon from '@/assets/svg/search.svg'
import Checkbox from '@/components/Checkbox/Checkbox'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import TextField from '@/components/TextField/TextField'
import { CATEGORY_TYPES } from '@/constants/categoryTypes'
import { useDebounce } from '@/hooks/useDebounce'
import Close from '@/public/svg/CloseGray.svg'
import Image from 'next/legacy/image'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'

interface IFilterCategoryList {
  setFilterData: React.Dispatch<React.SetStateAction<string[]>>
  filterData: string[]
  setPage: React.Dispatch<React.SetStateAction<number>>
}

const FilterCategoryList: React.FC<IFilterCategoryList> = ({ setFilterData, filterData, setPage }) => {
  const [text, setText] = useState('')
  const { debouncedValue: search } = useDebounce(text, 500)
  const [filterItemSelected, setFilterItemSelected] = useState<string[]>(filterData)
  const [showDropdown, setShowDropDown] = useState(false)

  useEffect(() => {
    if (!showDropdown) {
      setText('')
    }
  }, [setText, showDropdown])

  const handleShowDropDown = () => {
    setShowDropDown(!showDropdown)
  }
  // Handle select type categories
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

  // Handle search categories
  const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  const handleResetText = () => {
    setText('')
  }

  const listType = useMemo(
    () =>
      CATEGORY_TYPES.sort((a, b) => {
        if (a.type < b.type) {
          return -1
        }
        if (a.type > b.type) {
          return 1
        }
        return 0
      }).filter((item) => {
        if (!search) {
          return item
        }
        return item.type.toLowerCase().includes(search.trim().toLowerCase())
      }),
    [search]
  )

  // Handle reset filter
  const handleResetFilter = (e) => {
    e.stopPropagation()
    setFilterData([])
    setFilterItemSelected([])
  }

  const handleApplyFilterByType = () => {
    setPage(0)
    setFilterData(filterItemSelected)
    setShowDropDown(false)
    setText('')
  }

  const handleOutsideClick = () => {
    setFilterItemSelected(filterData)
  }

  return (
    <DropDown
      isShowDropDown={showDropdown}
      setIsShowDropDown={setShowDropDown}
      triggerButton={
        <button
          type="button"
          className="border rounded flex items-center border-dashboard-border-200 px-3 h-[34px] gap-2"
          onClick={handleShowDropDown}
        >
          <div className="text-dashboard-main text-sm">Filter By Type</div>
          <img src="/svg/filter-funnel-02.svg" alt="icon" />
          {filterData.length ? (
            <div className="flex items-center text-sm text-dashboard-main">
              <div>{`(${filterData.length})`}</div>
              <DividerVertical />

              <button
                type="button"
                onClick={handleResetFilter}
                className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200 hover:bg-gray-200"
              >
                <Image src={Close} alt="close" height={10} width={10} />
              </button>
            </div>
          ) : null}
        </button>
      }
      maxHeight="max-h-[400px]"
      placement={EPlacement.BOTTOMRIGHT}
      outsideClick={handleOutsideClick}
    >
      <div className="w-[235px] flex flex-col">
        <div className="text-xs text-grey-400 px-4 pt-3 pb-1">Select one or more types</div>
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
        {listType.length ? (
          <div className="max-h-[150px] overflow-y-auto scrollbar">
            {listType?.map((item) => {
              const hasChecked = filterItemSelected?.findIndex((i) => i === item.type) !== -1
              return (
                item && (
                  <button
                    type="button"
                    key={item.id}
                    className={`${
                      filterItemSelected && filterItemSelected.some((i) => i === item.type)
                        ? 'bg-dashboard-background'
                        : 'bg-white hover:bg-grey-200'
                    } p-2 text-sm text-dashboard-main px-4 cursor-pointer truncate w-full text-left rounded flex items-center`}
                    onClick={() => {
                      handleCheckValue(item.type)
                    }}
                  >
                    <Checkbox
                      value={item.type}
                      isChecked={hasChecked}
                      onChange={(event) => {
                        event.stopPropagation()
                        handleCheckbox(event, item.type)
                      }}
                    />
                    <div className="flex items-center justify-between pl-3 flex-1">
                      {item.type}
                      {filterItemSelected && filterItemSelected.some((i) => i === item.type) && (
                        <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4" />
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
            onClick={() => {
              setShowDropDown(false)
              setFilterItemSelected(filterData)
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className={
              filterData.length > 0 || filterItemSelected.length > 0
                ? 'text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter'
                : 'text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter opacity-60 cursor-not-allowed'
            }
            onClick={handleApplyFilterByType}
            disabled={filterData.length < 1 && filterItemSelected.length < 1}
          >
            Apply
          </button>
        </div>
      </div>
    </DropDown>
  )
}

export default FilterCategoryList
