import React from 'react'
import { components, ValueContainerProps, GroupBase } from 'react-select'

const SelectedValueContainer = <OptionType, IsMulti extends boolean, Group extends GroupBase<OptionType>>(
  props: ValueContainerProps<OptionType, IsMulti, Group>
) => {
  const numSelected = props.getValue().length
  const label = numSelected === 0 ? 'Select...' : `${numSelected} items selected`

  return (
    <components.ValueContainer {...props}>
      {!props.hasValue && props.children}
      {props.hasValue && label}
    </components.ValueContainer>
  )
}

export default SelectedValueContainer
