import { useCallback, useMemo, useState } from 'react'

export const usePagination = (data: any[], pageSize = 10) => {
  const [pageIndex, setPageIndex] = useState(0)

  const pageData = useMemo(() => {
    const startIndex = pageIndex * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, pageIndex, pageSize])

  const pageCount = useMemo(() => Math.ceil(data.length / pageSize), [data.length, pageSize])

  const gotoPage = useCallback(
    (newPage: number) => {
      if (newPage >= 0 && newPage < pageCount) {
        setPageIndex(newPage)
      }
    },
    [pageCount]
  )

  const previousPage = useCallback(() => {
    gotoPage(pageIndex - 1)
  }, [gotoPage, pageIndex])

  const nextPage = useCallback(() => {
    gotoPage(pageIndex + 1)
  }, [gotoPage, pageIndex])

  return {
    pageData,
    pageCount,
    pageIndex,
    previousPage,
    nextPage,
    gotoPage
  }
}
