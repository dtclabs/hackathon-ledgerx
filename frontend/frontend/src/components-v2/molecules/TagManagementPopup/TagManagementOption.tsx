import Typography from '@/components-v2/atoms/Typography'
import EditIcon from '@/public/svg/Edit.svg'
import DeleteIcon from '@/public/svg/TrashRed.svg'
import Image from 'next/legacy/image'
import { useEffect, useRef, useState } from 'react'
import { components } from 'react-select'
import CloseIcon from '@/public/svg/close.svg'
import CheckIcon from '@/public/svg/icons/check-icon.svg'
import { Input } from '@/components-v2/Input'

const TagManagementOption = (props, onEdit, onDelete, trackIsEditing) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tagname, setTagname] = useState(props?.data.label)

  const handleEdit = (data, newTagName = '') => {
    if (data.label.trim() !== newTagName.trim() && newTagName !== '') {
      onEdit(data, tagname)
    }
  }

  return !props.data?.__isNew__ ? (
    isEditing ? (
      <div className="flex truncate whitespace-nowrap justify-between pr-3">
        <Input
          // ref={input}
          ref={(input) => {
            if (input) {
              input.focus()
            }
          }}
          onChange={(e) => {
            setTagname(e.target.value)
          }}
          id="txhash"
          value={tagname}
          classNames="h-[34px] !text-sm !text-neutral-700 font-normal"
          wrapClassNames="border-0"
          onKeyDown={(e) => {
            if (e.code === 'Space') {
              e.stopPropagation()
            }
            if (e.code === 'Enter' && tagname) {
              e.stopPropagation()
              handleEdit(props?.data, tagname)
              setIsEditing(false)
              trackIsEditing(false)
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onSelect={(e) => {
            e.stopPropagation()
          }}
        />
        <div aria-hidden className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="flex items-center disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!tagname}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(props?.data, tagname)
              setIsEditing(false)
              trackIsEditing(false)
            }}
          >
            <Image src={CheckIcon} width={14} height={14} />
          </button>
          <button
            type="button"
            className="flex items-center"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(false)
              trackIsEditing(false)
              setTagname(props?.data.label)
            }}
          >
            <Image src={CloseIcon} width={10} height={10} />
          </button>
        </div>
      </div>
    ) : (
      <components.Option {...props} className="group">
        <>
          <Typography classNames="truncate lowercase group-hover:w-[calc(100%-36px)]">{props.children}</Typography>
          <div className="group-hover:flex gap-1 hidden" aria-hidden onClick={(e) => e.stopPropagation()}>
            <Image
              src={EditIcon}
              width={16}
              height={16}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
                trackIsEditing(true)
              }}
            />
            <Image
              src={DeleteIcon}
              width={16}
              height={16}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(props?.data)
              }}
            />
          </div>
        </>
      </components.Option>
    )
  ) : (
    <components.Option {...props} isDisabled>
      <Typography color="tertiary" variant="caption">
        Press Enter to create a new label
      </Typography>
    </components.Option>
  )
}
export default TagManagementOption
