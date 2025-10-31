import React, { ChangeEvent, useCallback } from 'react'
import Checkbox from './Checkbox'

export interface IListItem {
  id: string
  label?: string
  typeTransaction?: string
}

interface ICheckboxGroup {
  title?: string
  values: string[]
  onChange: (value: any) => void
  listItem: IListItem[]
  className?: string
  classNameCheckbox?: string
}

const CheckboxGroup: React.FC<ICheckboxGroup> = ({
  title,
  values,
  onChange,
  listItem,
  className,
  classNameCheckbox
}) => {
  const handleCheckbox = useCallback(
    (event: ChangeEvent<HTMLInputElement>, value: string) => {
      if (onChange && values) {
        let cloneValue = [...values]
        if (event.target.checked) {
          cloneValue?.push(value)
        } else {
          cloneValue = cloneValue.filter((i) => i !== value)
        }
        onChange([...cloneValue])
      }
    },
    [values]
  )

  return (
    <div>
      {title && <div>{title}</div>}
      {values &&
        listItem.map((item) => {
          const hasChecked = values.findIndex((i) => i === item.id) !== -1
          return (
            <Checkbox
              key={item.id}
              value={item.id}
              isChecked={hasChecked}
              onChange={(event) => handleCheckbox(event, item.id)}
              label={item.label}
              className={className}
              classNameCheckbox={classNameCheckbox}
            />
          )
        })}
    </div>
  )
}

export default CheckboxGroup
