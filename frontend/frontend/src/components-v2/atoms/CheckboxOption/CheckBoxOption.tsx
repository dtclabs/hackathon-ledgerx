import { FC } from 'react'
import { components, OptionProps } from 'react-select'

const CheckboxOption: FC<OptionProps> = (props) => (
  <components.Option {...props}>
    <input readOnly type="checkbox" checked={props.isSelected} /> {props.label}
  </components.Option>
)

export default CheckboxOption
