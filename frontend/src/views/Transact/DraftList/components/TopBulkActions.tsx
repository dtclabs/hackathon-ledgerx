import { FC, useMemo } from 'react'
import Image from 'next/legacy/image'
import Button from '@/components-v2/atoms/Button'
import SelectDropdown from '@/components-v2/Select/Select'
import CloseIcon from '@/public/svg/icons/close-icon.svg'
import { scrollbarSelect } from '@/constants/styles'
import SafeObject from '@/utils-v2/safe-object'
import FormatCoAOptionLabel from '@/views/Transactions-v2/TxGridTable/FormatCoAOptionLabel'
import { PaymentStatus } from '@/api-v2/payment-api'

interface ITopBulkActions {
  numberSelected: number
  isAbleToMakeBulkPayment: boolean
  handleClosePopup: any
  isLoading?: any
  handleBulkDelete: any
  handleOnChangeReviewer: any
  handleBulkSetCreated: any
  handleBulkSetPending: any
  handleBulkSetApproved: any
  handleBulkMakePayment: any
  isOpen: boolean
  reviewers: any
  activeTab: any
}

const TopBulkActions: FC<ITopBulkActions> = ({
  numberSelected = 0,
  isOpen,
  isAbleToMakeBulkPayment,
  handleClosePopup,
  handleBulkDelete,
  handleBulkSetCreated,
  handleBulkSetPending,
  handleBulkSetApproved,
  handleOnChangeReviewer,
  handleBulkMakePayment,
  reviewers = [],
  activeTab,
  isLoading
}) => {
  const shouldRenderButton = useMemo(() => {
    if (activeTab === 'invalid-data') return false
    if (activeTab === 'reviewed' && !isAbleToMakeBulkPayment) return false

    return true
  }, [activeTab, isAbleToMakeBulkPayment])

  if (!isOpen) return null
  const onChangeReviewer = (_reviewer) => handleOnChangeReviewer(_reviewer.value)

  const handleOnClickButton = () => {
    switch (activeTab) {
      case 'pending-review':
        handleBulkSetApproved()
        break
      case 'reviewed':
        handleBulkMakePayment()
        break
      case 'failed':
        handleBulkSetCreated()
        break
      default:
        handleBulkSetPending()
    }
  }

  const BUTTON_LABEL_MAP = new SafeObject(
    {
      'pending-review': 'Mark as reviewed',
      reviewed: 'Make payment',
      failed: 'Move to drafts'
    },
    'Submit for review'
  )

  const onClickDelete = () => handleBulkDelete()
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
      {shouldRenderButton && (
        <Button
          disabled={isLoading}
          height={40}
          label={BUTTON_LABEL_MAP.get(activeTab)}
          variant="grey"
          onClick={handleOnClickButton}
        />
      )}
      {activeTab === '' && (
        <SelectDropdown
          disableIndicator
          isSearchable
          disabled={isLoading}
          styles={customStyles}
          className="w-[250px]"
          onChange={onChangeReviewer}
          defaultValue={{ value: '', label: 'Select Reviewer', className: '!text-[#344054]' }}
          name="reviewer"
          formatOptionLabel={FormatCoAOptionLabel}
          options={[{ value: null, label: 'Anyone can review' }, ...reviewers]}
        />
      )}
      <Button disabled={isLoading} height={40} label="Delete" variant="redfilled" onClick={onClickDelete} />
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
