import { IOption } from '@/components-v2/GroupDropDown/GroupDropdown'
import Checkbox from '@/components/Checkbox/Checkbox'
import React, { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

interface ICheckBoxFilter {
  name: string
  options: IOption[]
  setSelection?: (selection: IOption[]) => void
  selection: IOption[]
  isReset?: boolean
  isSignleSelect?: boolean
}

const CheckBoxFilter: React.FC<ICheckBoxFilter> = ({
  name,
  options,
  setSelection,
  selection = [],
  isReset,
  isSignleSelect
}) => {
  const { setValue, watch } = useFormContext()
  const [selectedOptions, setSelectedOptions] = useState<IOption[]>(selection || [])

  useEffect(() => {
    if (isReset) setSelectedOptions(selection)
  }, [isReset, selection])

  const handleChange = (option: IOption) => {
    if (!isSignleSelect) {
      setSelectedOptions((prev) =>
        prev.find((prevItem) => prevItem.value === option.value)
          ? prev.filter((prevItem) => prevItem.value !== option.value)
          : [...prev, option]
      )

      const list = watch(name).find((prevItem) => prevItem === option.value)
        ? watch(name).filter((prevItem) => prevItem !== option.value)
        : [...watch(name), option.value]

      setValue(name, list)
    } else {
      if (option.value === selectedOptions[0]?.value) {
        setSelectedOptions([])
        setValue(name, [])
      } else {
        setSelectedOptions([option])
        setValue(name, Array.isArray(option.value) ? [...option.value] : option.value)
      }
    }
  }

  return (
    options &&
    options.length > 0 && (
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            className="flex gap-2 relative items-center bg-dashboard-background w-fit px-[10px] py-[6px] rounded text-neutral-900 text-xs capitalize"
            label={option.label}
            isChecked={!!selectedOptions.find((item) => item.value === option.value)}
            onChange={(e) => {
              e.stopPropagation()
              handleChange(option)
            }}
          />
        ))}
      </div>
    )
  )
}

export default CheckBoxFilter
