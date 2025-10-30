import { Input } from '@/components-v2'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { EPlacement } from '@/components/DropDown/DropDown'
import DraftFilterDropdown from '@/views/MakePayment2/components/ImportDraftPaymentsModal/DraftFilterDropdown'
import DateRangeFilter from '@/views/Transactions-v2/TxFilter/DateRangeFilter'
import { debounce } from 'lodash'
import React from 'react'
import { IDraftFilters } from '../DraftTransactionListView'
import { GroupDropdown } from '@/components-v2/GroupDropDown'

export type IOption = {
  value: string
  label: string
  src?: any
}

interface IDraftTransactionFilter {
  filters: IDraftFilters
  reviewerOptions: IOption[]
  assetOptions: IOption[]
  accountOptions: any
  setFilters: (filters: IDraftFilters) => void
  resetPage: () => void
}

const DraftTransactionFilter: React.FC<IDraftTransactionFilter> = ({
  filters,
  setFilters,
  reviewerOptions = [],
  assetOptions,
  accountOptions,
  resetPage
}) => {
  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value })
    resetPage()
  }
  const handleChangeAccounts = (_accounts) => {
    setFilters({ ...filters, accounts: _accounts })
    resetPage()
  }
  const handleChangeReviewers = (_reviewers) => {
    setFilters({ ...filters, reviewers: _reviewers })
    resetPage()
  }
  const handleChangeAssets = (_assets) => {
    setFilters({ ...filters, cryptocurrencies: _assets })
    resetPage()
  }
  const handleChangeDate = (_dateRange) => {
    setFilters({ ...filters, startDate: _dateRange?.startDate, endDate: _dateRange?.endDate })
    resetPage()
  }

  return (
    <section id="filter" className="flex flex-row items-center justify-between flex-1">
      <div className="flex flex-row gap-2 items-center flex-1 mr-3">
        <div className="w-full">
          <Input
            placeholder="Search by recipient name or address..."
            id="txhash"
            onChange={debounce(handleSearch, 300)}
            isSearch
            classNames="h-[32px]"
          />
        </div>
        <DividerVertical height="h-6" space="m-0" />
        <div className="flex items-center gap-4">
          <GroupDropdown
            options={accountOptions}
            title="Account"
            name="correspondingChartOfAccountIds"
            widthBtn="w-full"
            dropdownWidth="w-full"
            className="w-[200px] h-[34px]"
            selection={filters?.accounts || []}
            setSelection={handleChangeAccounts}
            onClear={() => handleChangeAccounts([])}
            isReset
            applyable
            position="bottom"
            dropdownHeight="max-h-[320px]"
          />
          <DraftFilterDropdown
            name="Reviewer"
            options={[
              {
                value: 'null',
                label: 'Anyone can review'
              },
              ...reviewerOptions
            ]}
            value={filters?.reviewers || []}
            onChange={handleChangeReviewers}
            onClear={() => handleChangeReviewers([])}
          />
          <DraftFilterDropdown
            name="Asset"
            options={assetOptions?.map((asset) => ({ ...asset, img: asset.src }))}
            value={filters?.cryptocurrencies || []}
            onChange={handleChangeAssets}
            onClear={() => handleChangeAssets([])}
          />
          <DateRangeFilter
            selection={{
              startDate: filters?.startDate ? new Date(filters?.startDate) : null,
              endDate: filters?.endDate ? new Date(filters?.endDate) : null
            }}
            className="h-[34px] rounded w-[200px]"
            widthBtn="w-full"
            dropdownWidth="w-full"
            dropdownPlacement={EPlacement.BESIDE}
            isReset
            applyable
            onApply={handleChangeDate}
            onClear={() => handleChangeDate({ startDate: undefined, endDate: undefined })}
          />
        </div>
      </div>
    </section>
  )
}

export default DraftTransactionFilter
