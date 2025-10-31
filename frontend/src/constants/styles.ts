import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { StylesConfig } from 'react-select'

// TODO-DRAFT - See what other components are affected by this style change. If a lot then create new styles for make payment page
export const customStyles: StylesConfig<IFormatOptionLabel> = {
  control: (provided, { isFocused }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#F1F1EF'
    },
    borderColor: '#F1F1EF',
    borderRadius: '4px',
    maxHeight: 48,
    backgroundColor: isFocused ? '#FFFFFF' : '#FFFFFF'
  }),
  option: (provided, { isFocused, isSelected, isDisabled }) => ({
    ...provided,
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#FBFAFA' : '',
    padding: 12,
    cursor: isDisabled ? 'not-allowed' : 'pointer'
  }),
  input: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    padding: 0,
    margin: 0,
    height: 24
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    color: '#B5B5B3',
    padding: 0,
    margin: 0
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    height: 16,
    margin: 'auto 0'
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided
    // background: '#F2F4F7',
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    background: '#F2F4F7',
    borderRadius: 4,
    margin: 12,
    padding: 2,
    color: '#667085'
  }),
  singleValue: (provided, { selectProps }) => ({
    ...provided,
    padding: 0
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect,
    maxHeight: 220
  })
}

export const styleTokenSelect: StylesConfig<IFormatOptionLabel> = {
  control: (provided, { isFocused }) => ({
    ...provided,
    '&:hover': {
      borderColor: '#EAECF0'
    },
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#F2F4F7'
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : ''
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: 8
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : ''
  }),
  menu: (provided) => ({ ...provided, width: '160px', padding: '4px' })
}

export const stylesTime: StylesConfig<IFormatOptionLabel> = {
  control: (provided, { isFocused }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#EAECF0'
    },
    borderColor: '#EAECF0',
    borderRadius: '8px'
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    color: isSelected ? '#344054' : isFocused ? '#344054' : '',
    padding: 12,
    fontSize: 14,
    lineHeight: '20px'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 14,
    paddingBottom: 14,
    padding: 12,
    fontSize: 14,
    lineHeight: '20px'
  }),
  input: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    padding: 0,
    margin: 0
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    color: '#D0D5DD',
    padding: 0,
    margin: 0
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    height: 16,
    margin: 'auto 0'
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    background: '#F2F4F7',
    borderRadius: 4,
    margin: 12,
    padding: 2
  }),
  singleValue: (provided, { selectProps }) => ({
    ...provided,
    padding: 0
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect
  })
}

export const styleCustom: StylesConfig<IFormatOptionLabel> = {
  control: (provided) => ({
    ...provided,
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#F1F1EF'
    },
    borderColor: '#F1F1EF',
    paddingLeft: 16
  }),
  menu: (provided) => ({
    ...provided,
    position: 'relative',
    margin: 0,
    border: 'none',
    boxShadow: 'none'
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    borderRadius: isSelected ? '4px' : isFocused ? '4px' : '',
    padding: 12
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    paddingLeft: 12,
    paddingRight: 16,
    paddingTop: 14,
    paddingBottom: 14
  }),
  input: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    padding: 0,
    margin: 0
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    color: '#CECECC',
    padding: 0,
    margin: 0
  }),
  menuList: (provided) => ({
    ...provided,
    border: 'none',
    ...scrollbarSelect,
    maxHeight: 185
  })
}

export const smallSelectItemStyles: StylesConfig<IFormatOptionLabel> = {
  control: (provided, { isFocused }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#EAECF0'
    },
    borderColor: '#EAECF0',
    borderRadius: '4px',
    minHeight: '32px',
    height: '40px',
    backgroundColor: isFocused ? '#FFFFFF' : '#FFFFFF'
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    color: isSelected ? '#344054' : isFocused ? '#344054' : '',
    padding: 12,
    fontSize: 14,
    lineHeight: '20px',
    cursor: 'pointer'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    // padding: 8,
    fontSize: 12,

    height: '32px'
  }),
  input: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: '20px',
    padding: 0,
    margin: 0
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: '20px',
    color: '#B5B5B3',
    padding: 0,

    margin: 0
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '32px'
  }),
  clearIndicator: (provided, state) => ({
    ...provided,
    height: '32px'
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    display: 'none',
    height: 16,
    marginBottom: 2
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    background: '#fff',
    borderRadius: 4,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
    padding: 0,
    paddingBottom: 1
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect,
    maxHeight: 220
  }),
  multiValue: (provided, { selectProps }) => ({
    ...provided,
    padding: 0
    // height: '20px'
  }),
  singleValue: (provided, state) => ({
    ...provided,
    top: 0,
    transform: 'none'
  }),
  groupHeading: (provided) => ({
    ...provided,
    background: '#E2E2E0',
    padding: '6px 8px',
    color: '#2D2D2C',
    fontSize: 10,
    fontWeight: 550
  }),
  group: (provided) => ({
    ...provided,
    padding: '2px 0'
  })
}

export const styleAdditional: StylesConfig<IFormatOptionLabel> = {
  control: (provided, { isFocused }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#EAECF0'
    },
    borderColor: '#EAECF0',
    borderRadius: '8px',
    backgroundColor: isFocused ? '#FFFFFF' : '#FFFFFF'
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    color: isSelected ? '#344054' : isFocused ? '#344054' : '',
    padding: 12,
    fontSize: 14,
    lineHeight: '20px',
    cursor: 'pointer'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    // padding: 8,
    fontSize: 14,
    lineHeight: '20px'
  }),
  input: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    padding: 0,
    margin: 0
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    color: '#B5B5B3',
    padding: 0,
    margin: 0
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    height: 16,
    margin: 'auto 0'
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    background: '#F2F4F7',
    borderRadius: 4,
    margin: 12,
    padding: 2
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect,
    maxHeight: 220
  }),
  multiValue: (provided, { selectProps }) => ({
    ...provided,
    padding: 0
    // height: '20px'
  }),
  singleValue: (provided, state) => ({
    ...provided,
    top: 0,
    transform: 'none',
    lineHeight: '40px'
  }),
  groupHeading: (provided) => ({
    ...provided,
    background: '#E2E2E0',
    padding: '6px 8px',
    color: '#2D2D2C',
    fontSize: 10,
    fontWeight: 550
  }),
  group: (provided) => ({
    ...provided,
    padding: '2px 0'
  })
}

export const scrollbarSelect = {
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
export const styleContact: StylesConfig<IFormatOptionLabel> = {
  control: (provided, { isFocused }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#EAECF0'
    },
    borderColor: '#EAECF0',
    borderRadius: '8px',
    maxHeight: 48,
    backgroundColor: isFocused ? '#FFFFFF' : '#FBFAFA',
    cursor: 'pointer'
  }),
  option: (provided, { isFocused, isSelected, isDisabled }) => ({
    ...provided,
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#FBFAFA' : '',
    padding: 12,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    color: '#2D2D2C'
  }),
  input: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    padding: 0,
    margin: 0,
    height: 24
  }),
  placeholder: (provided, state) => ({
    ...provided,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '20px',
    color: '#B5B5B3',
    padding: 0,
    margin: 0
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    height: 16,
    margin: 'auto 0'
  }),
  dropdownIndicator: (provided, { selectProps }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    background: '#F2F4F7',
    borderRadius: 4,
    margin: 12,
    padding: 2
  }),
  singleValue: (provided, { selectProps }) => ({
    ...provided,
    padding: 0
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect,
    maxHeight: 220
  })
}
