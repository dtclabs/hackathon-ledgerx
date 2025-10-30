import { ColDef, ColGroupDef, DomLayoutType } from 'ag-grid-community'
import { ReactNode } from 'react'

export interface IGridTable<T> {
  id: string
  data: T[]
  columns: ColDef<T>[] | null
  gridRef: any
  emptyState: ReactNode
  rowLoadingComponent?: ReactNode
  emptyRows?: number
  hasCheckBox?: boolean
  isCheckboxEnabled?: (data: T) => boolean
  gridSize?: { height: string; width: string }
  classNames?: string
  isLoading?: boolean
  rowHeight?: number
  pagination?: boolean
  dragColumn?: boolean
  isMultiple?: boolean
  sortable?: boolean
  domLayout?: DomLayoutType
  onRowClick?: (row: T) => void
}
