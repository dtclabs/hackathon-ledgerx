/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react'

const TableFilter = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOnClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-1 gap-2 flex justify-between">
          <div className="border rounded-lg flex py-[9px] pl-4 min-w-[360px]">
            <img src="/svg/search-md.svg" alt="anh" className="pr-3" />
            <input
              type="text"
              placeholder="Search by name, email or wallet address..."
              className="w-full outline-none text-sm leading-5 font-medium tracking-[2%]"
            />
          </div>
          {/* <div className="border p-3 rounded-lg flex flex-row" onClick={handleOnClick}>
            <p className="text-xs">Filter by Role</p>
            <img src="/svg/filter-funnel-02.svg" className="ml-2" alt="" />
          </div> */}
        </div>
      </div>
      {isOpen && <div className="mt-4">heheheh</div>}
    </div>
  )
}

export default TableFilter
