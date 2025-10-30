export interface IPaginationProps {
  totalItems: number
  siblingCount?: number
  currentPage: number
  totalPages: number
  limit: number
  onPageChange: (x: number) => void
}
