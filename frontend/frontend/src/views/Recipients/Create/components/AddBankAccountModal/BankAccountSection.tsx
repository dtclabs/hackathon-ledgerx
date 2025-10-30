import { FormField } from '@/components-v2'
import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import { IDestinationAccount } from '@/hooks-v2/contact/type'
import { SearchableDropdown } from '@/views/OrgSettings/components/ReportingSetting'
import { chunk } from 'lodash'
import React, { useMemo } from 'react'
import RequiredFields from './RequiredFields'
import { DESTINATION_ACCOUNT_INPUT, IGNORED_FIELDS } from './constant'
import { useAppSelector } from '@/state'
import { bankLoadingSelector } from '@/slice/contacts/contacts-slice'

interface BankAccountSectionProps {
  control: any
  errors: any
  requiredFields: any
  optionMap: any
  bankAccount: IDestinationAccount
  onChangeField: (field, value) => void
  onChangeCountry: (value) => void
  bankOptions: { value: string; label: string; country: string; fiatCurrency: string }[]
  currencyOptions: { value: string; label: string }[]
  countryOptions: { value: string; label: string }[]
}

const BankAccountSection: React.FC<BankAccountSectionProps> = ({
  control,
  errors,
  optionMap,
  bankAccount,
  bankOptions,
  requiredFields,
  countryOptions,
  currencyOptions,
  onChangeField,
  onChangeCountry
}) => {
  const bankLoading = useAppSelector(bankLoadingSelector)

  const fieldMap = useMemo(() => {
    if (requiredFields) {
      const fieldArray = Object.keys(requiredFields).filter(
        (key) => requiredFields[key]?.required && !IGNORED_FIELDS.includes(key)
      )
      const batch = chunk(fieldArray, 2)
      return batch
    }
    return []
  }, [requiredFields])

  const renderInput = useMemo(
    () => (
      <RequiredFields
        errors={errors}
        control={control}
        data={bankAccount}
        fieldMap={fieldMap}
        optionMap={optionMap}
        session="destinationAccount"
        onChangeField={onChangeField}
        requiredFields={requiredFields}
        inputMap={DESTINATION_ACCOUNT_INPUT}
      />
    ),
    [fieldMap, optionMap, bankAccount, errors]
  )

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Bank Account Details
      </Typography>
      <div className="flex gap-4">
        <FormField
          className="w-full"
          label="Country"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <SearchableDropdown
            value={countryOptions.find((_option) => _option.value === bankAccount?.countryCode) || null}
            options={countryOptions}
            handleOnChange={(_country) => {
              onChangeField('destinationAccount', {
                accountNumber: bankAccount.accountNumber,
                accountName: bankAccount.accountName,
                countryCode: _country.value,
                currency: '',
                bankName: '',
                bankId: ''
              })
              onChangeCountry((prev) => ({ ...prev, destinationAccount: _country.value }))
            }}
            placeholder="Select a Country"
            name="country"
            width="100%"
          />
          {errors?.countryCode?.message && <HelperText helperText={errors?.countryCode.message} />}
        </FormField>
      </div>
      <div className="flex gap-4">
        <FormField
          className="basis-1/2"
          label="Bank Name"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <SearchableDropdown
            value={
              bankOptions.find((_option) => _option.value === bankAccount?.bankId) ||
              (bankAccount?.bankName
                ? {
                    label: bankAccount?.bankName,
                    name: bankAccount?.bankId
                  }
                : null)
            }
            options={bankOptions.filter(
              (_option) => _option.country?.toLowerCase() === bankAccount?.countryCode?.toLowerCase()
            )}
            isLoading={bankLoading}
            handleOnChange={(_bank) =>
              onChangeField('destinationAccount', {
                ...bankAccount,
                bankId: _bank.value,
                bankName: _bank.label,
                currency: _bank.fiatCurrency
              })
            }
            placeholder="Select a Bank"
            name="country"
            width="100%"
          />
          {errors?.bankName?.message && <HelperText helperText={errors?.bankName.message} />}
        </FormField>
        <FormField
          className="basis-1/2"
          label="Bank Account Number"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <TextField
            control={control}
            errorClass="mt-1"
            name="destinationAccount.accountNumber"
            placeholder="Bank Account Number *"
          />
          {errors?.accountNumber?.message && <HelperText helperText={errors?.accountNumber.message} />}
        </FormField>
      </div>
      <div className="flex gap-4">
        <FormField
          className="basis-1/2"
          label="Currency"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <SearchableDropdown
            value={currencyOptions.find((_option) => _option.value === bankAccount?.currency)}
            options={currencyOptions}
            handleOnChange={(_currency) =>
              onChangeField('destinationAccount', {
                ...bankAccount,
                currency: _currency.value
              })
            }
            placeholder="Select a Currency"
            name="currency"
            width="100%"
          />
          {errors?.currency?.message && <HelperText helperText={errors?.currency.message} />}
        </FormField>
        <FormField
          className="basis-1/2"
          label="Routing Code"
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <TextField
            control={control}
            errorClass="mt-1"
            name="destinationAccount.routingCode"
            placeholder="Routing Code"
          />
          {errors?.routingCode?.message && <HelperText helperText={errors?.routingCode.message} />}
        </FormField>
      </div>
      {renderInput}
    </div>
  )
}

export default BankAccountSection
