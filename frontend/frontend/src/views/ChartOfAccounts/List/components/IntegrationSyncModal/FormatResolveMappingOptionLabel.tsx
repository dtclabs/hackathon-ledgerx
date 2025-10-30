import { customCategoryStyles } from '@/views/Transactions-v2/TxGridTable/TxGridTableRow'
import { components } from 'react-select'
import AlertIcon from '@/public/svg/icons/alert-circle-icon.svg'
import Image from 'next/legacy/image'

export const singleValueComponents = (props) => (
  <components.SingleValue {...props}>
    {!props.data.value && props.data.value !== null && <Image src={AlertIcon} width={14} height={14} />}
    {props.data.label}
  </components.SingleValue>
)

export const resolvedMappingCustomStyles = {
  ...customCategoryStyles,
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    color: '#2D2D2C',
    borderColor: '#e2e2e0',
    minHeight: '34px',
    height: '34px',
    boxShadow: state.isFocused ? null : null
  }),
  singleValue: (provided) => ({
    ...provided,
    top: 0,
    color: '#2d2d2c',
    transform: 'none',
    paddingLeft: 4,
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    display: 'flex',
    gap: 6,
    width: 'max-content'
  })
}
