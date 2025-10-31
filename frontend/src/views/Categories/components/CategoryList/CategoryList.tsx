import { ICategories } from '@/slice/categories/interfaces'
import CategoryListItem from './CategoryListItem'
import category from '@/public/svg/Document.svg'
import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import NotFound from '@/components/NotFound'

interface ICategoryList {
  categories: ICategories[]
  setShowAddNewCategoryModal: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedCategory: React.Dispatch<React.SetStateAction<ICategories>>
  setAction: React.Dispatch<React.SetStateAction<string>>
  setIsShowDelete: React.Dispatch<React.SetStateAction<boolean>>
  setIdCategoryDelete: React.Dispatch<React.SetStateAction<string>>
}

const CategoryList: React.FC<ICategoryList> = ({
  categories,
  setShowAddNewCategoryModal,
  setSelectedCategory,
  setAction,
  setIsShowDelete,
  setIdCategoryDelete
}) => {
  const showBanner = useAppSelector(showBannerSelector)

  const tableRef = useRef<HTMLDivElement>(null)
  const [isTableOverflowed, setIsTableOverflowed] = useState(false)

  useEffect(() => {
    if (tableRef.current) {
      setIsTableOverflowed(tableRef.current.scrollHeight > tableRef.current.clientHeight)
    }
  }, [categories])
  return (
    <div className="border border-dashboard-border-200 rounded-lg">
      <div className="bg-grey-100 flex w-full justify-between text-xs text-dashboard-sub border-b border-dashboard-border-200 rounded-t-lg">
        <div className="pl-4 py-2 flex items-center flex-1 justify-between gap-4">
          <div className="w-36">Code</div>
          <div className="flex-1">Name</div>
          <div className="w-[122px]">Type</div>
        </div>
        <div className="flex items-center w-[48%]">
          <div className="flex-1">Description</div>
          <div className="w-1/3">Actions</div>
        </div>
      </div>
      <div
        ref={tableRef}
        className={`${
          categories && categories.length
            ? showBanner
              ? 'h-[calc(100vh-451px)]'
              : 'h-[calc(100vh-383px)]'
            : showBanner
            ? 'h-[calc(100vh-395px)] justify-center'
            : 'h-[calc(100vh-327px)] justify-center'
        } overflow-auto scrollbar flex flex-col`}
      >
        {categories && categories.length ? (
          categories?.map((item, index) => (
            <CategoryListItem
              key={item.id}
              onDelete={() => {
                setIsShowDelete(true)
                setAction('DELETE')
                setIdCategoryDelete(item.id)
                setSelectedCategory(item)
              }}
              onEdit={() => {
                // setIsShowEditModal(true)
                setSelectedCategory(item)
                setShowAddNewCategoryModal(true)
                setAction('EDIT')
              }}
              categoryItem={item}
              isLastItem={index + 1 === categories.length}
              isTableOverflowed={isTableOverflowed}
            />
          ))
        ) : (
          <NotFound title="No Categories Found." icon={category} extendWrapperClassName="mb-16" />
        )}
      </div>
    </div>
  )
}

export default CategoryList
