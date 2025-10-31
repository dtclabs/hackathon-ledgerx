import { customStyles, smallSelectItemStyles } from '@/constants/styles'

export const paymentContactStyle = (isDisabled) => ({
  ...customStyles,
  control: (provided, { isFocused, selectProps }) => ({
    ...provided,
    boxShadow:
      !isDisabled && isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: selectProps?.isInvalid ? '#C61616' : '#EAECF0'
    },
    borderColor: selectProps?.isInvalid ? '#C61616' : '#EAECF0',
    borderRadius: '4px',
    height: 48,
    backgroundColor: isDisabled ? '#F2F4F7' : '#FFFFFF'
  }),
  input: (provided, state) => {
    const value = state.getValue()
    return {
      ...provided,
      width: value[0]?.isUnknown && 'calc(100% - 150px)',
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '20px',
      padding: 0,
      margin: 0,
      height: 24
    }
  }
})
export const paymentAccountStyle = {
  ...smallSelectItemStyles,
  control: (provided, { isFocused, isDisabled }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: '#EAECF0'
    },
    borderColor: '#EAECF0',
    borderRadius: '4px',
    minHeight: '32px',
    height: '40px',
    backgroundColor: isDisabled ? '#F2F4F7' : '#FFFFFF'
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '40px'
  }),
  clearIndicator: (provided, state) => ({
    ...provided,
    height: '40px'
  }),
  dropdownIndicator: (provided, { selectProps, isDisabled }) => ({
    ...provided,
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : '',
    backgroundColor: isDisabled ? '#F2F4F7' : '#FFFFFF',
    borderRadius: 4,
    marginRight: 10,
    marginLeft: 10,
    padding: 0
  })
}
