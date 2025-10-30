import { CategoryType, ICategories, ICategoryFilters } from '@/slice/categories/interfaces'
import searchIcon from '@/assets/svg/search.svg'
import Checkbox from '@/components/Checkbox/Checkbox'
import TextField from '@/components/TextField/TextField'
import { isTypeFilterChecked } from '@/hooks/useCategoryFilters'
import { useDebounce } from '@/hooks/useDebounce'
import Close from '@/public/svg/CloseGray.svg'
import { filtersSearchSelector, setFiltersSearch } from '@/slice/categories/categories-slice'
import { useAppDispatch, useAppSelector } from '@/state'
import Image from 'next/legacy/image'
import React, { useEffect, useMemo, useState } from 'react'

interface IFilterByCategory {
  expandTypes: string[]
  checkboxValues: string[]
  categoriesList: string[]
  categoryFilters: ICategoryFilters
  onCloseSubFilter: () => void
  onCheckCategory: (category: string) => void
  onExpandTypes: (type: CategoryType) => void
  onCheckAllCategoriesByType: (type: CategoryType) => void
  setSelectedCategoryFilters: (list: string[]) => void
  onAppendCheckboxValues: (list: ICategories[]) => void
  selectedCategoryFilters: string[]
  handleSubmit: () => void
}

const FilterByCategory: React.FC<IFilterByCategory> = ({
  expandTypes,
  checkboxValues,
  categoryFilters,
  categoriesList,
  onExpandTypes,
  onCheckCategory,
  onCloseSubFilter,
  setSelectedCategoryFilters,
  onCheckAllCategoriesByType,
  onAppendCheckboxValues,
  selectedCategoryFilters,
  handleSubmit
}) => {
  const [text, setText] = useState('')
  const { debouncedValue } = useDebounce(text, 300)
  const filtersSearch = useAppSelector(filtersSearchSelector)
  const dispatch = useAppDispatch()

  const handleChangeText = (e) => {
    setText(e.target.value)
  }
  const handleReset = () => {
    setText('')
  }

  useEffect(() => {
    if (filtersSearch) {
      onAppendCheckboxValues(filtersSearch)
    }
  }, [filtersSearch])

  const handleContinue = () => {
    dispatch(setFiltersSearch(checkboxValues))
    setSelectedCategoryFilters(checkboxValues)
    onCloseSubFilter()
    handleSubmit()
  }

  const hasListCategory = useMemo(
    () =>
      Object.keys(categoryFilters)
        .filter((type) => !['Direct Costs', 'Equity'].includes(type))
        .sort()
        .map(
          (item: string) =>
            categoryFilters[item] &&
            categoryFilters[item].filter((category) => category.toLowerCase().includes(debouncedValue.toLowerCase())) &&
            categoryFilters[item].filter((category) => category.toLowerCase().includes(debouncedValue.toLowerCase()))
        )
        .some((checkValueItem) => checkValueItem.length),

    [categoryFilters, debouncedValue]
  )

  return (
    <div className="w-[256px]">
      <div className="text-xs text-grey-400 px-4 pt-3 mb-2">Select one or more subcategories</div>
      <div className="w-full px-1 mb-3">
        <div className="flex items-center border-grey-200 border rounded-lg w-full">
          <div className="flex pl-4 items-center">
            <Image src={searchIcon} width={12} height={12} />
          </div>
          <TextField
            placeholder="Search"
            textSearch="search"
            search
            classNameContainer=" w-full"
            name="searchKey"
            classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic leading-5  w-full font-inter flex items-center px-[14px] py-[10px]"
            onChange={handleChangeText}
            value={text}
          />
          {text && (
            <div className="pr-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
              >
                <Image src={Close} alt="close" height={10} width={10} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="max-h-[calc(100vh-610px)] overflow-auto scrollbar">
        <div>
          {categoriesList && categoriesList.length ? (
            hasListCategory ? (
              Object.keys(categoryFilters)
                .filter((type) => !['Direct Costs', 'Equity'].includes(type))
                .sort()
                .map((item: string) =>
                  categoryFilters[item] &&
                  categoryFilters[item].filter((category) => category.toLowerCase().includes(text.toLowerCase())) &&
                  categoryFilters[item].filter((category) => category.toLowerCase().includes(text.toLowerCase()))
                    .length ? (
                    <div className="border-b border-dashboard-border-200 px-3 pb-3 last:border-none" key={item}>
                      <div className="flex items-center flex-1 gap-2 py-2">
                        <Checkbox
                          disabled={categoryFilters[item].length === 0}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation()
                            onCheckAllCategoriesByType(item as CategoryType)
                          }}
                          isChecked={
                            categoryFilters[item].length === 0
                              ? false
                              : isTypeFilterChecked(checkboxValues, categoryFilters, item as CategoryType)
                          }
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onExpandTypes(item as CategoryType)
                          }}
                          className="flex items-center justify-between flex-1"
                        >
                          <div className="flex items-center gap-2 text-dashboard-sub text-sm">
                            <img src="/svg/Simcard.svg" alt="icon" />
                            {item}
                          </div>
                          <div
                            className={`${
                              expandTypes.includes(item) ? 'rotate-180' : ''
                            } border border-[#EAECF0] cursor-pointer bg-white  flex justify-end items-center w-fit h-fit  py-1 px-[3px] rounded`}
                          >
                            <img src="/svg/Dropdown.svg" alt="dropdown" width={6} height={3} />
                          </div>
                        </button>
                      </div>
                      {expandTypes.includes(item)
                        ? categoryFilters[item] &&
                          categoryFilters[item].filter((category) =>
                            category.toLowerCase().includes(text.toLowerCase())
                          ) &&
                          categoryFilters[item].filter((category) =>
                            category.toLowerCase().includes(text.toLowerCase())
                          ).length
                          ? categoryFilters[item]
                              .filter((category) => category.toLowerCase().includes(text.toLowerCase()))
                              .map((category) => (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onCheckCategory(category)
                                  }}
                                  key={category}
                                  className="w-full"
                                >
                                  <Checkbox
                                    key={category}
                                    value={category}
                                    isChecked={checkboxValues.includes(category)}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                    }}
                                    label={category}
                                    className="flex gap-2 text-sm text-dashboard-main py-2"
                                  />
                                </button>
                              ))
                          : null
                        : undefined}
                    </div>
                  ) : null
                )
            ) : (
              <div className="text-xs text-grey-400 px-4 text-center my-3">No Results Found</div>
            )
          ) : (
            <div className="text-xs text-grey-400 px-4 text-center my-3">No Results Found</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mx-1 mb-1">
        <button
          type="button"
          className="text-grey-800 text-xs font-medium bg-[#F1F1EF] rounded-md px-3 py-2 grow-0 font-inter"
          onClick={onCloseSubFilter}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={selectedCategoryFilters?.length < 1 && checkboxValues.length < 1}
          className={`text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter ${
            selectedCategoryFilters?.length > 0 || checkboxValues.length > 0 ? '' : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={handleContinue}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default FilterByCategory
