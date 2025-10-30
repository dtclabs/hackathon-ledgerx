import { CurrencyType } from '@/api-v2/payment-api'
import { customStyles, smallSelectItemStyles } from '@/constants/styles'

export const HEADERS = [
  { label: 'Recipient', value: 'recipient', style: { padding: '12px' } },
  { label: 'Amount', value: 'amount', style: { padding: '12px' } },
  { label: 'Account', value: 'type', style: { padding: '12px', width: '14%' } },
  { label: 'Created On', value: 'created_on', style: { padding: '12px', width: '12%' } },
  { label: 'Assigned Reviewer', value: 'assignedReviewer', style: { padding: '12px', width: '15%' } },
  { label: 'Actions', value: 'actions', style: { padding: '12px', width: '20%' } }
]
export const HEADERS_WITHOUT_REVIEWER = [
  { label: 'Recipient', value: 'recipient', style: { padding: '12px' } },
  { label: 'Amount', value: 'amount', style: { padding: '12px' } },
  { label: 'Account', value: 'type', style: { padding: '12px' } },
  { label: 'Created On', value: 'created_on', style: { padding: '12px' } },
  { label: 'Actions', value: 'actions', style: { padding: '12px', width: '20%' } }
]

export const HEADERS_FAILED_TAB = [
  { label: 'Recipient', value: 'recipient', style: { padding: '12px' } },
  { label: 'Amount', value: 'amount', style: { padding: '12px' } },
  { label: 'Account', value: 'type', style: { padding: '12px' } },
  { label: 'Created On', value: 'created_on', style: { padding: '12px' } },
  { label: 'Failed On', value: 'failed_on', style: { padding: '12px' } },
  { label: 'Actions', value: 'actions', style: { padding: '12px', width: '20%' } }
]

export const CREATE_DRAFT_OPTIONS = [
  { value: CurrencyType.CRYPTO, label: 'Crypto to Crypto' },
  { value: CurrencyType.FIAT, label: 'Crypto to Fiat' }
]

export const recipientSelectorStyle = {
  ...customStyles,
  control: (provided, { isFocused, selectProps }) => ({
    ...provided,
    boxShadow: isFocused ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(242, 244, 247, 0.8)' : '',
    '&:hover': {
      borderColor: selectProps?.isInvalid ? '#C61616' : '#EAECF0'
    },
    borderColor: selectProps?.isInvalid ? '#C61616' : '#EAECF0',
    borderRadius: '4px',
    height: 48,
    backgroundColor: '#FFFFFF'
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
}
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
