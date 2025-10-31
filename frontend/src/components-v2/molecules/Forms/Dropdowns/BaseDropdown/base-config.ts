import { generateBaseStyle } from './base-style'
import { Props as SelectProps } from 'react-select'
import { CaretIndicator } from '@/components-v2/atoms/CaretIndicator'

export interface IBaseDropdownProps extends SelectProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showCaret?: boolean
  customOptionLabel?: any
  customStyles?: {
    borderRadius?: string
    indicatorStyles?: string
  }
}

const commonSelectConfig = (props: IBaseDropdownProps) => {
  const { components, options, onChange, ...rest } = props
  return {
    menuPlacement: props.menuPlacement || 'auto',
    isMulti: props.isMulti ?? false,
    styles: generateBaseStyle({ size: props.size, customStyles: props.customStyles }),
    isOptionDisabled: (option) => option.disabled,
    components: {
      DropdownIndicator: props.showCaret ? CaretIndicator : null,
      ...components
    },
    formatOptionLabel: props.customOptionLabel,
    options,
    onChange,
    ...rest
  }
}

export default commonSelectConfig
