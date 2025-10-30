import { IBaseDropdownProps } from './base-config'

type IDropdownBaseStyles = Pick<IBaseDropdownProps, 'size' | 'customStyles'>

const scrollbarSelect = {
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px'
  },
  '::-webkit-scrollbar-track': {
    background: ' #fafafa',
    width: '20px'
  },
  '::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '16px'
  },
  '::-webkit-scrollbar-thumb:hover': {
    background: '#c9c9c9'
  }
}

const DROPDOWN_SIZE_MAP = {
  xs: {
    fontSize: '0.7rem',  // Reduced font size
    height: '32px',  // Reduced height
    caretSize: '0.4rem',  // New property for caret size,
  },
  sm: {
    fontSize: '0.75rem',
    height: '40px',
    caretSize: '0.5rem' 
  },
  md: {
    fontSize: '0.875rem',
    height: '48px',
    caretSize: '0.5rem' 
  },
  lg: {
    fontSize: '1.25rem',
    height: '55px',
    caretSize: '0.5rem' 
  }
}

export const generateBaseStyle = ({ size, customStyles }: IDropdownBaseStyles) => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state?.isDisabled ? '#F5F5F5' : '#FFF',
    borderColor: '#E5E7EB',

    boxShadow: 'none',
    '&:focus-within': {
      borderColor: '#EAECF0',
      boxShadow: '0 0 0.4rem #E5E7EB'
    },
    '&:hover': {
      borderColor: '#E5E7EB'
    },
    borderRadius: customStyles?.borderRadius ? `${customStyles?.borderRadius}` : '0.375rem',
    fontSize: DROPDOWN_SIZE_MAP[size].fontSize,
    height: DROPDOWN_SIZE_MAP[size].height,
    minHeight: DROPDOWN_SIZE_MAP[size].height,
    lineHeight: '1.5',
    cursor: 'pointer',
  
  }),

  option: (provided, state) => ({
    ...provided,
    // whiteSpace: 'nowrap',
    fontSize: DROPDOWN_SIZE_MAP[size].fontSize,
    fontWeight: 400,
    font: 'inter',
    backgroundColor: state.isSelected ? '#F5F5F5' : state.isFocused ? '#F3F4F6' : state.isDisabled ? '#F5F5F5' : '#FFF',

    color: state.isSelected ? '#344054' : state.isDisabled ? '#DCDCDE' : '#344054',
    cursor: 'pointer'
  }),
  groupHeading: (provided) => ({
    ...provided,
    background: '#E2E2E0',
    padding: '6px 8px',
    color: '#2D2D2C',
    fontSize: 12,
    fontWeight: 550
  }),
  group: (provided) => ({
    padding: '2px 0'
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect
  })
})
