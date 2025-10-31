export interface IArrowPagination {
  onPageChange: (page: number) => void
  currentPage: number
  pageSize: number
  totalCount: number
  loading?: boolean
}
