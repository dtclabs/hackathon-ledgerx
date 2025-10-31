import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import CustomControl from '@/components/SelectItem/CustomControl'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import { LIMIT_TAGS_PER_TRANSACTION } from '@/views/Transactions-v2/interface'
import _ from 'lodash'
import Image from 'next/legacy/image'
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { StylesConfig, components, createFilter } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { useModalHook } from '../Modals/BaseModal/state-ctx'
import DeleteTagModal from './DeleteTagModal'
import TagItem from './TagItem'
import TagManagementOption from './TagManagementOption'

type IOption = {
  value: string
  label: string
  isDisabled?: boolean
}

interface ITagManagementPopup {
  options: IOption[]
  tags: IOption[]
  onOpen?: () => void
  onCreate: (name: string) => void
  onChange: (tag: IOption) => void
  onClear: (tag: IOption) => void
  onEdit: (tag: IOption, newName: string) => void
  onDelete: (tag: IOption) => void
  triggerButton?: (onClick) => ReactNode
  position?: 'bottom' | 'top'
  placement?: EPlacement
}

const customFilterOption = createFilter({
  stringify: (option) => option.label
})

const TagManagementPopup: React.FC<ITagManagementPopup> = ({
  options,
  tags = [],
  onOpen,
  onChange,
  onCreate,
  onClear,
  onDelete,
  onEdit,
  triggerButton,
  position = 'bottom',
  placement = EPlacement.TOPLEFT
}) => {
  const ref = useRef(null)
  const isEditing = useRef(false)
  const selectedTag = useRef<IOption>(null)
  const deleteTagProvider = useModalHook({ defaultState: { isOpen: false } })

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleOpenModal = (_tag) => {
    deleteTagProvider.methods.setIsOpen(true)
    selectedTag.current = _tag
  }
  const handleCloseModal = () => {
    deleteTagProvider.methods.setIsOpen(false)
  }
  const trackIsEditing = (_isEditing) => {
    isEditing.current = _isEditing
  }
  const handleDeleteTag = () => {
    onDelete(selectedTag.current)
    deleteTagProvider.methods.setIsOpen(false)
    selectedTag.current = null
  }

  const tagsList = useMemo(
    () => (
      <>
        {tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {tags?.map((_item) => (
              <TagItem
                key={_item.value}
                tag={_item}
                onClear={(_tag) => {
                  onClear(_tag)
                }}
              />
            ))}
          </div>
        )}
        {tags?.length === LIMIT_TAGS_PER_TRANSACTION && (
          <Typography classNames="mb-2" color="error" variant="caption" styleVariant="regular">
            You have reached the limit of {LIMIT_TAGS_PER_TRANSACTION} tags.
          </Typography>
        )}
        <CreatableSelect
          ref={(r) => {
            ref.current = r
          }}
          autoFocus
          // isMulti
          // isOptionDisabled={(_option) => tags?.length === LIMIT_TAGS_PER_TRANSACTION}
          isDisabled={tags?.length === LIMIT_TAGS_PER_TRANSACTION}
          menuIsOpen
          backspaceRemovesValue={false}
          filterOption={customFilterOption}
          components={{
            Control: CustomControl,
            Menu: CustomMenu,
            NoOptionsMessage: CustomNoOptionsMessage,
            Option: (props) => TagManagementOption(props, onEdit, handleOpenModal, trackIsEditing),
            DropdownIndicator: null,
            IndicatorSeparator: null
          }}
          controlShouldRenderValue={false}
          hideSelectedOptions={false}
          tabSelectsValue={false}
          isClearable={false}
          value={tags}
          onKeyDown={(e) => {
            if (e.code === 'Space' && !ref.current.props.inputValue) {
              e.preventDefault()
            }
            if (e.code === 'Enter') {
              e.preventDefault()

              const addedTag = tags.find((_tag) => _tag.label.toLowerCase() === search.toLowerCase())
              const createdTag = options.find((_tag) => _tag.label.toLowerCase() === search.toLowerCase())

              if (search && !isEditing.current && !createdTag) {
                onCreate(search)
                setSearch('')
              } else if (search && !isEditing.current && !addedTag && createdTag) {
                onChange(createdTag)
                setSearch('')
              }
            }
          }}
          closeMenuOnSelect={false}
          onCreateOption={(_tagName) => {
            onCreate(_tagName)
          }}
          onInputChange={(value, action) => {
            if (action.action === 'input-blur') {
              return
            }
            if (action.action === 'menu-close') {
              return
            }
            setSearch(value)
          }}
          inputValue={search}
          onChange={(newTag: any, a) => {
            if (tags.findIndex((_tag) => _tag.value === newTag.value) > -1) {
              onClear(newTag)
            } else {
              onChange(newTag)
            }
          }}
          options={_.differenceBy(options, tags, 'value')}
          placeholder="Search Or Create New"
          styles={selectStyles}
        />
      </>
    ),
    [options, tags, search]
  )

  const handleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      isEditing.current = false
    }
    if (isOpen && onOpen) {
      onOpen()
    }
  }, [isOpen])

  return (
    <>
      <DropDown
        position={position}
        bottomPosition={position === 'top' && 'bottom-[30px]'}
        placement={placement}
        isOutsideClickDisabled={deleteTagProvider.state.isOpen}
        maxHeight="max-h-[400px]"
        isShowDropDown={isOpen}
        setIsShowDropDown={setIsOpen}
        removeElementOnClose={false}
        triggerButton={
          triggerButton ? (
            triggerButton(handleOpen)
          ) : (
            <Button
              height={24}
              variant="ghost"
              label="Add Tag"
              classNames="font-medium !text-xs py-3 px-[10px]"
              leadingIcon={<Image src={AddIcon} width={12} height={12} />}
              onClick={handleOpen}
            />
          )
        }
      >
        {tagsList}
      </DropDown>
      {deleteTagProvider.state.isOpen && (
        <DeleteTagModal
          provider={deleteTagProvider}
          onCancel={handleCloseModal}
          onDelete={handleDeleteTag}
          name={selectedTag.current?.label}
        />
      )}
    </>
  )
}

export default TagManagementPopup

const CustomNoOptionsMessage = (props) => (
  <components.NoOptionsMessage {...props}>
    {props.selectProps.value.findIndex(
      (_tag) => _tag.label.toLowerCase() === props.selectProps.inputValue.toLowerCase()
    ) < 0 ? (
      <Typography color="tertiary" styleVariant="regular">
        No tags found
      </Typography>
    ) : (
      <Typography classNames="text-left" color="error" variant="caption" styleVariant="regular">
        Tag name already exists.
      </Typography>
    )}
  </components.NoOptionsMessage>
)

const CustomMenu = (props) => (
  <components.Menu
    {...props}
    innerProps={{
      ...props.innerProps,
      onMouseDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
      }
    }}
  >
    {props.children}
  </components.Menu>
)

const selectStyles: StylesConfig<any, boolean> = {
  control: (provided, state) => ({
    ...provided,
    paddingLeft: 6,
    background: '#fff',
    color: '#2D2D2C',
    borderColor: '#CECECC',
    minHeight: '34px',
    height: '34px',
    boxShadow: state.isFocused ? null : null,
    opacity: state.isDisabled ? 0.4 : 1,
    width: 240
  }),
  input: (provided) => ({ ...provided, fontSize: 14 }),
  placeholder: (provided) => ({ ...provided, fontSize: 14 }),
  option: (provided, { isFocused, isSelected, isDisabled, data }) => ({
    ...provided,
    display: 'flex',
    justifyContent: 'space-between',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: data?.__isNew__ ? 'white' : isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    color: '#2D2D2C',
    fontSize: 14,
    lineHeight: '16px',
    fontWeight: 400,
    cursor: isDisabled && !data?.__isNew__ ? 'not-allowed' : 'pointer',
    opacity: isDisabled && !data?.__isNew__ ? 0.4 : 1
  }),
  menu: () => ({ margin: 0, width: 240 }),
  menuList: (provided) => ({ ...provided, maxHeight: '160px' })
}
