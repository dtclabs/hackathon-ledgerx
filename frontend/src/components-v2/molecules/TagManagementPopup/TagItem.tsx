import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import React from 'react'
import CloseIcon from '@/public/svg/close.svg'

interface ITagItem {
  tag: { value: string; label: string }
  classNames?: string
  onClear?: (option: { value: string; label: string }) => void
  clearable?: boolean
}

const TagItem: React.FC<ITagItem> = ({ tag, onClear, classNames, clearable = true }) => (
  <div className={`flex items-center bg-neutral-100 pl-[10px] py-1 rounded ${!clearable && 'pr-[10px]'} ${classNames}`}>
    <Typography classNames="!text-neutral-900 max-w-[70px] lowercase truncate" styleVariant="regular" variant="caption">
      {tag.label}
    </Typography>
    {clearable && (
      <button
        className="px-2 items-center flex h-full"
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClear(tag)
        }}
      >
        <Image className="cursor-pointer" src={CloseIcon} alt="icon" height={7} width={7} />
      </button>
    )}
  </div>
)

export default TagItem
