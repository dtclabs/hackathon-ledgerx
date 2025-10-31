/* eslint-disable no-unused-expressions */
/* eslint-disable no-unsafe-optional-chaining */
import { SideModal } from '@/components-v2/SideModal'
import Typography from '@/components-v2/atoms/Typography'
import { IDraftFilters } from '../../DraftTransactionListView'
import { IOption } from '../DraftTransactionFilter'
import { CurrencyType } from '@/api-v2/payment-api'
import { useEffect, useState } from 'react'
import Checkbox from '@/components/Checkbox/Checkbox'
import DateRangeFilter from '@/views/Transactions-v2/TxFilter/DateRangeFilter'
import { EPlacement } from '@/components/DropDown/DropDown'
import { GroupDropdown } from '@/components-v2/GroupDropDown'
import { optionElement } from '@/views/MakePayment2/components/ImportDraftPaymentsModal/DraftFilterDropdown'
import MultipleDropDown from '@/views/Transactions-v2/TxFilter/MultipleDropDown'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

interface IDraftFilter {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  filters: IDraftFilters
  reviewerOptions: IOption[]
  assetOptions: IOption[]
  accountOptions: any
  setFilters: (filters: IDraftFilters) => void
  resetPage: () => void
}

const DraftFilter: React.FC<IDraftFilter> = ({
  setShowModal,
  showModal = true,
  filters,
  setFilters,
  reviewerOptions = [],
  assetOptions,
  accountOptions,
  resetPage
}) => {
  const [isClear, setIsClear] = useState(false)
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [selectedAccounts, setSelectedAccounts] = useState([])
  const [selectedReviewers, setSelectedReviewers] = useState([])
  const [selectedAssets, setSelectedAssets] = useState([])

  useEffect(() => {
    if (isClear) {
      setIsClear(false)
    }
  }, [isClear])

  useEffect(() => {
    if (showModal) {
      setSelectedPaymentTypes(filters?.destinationCurrencyType || [])
      setStartDate(filters?.startDate ? new Date(filters?.startDate) : null)
      setEndDate(filters?.endDate ? new Date(filters?.endDate) : null)
      setSelectedAccounts(filters?.accounts || [])
      setSelectedReviewers(filters?.reviewers || [])
      setSelectedAssets(filters?.cryptocurrencies || [])
    }
  }, [showModal])

  const paymentTypeOptions = [
    { value: CurrencyType.CRYPTO, label: 'Crypto to Crypto' },
    { value: CurrencyType.FIAT, label: 'Crypto to Fiat' }
  ]

  const reviewersElement = (reviewer) => (
    <Typography color="primary" variant="body2" styleVariant="medium" classNames="truncate">
      {reviewer.label}
    </Typography>
  )

  const handleChange = (_option) => {
    setSelectedPaymentTypes((prev) =>
      prev?.find((item) => item.value === _option.value)
        ? prev?.filter((item) => item.value !== _option.value)
        : [...prev, _option]
    )
  }
  const handleChangeDate = (_dateRange) => {
    setStartDate(_dateRange?.startDate)
    setEndDate(_dateRange?.endDate)
  }

  const handleChangeAccounts = (_accounts = []) => {
    _accounts?.length && setSelectedAccounts(_accounts)
  }
  const handleChangeReviewers = (_reviewers) => {
    setSelectedReviewers(_reviewers)
  }
  const handleChangeAssets = (_assets) => {
    setSelectedAssets(_assets)
  }

  const handleApply = () => {
    resetPage()
    setShowModal(false)
    setFilters({
      ...filters,
      destinationCurrencyType: selectedPaymentTypes,
      accounts: selectedAccounts,
      reviewers: selectedReviewers,
      cryptocurrencies: selectedAssets,
      startDate: startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '',
      endDate: endDate ? format(new Date(endDate), 'yyyy-MM-dd') : ''
    })
  }

  const handleClear = () => {
    resetPage()
    toast.success('Filter cleared')
    setFilters({
      ...filters,
      destinationCurrencyType: [],
      startDate: null,
      endDate: null,
      accounts: [],
      reviewers: [],
      cryptocurrencies: []
    })
    setSelectedPaymentTypes([])
    setSelectedAccounts([])
    setSelectedAssets([])
    setSelectedReviewers([])
    setStartDate(null)
    setEndDate(null)
    setIsClear(true)
  }

  return (
    <SideModal
      title="Filters"
      setShowModal={setShowModal}
      showModal={showModal}
      primaryCTA={{ onClick: handleApply }}
      secondaryCTA={{ onClick: handleClear }}
    >
      <div className="flex flex-col gap-4">
        <Typography styleVariant="semibold" variant="body2" color="primary">
          Payment Type
        </Typography>
        <div className="flex gap-2 flex-wrap">
          {paymentTypeOptions.map((option) => (
            <Checkbox
              key={option.value}
              className="flex gap-2 relative items-center bg-dashboard-background w-fit px-[10px] py-[6px] rounded text-neutral-900 text-xs capitalize"
              label={option.label}
              isChecked={!!selectedPaymentTypes?.find((item) => item.value === option.value)}
              onChange={(e) => {
                e.stopPropagation()
                handleChange(option)
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Date Range
        </Typography>
        <DateRangeFilter
          selection={{
            startDate: filters?.startDate ? new Date(filters?.startDate) : null,
            endDate: filters?.endDate ? new Date(filters?.endDate) : null
          }}
          setSelection={handleChangeDate}
          className="h-[48px] rounded"
          widthBtn="w-full"
          dropdownWidth="w-full"
          dropdownPlacement={EPlacement.BESIDE}
          isReset={!showModal || isClear}
          onClear={() => handleChangeDate({ startDate: undefined, endDate: undefined })}
        />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Accounts
        </Typography>
        <GroupDropdown
          options={accountOptions}
          title="Account"
          name="correspondingChartOfAccountIds"
          widthBtn="w-full"
          dropdownWidth="w-full"
          className="h-[48px]"
          selection={filters?.accounts || []}
          setSelection={handleChangeAccounts}
          onClear={() => handleChangeAccounts([])}
          isReset={!showModal || isClear}
          position="bottom"
          dropdownHeight="max-h-[280px]"
        />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Reviewers
        </Typography>
        <MultipleDropDown
          options={[
            {
              value: 'null',
              label: 'Anyone can review'
            },
            ...reviewerOptions
          ]}
          name="Reviewer"
          title="Reviewer"
          selection={filters?.reviewers || []}
          setSelection={handleChangeReviewers}
          widthBtn="w-full"
          dropdownWidth="w-full"
          element={reviewersElement}
          isReset={!showModal || isClear}
          dropdownHeight="max-h-[280px]"
          onClear={() => {
            handleChangeReviewers([])
          }}
        />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Assets
        </Typography>
        <MultipleDropDown
          options={assetOptions?.map((asset) => ({ ...asset, img: asset.src }))}
          name="Asset"
          title="Asset"
          selection={filters?.cryptocurrencies || []}
          setSelection={handleChangeAssets}
          widthBtn="w-full"
          dropdownWidth="w-full"
          element={optionElement}
          isReset={!showModal || isClear}
          dropdownHeight="max-h-[280px]"
          onClear={() => {
            handleChangeAssets([])
          }}
        />
      </div>
    </SideModal>
  )
}
export default DraftFilter
