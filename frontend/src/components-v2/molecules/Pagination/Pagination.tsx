import React, { useEffect, useRef } from 'react'
import _ from 'lodash'

export interface IPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onClickPreviousPage: () => void
  onClickNextPage: () => void
  onClickFirstPage: () => void
  onClickLastPage: () => void
  canPreviousPage: boolean
  canNextPage: boolean
  pageSizeOptions: number[]
  onChangePageSize: any
  currentPageSize: number
}

const Pagination: React.FC<IPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onClickFirstPage,
  onClickLastPage,
  onClickNextPage,
  onClickPreviousPage,
  canNextPage,
  canPreviousPage,
  pageSizeOptions,
  onChangePageSize,
  currentPageSize
}) => {
  // const [inputPage, setInputPage] = useState(currentPage?.toString() || String(1))
  // const [inputPage, setInputPage] = useState(currentPage ? currentPage.toString() : String(1))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      const characterWidth = 14 // Adjust this value based on your desired character width
      const inputWidth = Math.max(24, String(currentPage).length * characterWidth)
      inputRef.current.style.width = `${inputWidth + 14}px`
    }
  }, [currentPage])

  const helpChangePage = (page: string) => {
    // const delayAPI = _.debounce(() => {
    //   onPageChange(Number(page))
    //   inputRef.current.blur()
    // }, 500)

    // // setInputPage(page)
    // delayAPI()
    onPageChange(Number(page))
  }

  const handleInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/, '') // Remove non-numeric characters
    // const maxLength = totalPages.toString().length
    if (+inputValue <= 1) helpChangePage(String(1))
    else if (+inputValue >= totalPages) helpChangePage(totalPages.toString())
    else helpChangePage(inputValue)
  }

  const handlePreviousPage = () => {
    onClickPreviousPage()
    // setInputPage((+inputPage - 1).toString())
  }

  const handleNextPage = () => {
    onClickNextPage()
    // setInputPage((+inputPage + 1).toString())
  }

  const handleFirstPage = () => {
    onClickFirstPage()
    // setInputPage(String(1))
  }

  const handleLastPage = () => {
    onClickLastPage()
    // setInputPage(String(totalPages))
  }

  return (
    <div className="flex gap-2 items-center">
      <button
        className={`px-2 py-1 rounded border ${canPreviousPage ? '' : 'disabled:opacity-50'}`}
        onClick={handleFirstPage}
        type="button"
        disabled={!canPreviousPage}
      >
        &lt;&lt;
      </button>
      <button
        className={`px-2 py-1 rounded border ${canPreviousPage ? '' : 'disabled:opacity-50'}`}
        onClick={handlePreviousPage}
        disabled={!canPreviousPage}
        type="button"
      >
        &lt;
      </button>

      <input
        ref={inputRef}
        className="px-2 py-1 text-center border rounded"
        type="number"
        pattern="[0-9]*"
        value={Number(currentPage) + 1}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        // onBlur={() => helpChangePage(inputPage)}
        // onKeyDown={(e) => {
        //   if (e.key === 'Enter') {
        //     console.log('WHAT IS E: ', e.target)
        //     // helpChangePage(inputPage)
        //   }
        // }}
      />
      <span className="mx-2">of {totalPages}</span>
      <button
        className={`px-2 py-1 rounded border ${canNextPage ? '' : 'disabled:opacity-50'}`}
        onClick={handleNextPage}
        type="button"
        disabled={!canNextPage}
      >
        &gt;
      </button>
      <button
        className={`px-2 py-1 rounded border ${canNextPage ? '' : 'disabled:opacity-50'}`}
        onClick={handleLastPage}
        type="button"
        disabled={!canNextPage}
      >
        &gt;&gt;
      </button>
      <select value={currentPageSize} onChange={onChangePageSize}>
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            Show {size}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Pagination
