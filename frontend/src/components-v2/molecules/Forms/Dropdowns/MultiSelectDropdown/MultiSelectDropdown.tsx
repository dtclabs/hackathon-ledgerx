import { FC } from 'react'

import { BaseDropdown } from '../BaseDropdown'
import { IBaseDropdownProps } from '../BaseDropdown/base-config'
import { CheckboxOption, SelectedValueContainer } from '@/components-v2/atoms'

const MultiSelectDropdown: FC<IBaseDropdownProps> = ({ options, ...rest }) => {
  const selectContainerClassName = 'relative w-full'

  return (
    <div className={selectContainerClassName}>
      <BaseDropdown
        {...rest}
        components={{ Option: CheckboxOption, ValueContainer: SelectedValueContainer }}
        isMulti
        showCaret
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        options={options}
      />
    </div>
  )
}

export default MultiSelectDropdown
