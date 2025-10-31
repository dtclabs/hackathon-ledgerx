import { ICategories } from '@/slice/categories/interfaces'
import { useEffect, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'

interface ICategoryListItem {
  categoryItem: ICategories
  onEdit: () => void
  onDelete: () => void
  isLastItem: boolean
  isTableOverflowed: boolean
}

const CategoryListItem: React.FC<ICategoryListItem> = ({
  categoryItem,
  onDelete,
  onEdit,
  isLastItem,
  isTableOverflowed
}) => {
  const nameRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

  const [isNameOverflowed, setIsNameOverflow] = useState(false)
  const [isDescriptionOverflowed, setIsDescriptionOverflow] = useState(false)
  useEffect(() => {
    if (nameRef.current) setIsNameOverflow(nameRef.current.scrollWidth > nameRef.current.clientWidth)
  }, [categoryItem.name])
  useEffect(() => {
    if (descriptionRef.current)
      setIsDescriptionOverflow(descriptionRef.current.scrollWidth > descriptionRef.current.clientWidth)
  }, [categoryItem.description])
  return (
    <div
      className={`py-4 flex w-full justify-between ${
        isLastItem && isTableOverflowed ? '' : 'border-b border-dashboard-border-200'
      } font-medium text-sm text-dashboard-main`}
    >
      <div className="flex items-center flex-1 gap-4 pl-4 truncate">
        <div className="w-36 break-words pr-4">{categoryItem?.code}</div>
        <div
          ref={nameRef}
          className="flex-1 mr-4 truncate"
          data-tip={`${categoryItem.id}_${categoryItem.name}_name`}
          data-for={`${categoryItem.id}_${categoryItem.name}_name`}
          data-tip-disable={!isNameOverflowed}
        >
          {categoryItem?.name}
        </div>
        <div className="w-[122px] capitalize pr-4">{categoryItem?.type}</div>
      </div>
      <div className="flex items-center w-[48%] justify-between">
        <div
          ref={descriptionRef}
          className="flex-1 mr-14 truncate"
          data-tip={`${categoryItem.id}_${categoryItem?.description}_name`}
          data-for={`${categoryItem.id}_${categoryItem?.description}_name`}
          data-tip-disable={!isDescriptionOverflowed}
        >
          {categoryItem?.description}
        </div>
        <div className="w-1/3 flex items-center gap-2 text-dashboard-main text-xs">
          <button
            type="button"
            className="border rounded-lg px-3 py-2 border-dashboard-border-200 hover:bg-grey-100 disabled:opacity-50 active:border-indigo-500"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="border border-dashboard-border-200 rounded-lg px-3 py-2 hover:bg-grey-100 disabled:opacity-50 text-[#C61616]"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
      <ReactTooltip
        id={`${categoryItem.id}_${categoryItem.name}_name`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg"
      >
        <div className="max-w-xs break-words">{categoryItem?.name}</div>
      </ReactTooltip>
      <ReactTooltip
        id={`${categoryItem.id}_${categoryItem?.description}_name`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg"
      >
        <div className="max-w-xs break-words">{categoryItem?.description}</div>
      </ReactTooltip>
    </div>
  )
}

export default CategoryListItem
