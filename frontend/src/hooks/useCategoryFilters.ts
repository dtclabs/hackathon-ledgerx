import { useGetCategoryFiltersQuery } from '@/api-v2/categories-api'
import { CategoryType, ICategories, ICategoryFilters } from '@/slice/categories/interfaces'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const isTypeFilterChecked = (list: string[], categoryFilters: ICategoryFilters, type: CategoryType) => {
  const categoriesByType = categoryFilters[type]
  const existedList = list.filter((category) => categoriesByType.includes(category))
  return existedList.length === categoriesByType.length
}

export const useCategoryFilters = () => {
  const organizationId = useOrganizationId()
  const { data: categoryFilters } = useGetCategoryFiltersQuery({ orgId: organizationId }, { skip: !organizationId })
  const [checkboxValues, setCheckboxValues] = useState<string[]>([])
  const [expandTypes, setExpandTypes] = useState<string[]>([])

  const categoriesList = useMemo(() => {
    if (categoryFilters) {
      let list: string[] = []
      const types = Object.keys(categoryFilters).filter((type) => !['Direct Costs', 'Equity'].includes(type))
      for (const type of types) {
        list = list.concat(categoryFilters[type])
      }
      return list
    }
    return undefined
  }, [categoryFilters])

  const handleResetCheckboxValues = () => {
    setCheckboxValues([])
  }

  const handleAppendCheckboxValues = (list: ICategories[]) => {
    if (list && list.length) setCheckboxValues(list.map((item) => item.name))
  }

  const handleResetExpandTypes = () => {
    setExpandTypes([])
  }

  const handleCheckCategory = (category: string) => {
    setCheckboxValues((prev) =>
      prev.includes(category) ? prev.filter((prevItem) => prevItem !== category) : prev.concat(category)
    )
  }

  const handleExpandTypes = (type: CategoryType) => {
    setExpandTypes((prev) => (prev.includes(type) ? prev.filter((prevItem) => prevItem !== type) : prev.concat(type)))
  }

  const handleCheckAllCategoriesByType = (type: CategoryType) => {
    const list = categoryFilters[type]
    const categoriesInList = checkboxValues.filter((category) => list.includes(category))
    if (categoriesInList.length < list.length) {
      setCheckboxValues((prev) => Array.from(new Set(prev.concat(list))))
    } else {
      setCheckboxValues((prev) => prev.filter((prevItem) => !list.includes(prevItem)))
    }
  }

  const handleCheckAllCategories = () => {
    if (checkboxValues === categoriesList) {
      setCheckboxValues([])
    } else setCheckboxValues(categoriesList)
  }

  useEffect(() => {
    if (categoryFilters) {
      setExpandTypes(Object.keys(categoryFilters).filter((type) => !['Direct Costs', 'Equity'].includes(type)))
    }
  }, [categoryFilters])

  return {
    expandTypes,
    checkboxValues,
    categoriesList,
    categoryFilters,
    handleExpandTypes,
    handleCheckCategory,
    handleResetExpandTypes,
    handleCheckAllCategories,
    handleResetCheckboxValues,
    handleAppendCheckboxValues,
    handleCheckAllCategoriesByType
  } as {
    expandTypes: string[]
    categoriesList: string[]
    checkboxValues: string[]
    categoryFilters: ICategoryFilters
    handleExpandTypes: (type: CategoryType) => void
    handleCheckCategory: (category: string) => void
    handleResetExpandTypes: () => void
    handleCheckAllCategories: () => void
    handleResetCheckboxValues: () => void
    handleAppendCheckboxValues: (list: ICategories[]) => void
    handleCheckAllCategoriesByType: (type: CategoryType) => void
  }
}
