import { FormField } from '@/components-v2'
import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import { ICompanyInfo } from '@/hooks-v2/contact/type'
import { SearchableDropdown } from '@/views/OrgSettings/components/ReportingSetting'
import { chunk } from 'lodash'
import React, { useMemo } from 'react'
import RequiredFields from './RequiredFields'
import { COMPANY_INPUT, IGNORED_FIELDS } from './constant'

interface CompanySectionProps {
  control: any
  errors: any
  optionMap: any
  accountNameErrors: any
  companyInfo: Partial<ICompanyInfo>
  onChangeField: (field, value) => void
  onChangeCountry: (value) => void
  requiredFields: any
}

const CompanySection: React.FC<CompanySectionProps> = ({
  control,
  errors,
  optionMap,
  accountNameErrors,
  onChangeField,
  onChangeCountry,
  companyInfo,
  requiredFields
}) => {
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
        data={companyInfo}
        fieldMap={fieldMap}
        optionMap={optionMap}
        session="company"
        onChangeField={onChangeField}
        requiredFields={requiredFields}
        inputMap={COMPANY_INPUT}
      />
    ),
    [fieldMap, optionMap, companyInfo, errors]
  )

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Organisation Particulars
      </Typography>
      <div className="flex gap-4">
        <FormField
          className="basis-1/2"
          label="Country"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <SearchableDropdown
            value={optionMap?.countryCode.find((_option) => _option.value === companyInfo?.countryCode) || null}
            options={optionMap?.countryCode}
            handleOnChange={(_country) => {
              onChangeField('company', {
                registeredName: companyInfo.registeredName,
                countryCode: _country.value
              })
              onChangeCountry((prev) => ({ ...prev, company: _country.value }))
            }}
            placeholder="Select a Country"
            name="country"
            width="100%"
          />
          {errors?.countryCode?.message && <HelperText helperText={errors?.countryCode?.message} />}
        </FormField>
        <FormField
          className="basis-1/2"
          label="Registered Name (as registered with the bank)"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <TextField
            control={control}
            errorClass="mt-1"
            name="destinationAccount.accountName"
            placeholder="Full Name *"
          />
          {accountNameErrors?.message && <HelperText helperText={accountNameErrors.message} />}
        </FormField>
      </div>
      {renderInput}
    </div>
  )
}

export default CompanySection
