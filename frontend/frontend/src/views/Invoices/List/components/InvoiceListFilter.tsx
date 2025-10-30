/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useState } from 'react'
import { DateTimePicker } from '@/components-v2/DateTimePicker'
import { debounce } from 'lodash'
import { Input } from '@/components-v2'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { Dropdown } from '@/components-v2/molecules/Forms'

interface IInvoiceListFilterProps {
  filter: any
  setFilter: any
}

const INVOICE_STATUS = [
  {
    value: '',
    label: 'All'
  },
  {
    value: 'created',
    label: 'Created'
  },
  {
    value: 'pending',
    label: 'Pending'
  },
  {
    value: 'paid',
    label: 'Paid'
  },
  {
    value: 'cancelled',
    label: 'Cancelled'
  },
  {
    value: 'expired',
    label: 'Expired'
  }
]

const renderCustomOptionLabel = (_value) => <div>Invoice Status: {_value.label}</div>

const InvoiceListFilter: FC<IInvoiceListFilterProps> = ({ filter, setFilter }) => {
  const [inputValue, setInputValue] = useState('')

  const debouncedUpdateValue = useCallback(
    debounce((value) => {
      setFilter({
        ...filter,
        invoiceNumber: value
      })
    }, 300),
    []
  )

  const handleOnChangeSearch = (e) => {
    setInputValue(e.target.value)
    debouncedUpdateValue(e.target.value)
  }

  const handleOnDropdownChange = (option) => {
    setFilter({
      ...filter,
      status: option.value
    })
  }

  const handleOnIssuedDateChange = (_value) => {
    setFilter({
      ...filter,
      issuedAt: _value ? new Date(_value).toISOString() : null
    })
  }
  return (
    <div className="flex flex-row gap-1 mb-4  items-center ">
      <div className="basis-3/5">
        <Input
          isSearch
          placeholder="Search invoice name"
          value={inputValue}
          classNames="h-[38px]"
          id="search"
          onChange={handleOnChangeSearch}
        />
      </div>
      <DividerVertical height="h-[38px]" />
      <div className="relative z-50 basis-2/5 flex flex-row gap-4">
        <DateTimePicker
          isClearable
          placeholder="Issued Date"
          onSelect={handleOnIssuedDateChange}
          showTimeSelect={false}
        />
        <Dropdown
          showCaret
          formatOptionLabel={renderCustomOptionLabel}
          defaultValue={INVOICE_STATUS[0]}
          onChange={handleOnDropdownChange}
          placeholder="Select option"
          sizeVariant="small"
          options={INVOICE_STATUS}
        />
      </div>
    </div>
  )
}

export default InvoiceListFilter
