import { customCategoryStyles } from '@/views/Transactions-v2/TxGridTable/TxGridTableRow'
import { scrollbarSelect } from '@/constants/styles'

export const yearSelectStyles = {
  ...customCategoryStyles,
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    color: '#2D2D2C',
    borderColor: '#e2e2e0',
    minHeight: '34px',
    height: '34px',
    width: '100px',
    boxShadow: state.isFocused ? null : null
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect,
    maxHeight: '100px'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#2d2d2c',
    fontWeight: 500
  }),
  input: (provided, state) => ({
    ...provided,
    margin: '0 6px',
    color: '#2d2d2c',
    fontWeight: 400
  })
}
