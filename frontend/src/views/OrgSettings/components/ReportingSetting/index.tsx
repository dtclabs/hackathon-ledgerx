import Select, { components } from 'react-select'
import React, { useEffect, useState, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  useGetCountriesQuery,
  useGetFiatCurrenciesQuery,
  useGetTimezonesQuery,
  useOrgSettingsMutation
} from '@/api-v2/org-settings-api'
import ConfirmCurrencyModal from '../ConfirmCurrencyModal'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useAppSelector, useAppDispatch } from '@/state'
import { setOrgSettings, orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import { minutesTohhmm } from '@/utils-v2/formatTime'
import Image from 'next/legacy/image'
import ConfirmModal from '../ConfirmModal'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Loading from '@/components/Loading'

export interface IReportingSettingForm {
  country: object
  currency: object
  timezone: object
  calcMethod: {
    value: string
    label: string
    disabled?: boolean
  }
}

interface IReportingSetting {
  onSave: (data: any) => void
  showBanner: boolean
  walletTotalItems: number
}

interface ISearchableDropdown {
  value: object
  options: object[]
  handleOnChange: (object) => void
  optionStyles?: object
  placeholder?: string
  name: string
  height?: string
  width?: string
  disabled?: boolean
  isLoading?: boolean
}

// WIP: Abstract to an atom
export const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <div className="bg-[#F2F4F7] h-6 w-6 cursor-pointer flex justify-center items-center py-[6px] p-1 rounded-[4px] mr-0.5">
      <img
        src="/svg/Dropdown.svg"
        width={11.5}
        height={6.8}
        alt="DownArrow"
        className={props.isFocused ? 'rotate-180 ' : ''}
      />
    </div>
  </components.DropdownIndicator>
)
export const Menu = (props, isLoading) => (
  <components.Menu {...props}>
    {isLoading ? (
      <div className="h-[100px] flex justify-center items-center">
        <Loading dark height="h-[50px]" classNames="!py-5" title="Fetching Banks" titleClassNames="!text-[18px]" />
      </div>
    ) : (
      props.children
    )}
  </components.Menu>
)

// WIP: Abstract to an atom
export const SearchableDropdown = ({
  value,
  handleOnChange,
  options,
  optionStyles,
  placeholder,
  name,
  height = '48px',
  disabled = false,
  width = '400px',
  isLoading
}: ISearchableDropdown) => (
  <Select
    placeholder={placeholder}
    styles={{
      control: (baseStyles, state) => ({
        ...baseStyles,
        width,
        height,
        boxShadow: state.isFocused
          ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)'
          : '',
        '&:hover': {
          borderColor: '#F1F1EF !important'
        },
        border: '1px solid #F1F1EF',
        fontSize: '14px'
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        background: state.isSelected ? '#F1F1EF' : state.isFocused ? '#FBFAFA' : '',
        color: '#535251',
        fontSize: '14px',
        ...optionStyles
      }),
      menu: (baseStyles) => ({
        ...baseStyles,
        width,
        boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)',
        border: '1px solid #EAECF0',
        background: '#FFFFFF'
      }),
      placeholder: (baseStyles) => ({
        ...baseStyles,
        color: '#B5B5B3'
      })
    }}
    components={{ DropdownIndicator, Menu: (props) => Menu(props, isLoading) }}
    classNamePrefix="select"
    value={value}
    isSearchable
    name={name}
    options={options}
    onChange={handleOnChange}
    isDisabled={disabled}
    maxMenuHeight={192}
  />
)

const ReportingSetting: React.FC<IReportingSetting> = ({ onSave, showBanner, walletTotalItems }) => {
  const orgSettings = useAppSelector(orgSettingsSelector)
  const dispatch = useAppDispatch()
  const tempData = useRef(null)
  const [updateOrgSettings, updateOrgSettingsResponse] = useOrgSettingsMutation()
  const [isConfirmOpen, setIsConfrimOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { control, handleSubmit, setValue } = useForm<IReportingSettingForm>({
    defaultValues: {
      country: { value: '', label: '' },
      currency: { value: '', label: '' },
      timezone: { value: '', label: '' },
      calcMethod: { value: 'FIFO', label: 'First In First Out (FIFO)' }
    }
  })
  const country = useWatch({ control, name: 'country' })
  const currency = useWatch({ control, name: 'currency' })
  const timezone = useWatch({ control, name: 'timezone' })
  const calcMethod = useWatch({ control, name: 'calcMethod' })

  const organizationId = useOrganizationId()
  const { data: countries } = useGetCountriesQuery({})
  const { data: fiatCurrencies } = useGetFiatCurrenciesQuery({})
  const { data: timezones } = useGetTimezonesQuery({})
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)

  const { checkWalletSync } = useWalletSync({
    organisationId: organizationId
  })

  useEffect(() => {
    if (updateOrgSettingsResponse.isSuccess) {
      toast.success('Organisation Settings updated')
      checkWalletSync()
      setIsConfrimOpen(false)
      setShowConfirm(false)
      tempData.current = null
      dispatch(setOrgSettings(updateOrgSettingsResponse.data))
    } else if (updateOrgSettingsResponse.isError) {
      if (updateOrgSettingsResponse?.error?.data?.message) {
        toast.error(updateOrgSettingsResponse?.error?.data?.message)
      } else {
        toast.error('Sorry, an unexpected error occured')
      }
    }
  }, [updateOrgSettingsResponse])

  useEffect(() => {
    if (orgSettings) {
      const addPlusSign = orgSettings?.timezone?.utcOffset.toString()[0] === '-' ? '' : '+'
      setValue('country', { value: orgSettings?.country?.id, label: orgSettings?.country?.name })
      setValue('currency', {
        value: orgSettings?.fiatCurrency?.code,
        label: `${orgSettings?.fiatCurrency?.name} (${orgSettings?.fiatCurrency?.code})`
      })
      setValue('timezone', {
        value: orgSettings?.timezone?.id,
        label: `(UTC${addPlusSign}${minutesTohhmm(parseInt(orgSettings?.timezone?.utcOffset))}) ${
          orgSettings?.timezone?.name
        }`
      })
    }
  }, [orgSettings])

  // Todo: Add transformResponse to remove the need for data chain below
  const countriesFormatted = countries?.data.map((countryVal) => ({ value: countryVal.id, label: countryVal.name }))

  const currenciesFormatted = fiatCurrencies?.data.map((currencyVal) => ({
    value: currencyVal.code,
    label: `${currencyVal.name} (${currencyVal.code})`
  }))

  const timezonesFormatted = timezones?.data.map((timezoneVal) => {
    const addPlusSign = timezoneVal.utcOffset.toString()[0] === '-' ? '' : '+'
    return {
      value: timezoneVal.id,
      label: `(UTC${addPlusSign}${minutesTohhmm(parseInt(timezoneVal.utcOffset))}) ${timezoneVal.name}`
    }
  })

  const calcMethodOptions = [
    { value: 'FIFO', label: 'First In First Out (FIFO)' },
    { value: 'WAC', label: 'Weighted Average Cost (WAC)', disabled: true }
  ]

  const handleSave = (data: any) => {
    // Check if Updating Currencys - If so add modal instead
    if (orgSettings.fiatCurrency.code !== data.currency.value) {
      tempData.current = {
        countryId: data.country.value,
        fiatCurrency: data.currency.value,
        timezoneId: data.timezone.value
      }
      setIsConfrimOpen(true)
    } else {
      tempData.current = {
        countryId: data.country.value,
        fiatCurrency: data.currency.value,
        timezoneId: data.timezone.value
      }
      setShowConfirm(true)
    }
  }

  const handleSelectCountry = (selectedCountry: object) => {
    setValue('country', selectedCountry)
  }

  const handleSelectCurrency = (selectedCurrency: object) => {
    setValue('currency', selectedCurrency)
  }

  const handleSelectTimezone = (selectedTimezone: object) => {
    setValue('timezone', selectedTimezone)
  }

  const handleCalcMethod = (selectedMethod: any) => {
    setValue('calcMethod', selectedMethod)
  }

  const handleOnAcceptCurrencyChange = () => {
    updateOrgSettings({
      payload: tempData.current,
      orgId: organizationId
    })
  }

  const handleResetDefaults = () => {
    const addPlusSign = orgSettings?.timezone?.utcOffset.toString()[0] === '-' ? '' : '+' // Abstract
    setValue('country', { value: orgSettings?.country?.id, label: orgSettings?.country?.name })
    setValue('currency', {
      value: orgSettings?.fiatCurrency?.code,
      label: `${orgSettings?.fiatCurrency?.name} (${orgSettings?.fiatCurrency?.code})`
    })
    setValue('timezone', {
      value: orgSettings?.timezone?.id,
      label: `(UTC${addPlusSign}${minutesTohhmm(parseInt(orgSettings?.timezone?.utcOffset))}) ${
        orgSettings?.timezone?.name
      }`
    })
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit(handleSave)}>
        <div className={`${showBanner ? 'h-[calc(100vh-462px)]' : 'h-[calc(100vh-394px)]'} overflow-auto scrollbar`}>
          {isWalletSyncing && walletTotalItems > 0 && (
            <div className="w-full bg-[#FDF1E7] flex px-[16px] py-[13px] border-solid border-[#F5BF8F] border rounded-lg text-sm  mb-6">
              <Image src="/svg/icons/warning-icon-orange.svg" alt="download" height={14} width={14} />
              <Typography classNames="ml-2.5 !text-[#A55208]">
                We are syncing transactions data. You will be able to edit the settings after the sync is completed.
              </Typography>
            </div>
          )}
          <div className="flex flex-col gap-8">
            <div className="flex items-center">
              <Typography classNames="w-[300px]" variant="body2" color="dark">
                Country
              </Typography>
              <SearchableDropdown
                value={country}
                options={countriesFormatted}
                handleOnChange={handleSelectCountry}
                placeholder="Select a Country"
                name="country"
              />
            </div>
            <div className="flex items-center">
              <Typography variant="body2" color="dark" classNames="w-[300px]">
                Currency
              </Typography>
              <div>
                <SearchableDropdown
                  value={currency}
                  options={currenciesFormatted}
                  handleOnChange={handleSelectCurrency}
                  placeholder="Select a Currency"
                  name="currency"
                />
                <Typography classNames="mt-2" variant="caption" color="dark">
                  Note: Changing your reporting currency will result in an override of your current cost basis of the
                  transactions.
                </Typography>
              </div>
            </div>
            <div className="flex items-center">
              <Typography variant="body2" color="dark" classNames="w-[300px]">
                Time Zone
              </Typography>
              <SearchableDropdown
                value={timezone}
                options={timezonesFormatted}
                handleOnChange={handleSelectTimezone}
                placeholder="Select a Timezone"
                name="timezone"
              />
            </div>
            <div className="flex items-center">
              <Typography variant="body2" color="dark" classNames="w-[300px]">
                Cost Basis Calculation Method
              </Typography>
              {/* Temporary to have an option with the coming soon tag */}
              <Select
                placeholder="Select a calculation method"
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    width: '400px',
                    boxShadow: state.isFocused
                      ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)'
                      : '',
                    '&:hover': {
                      borderColor: '#F1F1EF !important'
                    },
                    border: '1px solid #F1F1EF',
                    fontSize: '14px'
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    background: state.isSelected ? '#F1F1EF' : state.isFocused ? '#FBFAFA' : '',
                    color: state.isDisabled ? '#bfc2c7' : '#535251',
                    fontSize: '14px',
                    '&: after': state.isDisabled
                      ? {
                          content: '"Coming Soon"',
                          height: '12px',
                          width: '12px',
                          background: '#F2F4F7',
                          marginLeft: '76px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: '400',
                          color: '#1D2939',
                          padding: '4px 10px'
                        }
                      : {}
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)',
                    border: '1px solid #EAECF0',
                    background: '#FFFFFF'
                  })
                }}
                components={{ DropdownIndicator }}
                className="basic-single"
                classNamePrefix="select"
                value={calcMethod}
                isSearchable
                name="calcMethod"
                options={calcMethodOptions}
                onChange={handleCalcMethod}
                isOptionDisabled={(option) => option.disabled}
              />
            </div>
          </div>
        </div>
        <div className="bg-white flex justify-end gap-3 py-6 border-t border-grey-200 w-full">
          <Button height={40} variant="grey" type="button" onClick={handleResetDefaults} label="Cancel" />
          <Button height={40} variant="black" type="submit" disabled={isWalletSyncing} label="Save Changes" />
        </div>
      </form>
      <ConfirmCurrencyModal
        isLoading={updateOrgSettingsResponse.isLoading}
        showModal={isConfirmOpen}
        setShowModal={setIsConfrimOpen}
        onAccept={handleOnAcceptCurrencyChange}
      />
      <ConfirmModal
        isLoading={updateOrgSettingsResponse.isLoading}
        showModal={showConfirm}
        setShowModal={setShowConfirm}
        onAccept={handleOnAcceptCurrencyChange}
        title="Save Reporting Preferences?"
        subTitle="Are you sure you want to update the reporting preferences?"
      />
    </div>
  )
}

export default ReportingSetting
