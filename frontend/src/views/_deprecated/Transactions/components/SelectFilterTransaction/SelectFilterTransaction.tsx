import { CategoryType, ICategories, ICategoryFilters } from '@/slice/categories/interfaces'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import Close from '@/public/svg/CloseGray.svg'
import { useAppDispatch, useAppSelector } from '@/state'
import { getTokenImageBySymbol } from '@/utils/getTokenImageBySymbol'
import Image from 'next/legacy/image'
import React, { useMemo, useState } from 'react'
import { EFilterItem } from '../../interface'
import FilterByCategory from '../FilterTransaction/FilterByCategory'
import DropDownFilterTransaction, { EPlacementFilterTransaction } from './DropdownFilterTransaction'
import FilterBySelectFromOrTo from './FilterBySelectFromOrTo'
import TokenNameFilter from './TokenNameFilter/TokenNameFilter'
import { setFiltersSearch } from '@/slice/categories/categories-slice'
import {
  IFilterItems,
  listFilterSelector,
  setFilterFromItemList,
  setFilterToItemList,
  setFilterTokenItemList
} from '@/slice/old-tx/transactions-slide'

interface ISelectFilterTransaction {
  isShowDropDown: boolean
  handleSubmit: () => void
  tokenList: any[]
  expandTypes: string[]
  checkboxValues: string[]
  categoriesList: string[]
  categoryFilters: ICategoryFilters
  onExpandTypes: (type: CategoryType) => void
  onCheckCategory: (category: string) => void
  onResetCheckboxValues: () => void
  onCheckAllCategoriesByType: (type: CategoryType) => void
  onAppendCheckboxValues: (list: ICategories[]) => void
  setSelectedCategoryFilters: React.Dispatch<React.SetStateAction<string[]>>
  selectedCategoryFilters: string[]
  filterItemsSelector: IFilterItems
}

const SelectFilterTransaction: React.FC<ISelectFilterTransaction> = ({
  handleSubmit,
  isShowDropDown,
  tokenList,
  categoryFilters,
  checkboxValues,
  categoriesList,
  expandTypes,
  onCheckAllCategoriesByType,
  onCheckCategory,
  onExpandTypes,
  onResetCheckboxValues,
  onAppendCheckboxValues,
  setSelectedCategoryFilters,
  selectedCategoryFilters,
  filterItemsSelector
}) => {
  // Custom hooks and selectors
  const dispatch = useAppDispatch()
  const listFilter = useAppSelector(listFilterSelector)

  // Hooks
  const [showDropdownFilterToken, setShowDropDownFilterToken] = useState(false)
  const [showDropdownFilterCategory, setShowDropDownFilterCategory] = useState(false)
  const [showDropdownFilterFrom, setShowDropDownFilterFrom] = useState(false)
  const [showDropdownFilterTo, setShowDropDownFilterTo] = useState(false)

  // Format data for filter list From and To
  const dataAllTransactionsFilteredForFrom = useMemo(
    () =>
      listFilter?.from?.map((fromItem, index: number) => ({
        id: `${index}_${fromItem.address}`,
        name: fromItem.name,
        address: fromItem.address
      })),

    [listFilter]
  )
  const dataAllTransactionsFilteredForTo = useMemo(
    () =>
      listFilter?.to?.map((toItem, index: number) => ({
        id: `${index}_${toItem.address}`,
        name: toItem.name,
        address: toItem.address,
        src: getTokenImageBySymbol(toItem?.token?.name),
        symbol: toItem?.token?.name,
        network: toItem?.chain?.name
      })),
    [listFilter]
  )

  // Handle features of filter items
  const handleCloseSubFilter = () => {
    setShowDropDownFilterToken(false)
    setShowDropDownFilterCategory(false)
    setShowDropDownFilterFrom(false)
    setShowDropDownFilterTo(false)
  }
  const handleShowDropDownFilterItem = (filterItem: EFilterItem) => {
    if (filterItem === EFilterItem.TOKEN_NAME) setShowDropDownFilterToken(!showDropdownFilterToken)
    if (filterItem === EFilterItem.CATEGORY) setShowDropDownFilterCategory(!showDropdownFilterCategory)
    if (filterItem === EFilterItem.TO) setShowDropDownFilterTo(!showDropdownFilterTo)
    if (filterItem === EFilterItem.FROM) setShowDropDownFilterFrom(!showDropdownFilterFrom)
  }

  const handleResetFilter = (e, filterItem: EFilterItem) => {
    e.stopPropagation()
    if (filterItem === EFilterItem.TOKEN_NAME) dispatch(setFilterTokenItemList([]))
    if (filterItem === EFilterItem.CATEGORY) {
      dispatch(setFiltersSearch([]))
      setSelectedCategoryFilters([])
      onResetCheckboxValues()
    }
    if (filterItem === EFilterItem.FROM) dispatch(setFilterFromItemList([]))
    if (filterItem === EFilterItem.TO) dispatch(setFilterToItemList([]))
  }
  const handleResetAllFilters = () => {
    dispatch(setFilterTokenItemList([]))
    setSelectedCategoryFilters([])
    onResetCheckboxValues()
    dispatch(setFiltersSearch([]))
    dispatch(setFilterFromItemList([]))
    dispatch(setFilterToItemList([]))
  }
  // Create button to show dropdown
  const triggerDropdownBtn = <T,>(title: string, filterItem: EFilterItem, filterValues: T[], actions: boolean) => (
    <button
      type="button"
      className="bg-white flex items-center justify-between w-full p-[10px] rounded-lg focus:outline-none leading-5 border border-blanca-300 text-primary-pink"
      id="select-div"
      aria-expanded="true"
      aria-haspopup="true"
      onClick={() => handleShowDropDownFilterItem(filterItem)}
    >
      <div className="flex items-center text-sm">
        {`${title} ${filterValues?.length ? `(${filterValues?.length})` : ''}`}
      </div>
      <div className="flex items-center text-xs">
        <DividerVertical />
        {filterValues?.length ? (
          <button
            type="button"
            onClick={(e) => handleResetFilter(e, filterItem)}
            className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200 hover:bg-gray-200"
          >
            <Image src={Close} alt="close" height={10} width={10} />
          </button>
        ) : (
          <div className="cursor-pointer flex justify-between items-center w-fit h-fit py-[6px] px-1 rounded-sm flex-shrink-0">
            <img src="/svg/Dropdown.svg" alt="DownArrow" className={actions ? 'rotate-180 ' : ''} />
          </div>
        )}
      </div>
    </button>
  )

  return (
    <div>
      <div
        className={`bg-grey-100 rounded-lg ${
          isShowDropDown ? 'h-[73px] p-4 mt-3' : 'h-0 overflow-hidden'
        } transition-height duration-150 ease-in-out`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <DropDownFilterTransaction
              isShowDropDown={showDropdownFilterFrom}
              setIsShowDropDown={setShowDropDownFilterFrom}
              triggerButton={triggerDropdownBtn(
                'From',
                EFilterItem.FROM,
                filterItemsSelector.fromList,
                showDropdownFilterFrom
              )}
              maxHeight="max-h-[650px]"
              placement={EPlacementFilterTransaction.BOTTOMRIGHT}
              width="w-full"
            >
              <FilterBySelectFromOrTo
                dataAllTransactionsFiltered={dataAllTransactionsFilteredForFrom}
                title="Select one or more source of funds"
                setFilterValues={setFilterFromItemList}
                filterValues={filterItemsSelector.fromList}
                onCloseModal={handleCloseSubFilter}
                handleSubmit={handleSubmit}
              />
            </DropDownFilterTransaction>
          </div>
          <div className="flex-1">
            <DropDownFilterTransaction
              isShowDropDown={showDropdownFilterTo}
              setIsShowDropDown={setShowDropDownFilterTo}
              triggerButton={triggerDropdownBtn('To', EFilterItem.TO, filterItemsSelector.toList, showDropdownFilterTo)}
              maxHeight="max-h-[650px]"
              placement={EPlacementFilterTransaction.BOTTOMRIGHT}
              width="w-full"
            >
              <FilterBySelectFromOrTo
                dataAllTransactionsFiltered={dataAllTransactionsFilteredForTo}
                title="Select one or more recipients/address"
                setFilterValues={setFilterToItemList}
                filterValues={filterItemsSelector.toList}
                onCloseModal={handleCloseSubFilter}
                handleSubmit={handleSubmit}
              />
            </DropDownFilterTransaction>
          </div>
          <div className="flex-1">
            <DropDownFilterTransaction
              isShowDropDown={showDropdownFilterToken}
              setIsShowDropDown={setShowDropDownFilterToken}
              triggerButton={triggerDropdownBtn(
                'Token Name',
                EFilterItem.TOKEN_NAME,
                filterItemsSelector.tokenList,
                showDropdownFilterToken
              )}
              maxHeight="max-h-[650px]"
              placement={EPlacementFilterTransaction.BOTTOMRIGHT}
              width="w-full"
            >
              <TokenNameFilter
                token={filterItemsSelector.tokenList}
                setToken={setFilterTokenItemList}
                tokenList={tokenList}
                handleCloseSubFilter={handleCloseSubFilter}
                handleSubmit={handleSubmit}
              />
            </DropDownFilterTransaction>
          </div>
          <div className="flex-1">
            <DropDownFilterTransaction
              isShowDropDown={showDropdownFilterCategory}
              setIsShowDropDown={setShowDropDownFilterCategory}
              triggerButton={triggerDropdownBtn(
                'Category',
                EFilterItem.CATEGORY,
                selectedCategoryFilters,
                showDropdownFilterCategory
              )}
              maxHeight="max-h-[650px]"
              width="w-full"
              placement={EPlacementFilterTransaction.BOTTOMRIGHT}
            >
              <FilterByCategory
                onAppendCheckboxValues={onAppendCheckboxValues}
                categoriesList={categoriesList}
                expandTypes={expandTypes}
                checkboxValues={checkboxValues}
                categoryFilters={categoryFilters}
                onExpandTypes={onExpandTypes}
                onCheckCategory={onCheckCategory}
                onCheckAllCategoriesByType={onCheckAllCategoriesByType}
                onCloseSubFilter={handleCloseSubFilter}
                setSelectedCategoryFilters={setSelectedCategoryFilters}
                selectedCategoryFilters={selectedCategoryFilters}
                handleSubmit={handleSubmit}
              />
            </DropDownFilterTransaction>
          </div>
          <button
            type="button"
            className={`bg-grey-200 hover:bg-grey-201 rounded px-3 py-[7px] text-xs text-grey-800 whitespace-nowrap ${
              filterItemsSelector.fromList.length < 1 &&
              filterItemsSelector.toList.length < 1 &&
              filterItemsSelector.tokenList.length < 1 &&
              selectedCategoryFilters?.length < 1
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
            onClick={handleResetAllFilters}
            disabled={
              filterItemsSelector.fromList.length < 1 &&
              filterItemsSelector.toList.length < 1 &&
              filterItemsSelector.tokenList.length < 1 &&
              selectedCategoryFilters?.length < 1
            }
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectFilterTransaction
