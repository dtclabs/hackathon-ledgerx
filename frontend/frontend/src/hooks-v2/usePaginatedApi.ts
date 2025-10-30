import { useState } from 'react'

const usePaginatedApi = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  // const [search, setSearch] = useState('')
  // const [sort, setSort] = useState('')
  // const [order, setOrder] = useState('')
  // const [filters, setFilters] = useState({})
  // const [resetPagination, setResetPagination] = useState(false)

  const handlePageChange = (_page: number) => {
    setPage(_page)
  }

  const handlePageSizeChange = (_pageSize: number) => {
    setPageSize(_pageSize)
  }

  // const handleSearchChange = (search: string) => {
  //     setSearch(search)
  // }

  // const handleSortChange = (sort: string) => {
  //     setSort(sort)
  // }

  // const handleOrderChange = (order: string) => {
  //     setOrder(order)
  // }

  // const handleFiltersChange = (filters: any) => {
  //     setFilters(filters)
  // }

  // const handleResetPagination = () => {
  //     setResetPagination(true)
  // }

  return {
    page,
    pageSize,
    // search,
    // sort,
    // order,
    // filters,
    // resetPagination,
    handlePageChange,
    handlePageSizeChange
    // handleSearchChange,
    // handleSortChange,
    // handleOrderChange,
    // handleFiltersChange,
    // handleResetPagination
  }
}

export default usePaginatedApi
