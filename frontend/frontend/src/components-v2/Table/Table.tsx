import { FC, useEffect } from 'react'
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce, useSortBy, usePagination } from 'react-table'
import { TablePagination } from '../../components/TablePagination'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'

interface ITableProps {
  columns: any
  data: any
  page: number
  setPage: (page: number) => void
  limit: number
  renderRow?: any
  paginated?: boolean
  totalCount?: number
  totalPages?: number
  isLoading?: boolean
  height?: string
}

const TableContainer: FC<ITableProps> = ({
  columns,
  data,
  renderRow,
  paginated = true,
  isLoading,
  height,
  limit,
  page,
  setPage,
  totalCount,
  totalPages
}) => {
  const showBanner = useAppSelector(showBannerSelector)

  const gotoPage = (_page) => {
    setPage(_page)
  }
  const handleOnPageForward = (x: any) => {
    setPage(page + 1)
  }

  const handlePageBackwards = (x: any) => {
    setPage(page - 1)
  }

  const emptyRowCount = data?.length === 5 ? 0 : 5 - (data?.length ?? 0)
  //     <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 scrollbar">
  return (
    <div className="mt-3">
      <div className="align-middle inline-block min-w-full sm:px-6 lg:px-8 ">
        <div
          className={`shadow overflow-auto rounded-lg border-[#CECECC] border scrollbar ${
            height || (showBanner ? 'h-[calc(100vh-458px)]' : 'h-[calc(100vh-390px)]')
          }`}
        >
          <table className="min-w-full divide-y divide-[#CECECC] border-0 rounded-lg">
            {isLoading ? (
              <div className="flex justify-center items-center" style={{ minHeight: 450 }}>
                <div className="text-lg">Fetching data...</div>
              </div>
            ) : (
              <>
                <thead className="bg-grey-100 rounded-t-lg">
                  <tr>
                    {columns.map((header) => (
                      <th
                        scope="col"
                        key={header.Header}
                        className="group px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider border-0"
                      >
                        {header.Header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#CECECC] rounded-b-lg">
                  {data?.map((row, i) => renderRow(row))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
      {paginated && (
        <div className="mt-4 flex justify-start">
          <TablePagination
            totalItems={totalCount}
            totalPages={totalPages}
            size={limit}
            currentPage={page}
            setPage={gotoPage}
            canPreviousPage={Boolean(page !== 0)}
            canNextPage={Boolean(page + 1 !== totalPages)}
            onePageForward={handleOnPageForward}
            onePageBack={handlePageBackwards}
          />
        </div>
      )}
    </div>
  )
}

export default TableContainer
