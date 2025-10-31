/* eslint-disable no-param-reassign */
import { wait } from '@/utils/wait'
import { ReactNode, memo, useEffect, useRef } from 'react'
import { SkeletonLoader } from '../SkeletonLoader'

interface GridEmptyStateProps {
  id: string
  isLoading: boolean
  gridRef: any
  emptyState: ReactNode
  hasCheckBox?: boolean
  rowHeight?: number
  rowLoadingComponent?: ReactNode
  emptyRows?: number
}

const DefaultEmptyRow = ({ columns, hasCheckBox }) => (
  <>
    {hasCheckBox && (
      <div className="px-4 max-w-[40px]">
        <SkeletonLoader variant="rounded" height={14} width={20} />
      </div>
    )}
    {columns
      .filter((col) => col.field)
      .map((col) => (
        <div className="px-4">
          <SkeletonLoader variant="rounded" height={14} width={80} />
          <SkeletonLoader variant="rounded" height={14} width={50} />
        </div>
      ))}
  </>
)

const GridEmptyState: React.FC<GridEmptyStateProps> = memo(
  ({ id, gridRef, rowLoadingComponent, emptyState, isLoading, hasCheckBox, emptyRows, rowHeight }) => {
    const skeletonRows = [...Array(emptyRows ?? 2).keys()]

    const ref = useRef(null)

    const handleResize = async (init = false) => {
      if (ref.current) {
        // Wait for gridRef update (The value of it sometimes still be the old value)
        if (!init) {
          await wait(100)
        }
        const columns: any[] = gridRef.current.api.getColumnDefs()
        const widths = hasCheckBox
          ? columns?.map((column) => column.width)
          : columns?.filter((column) => column.field)?.map((column) => column.width)

        const rowElements = ref.current.children

        for (const row of rowElements) {
          const columnElements = row.children

          for (let index = 0; index < columnElements.length; index++) {
            columnElements[index].style.width = `${widths[index]}px`
          }
        }
      }
    }

    useEffect(() => {
      window.addEventListener('resize', (e) => handleResize())
      return () => {
        window.removeEventListener('resize', (e) => handleResize())
      }
    }, [])

    useEffect(() => {
      if (ref.current) {
        handleResize(true)
      }
    }, [])

    return (
      <div ref={ref}>
        {isLoading
          ? skeletonRows.map((index) => (
              <div key={`${id}-${index}`} style={{ height: rowHeight || 50 }} className="flex items-center border-b">
                {rowLoadingComponent || (
                  <DefaultEmptyRow hasCheckBox={hasCheckBox} columns={gridRef.current?.api?.getColumnDefs()} />
                )}
              </div>
            ))
          : emptyState}
      </div>
    )
  },
  areEqual
)

function areEqual(prevProps, nextProps) {
  return prevProps.isLoading === nextProps.isLoading
}

export default GridEmptyState
