import { FC, useState } from 'react'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { Button } from '@/components-v2'
import SelectDropdown from '@/components-v2/Select/Select'
import CloseIcon from '@/public/svg/icons/close-icon.svg'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import { scrollbarSelect } from '@/constants/styles'
import ReactTooltip from 'react-tooltip'
import { useAppSelector } from '@/state'
import FormatCoAOptionLabel from './TxGridTable/FormatCoAOptionLabel'

interface ITopBulkActions {
  numberSelected: number
  // onClickIgnoreTx: any
  categories: any
  onClickChangeCategory: any
  handleClosePopup: any
  isLoading: any
}

const TopBulkActions: FC<ITopBulkActions> = ({
  numberSelected = 0,
  // onClickIgnoreTx,
  onClickChangeCategory,
  handleClosePopup,
  isLoading,
  categories
}) => {
  const [category, setCategory] = useState('')
  const router = useRouter()
  const tab = router.query.tab
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)

  const onChangeCategory = (_category) => {
    setCategory(_category.value)
    onClickChangeCategory(_category)
  }

  // const handleOnClickSubmit = () => {
  //   onClickIgnoreTx()
  // }
  return (
    <div
      className="rounded-xl bg-[#101828] px-7 gap-4 py-3 text-[#ffffff] text-xs flex flex-row items-center"
      style={{
        position: 'absolute',
        left: '50%',
        top: 75,
        transform: 'translate(-50%, -50%)',
        fontWeight: 600,
        zIndex: 1000
      }}
    >
      {numberSelected} selected{' '}
      <SelectDropdown
        disableIndicator
        isSearchable
        styles={customStyles}
        className="w-[250px]"
        onChange={onChangeCategory}
        defaultValue={{ value: '', label: 'Select Account', className: '!text-[#344054]' }}
        name="cateogry"
        formatOptionLabel={FormatCoAOptionLabel}
        options={categories}
      />{' '}
      {/* <div data-tip="bulkactionstxn" data-for="bulkactionstxn">
        <Button disabled={isLoading || isWalletSyncing} size="md" color="secondary" onClick={handleOnClickSubmit}>
          {tab === 'ignored' ? 'Sync' : 'Ignore'}
        </Button>{' '}
        {isWalletSyncing && (
          <ReactTooltip
            id="bulkactionstxn"
            place="top"
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg !text-xs max-w-[244px]"
          >
            We are syncing transactions data. You will be able to ignore a wallet after the sync is completed.
          </ReactTooltip>
        )}
      </div> */}
      <div className="ml-4" style={{ border: '1px solid #FFFFFF', transform: 'rotate(180deg)', height: 30 }} />
      <Image onClick={handleClosePopup} className="cursor-pointer" height={25} width={25} src={CloseIcon} />
    </div>
  )
}

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    borderColor: '#9e9e9e',
    minHeight: '40px',
    height: '40px',
    boxShadow: state.isFocused ? null : null
  }),

  option: (provided, { isFocused, isSelected, value, isDisabled }) => ({
    ...provided,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F1F1EF' : '',
    color: '#344054',
    fontSize: 14,
    fontWeight: value === null ? 600 : 400,
    cursor: 'pointer'
  }),
  singleValue: (provided, state) => ({
    ...provided,
    top: 0,
    color: '#344054',
    transform: 'none',
    paddingLeft: 4,
    fontSize: 14
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    height: '40px',
    padding: '0 6px'
  }),

  input: (provided, state) => ({
    ...provided,
    margin: '0px'
  }),
  indicatorSeparator: (state) => ({
    display: 'none'
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '40px'
  }),
  groupHeading: (provided) => ({
    ...provided,
    background: '#E2E2E0',
    padding: '4px 8px',
    color: '#2D2D2C',
    fontSize: 10,
    fontWeight: 550
  }),
  group: (provided) => ({
    padding: '2px 0'
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect
  })
}
export default TopBulkActions
