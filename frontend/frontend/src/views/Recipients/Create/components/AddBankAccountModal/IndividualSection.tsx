import { FormField } from '@/components-v2'
import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import { IIndividualInfo } from '@/hooks-v2/contact/type'
import { SearchableDropdown } from '@/views/OrgSettings/components/ReportingSetting'
import { chunk } from 'lodash'
import React, { useMemo } from 'react'
import RequiredFields from './RequiredFields'
import { IGNORED_FIELDS, INDIVIDUAL_INPUT } from './constant'

interface IndividualSectionProps {
  control: any
  errors: any
  optionMap: any
  accountNameErrors: any
  individualInfo: Partial<IIndividualInfo>
  onChangeField: (field, value) => void
  onChangeCountry: (value) => void
  requiredFields: any
  countryOptions: { value: string; label: string }[]
}

const IndividualSection: React.FC<IndividualSectionProps> = ({
  control,
  errors,
  optionMap,
  countryOptions,
  accountNameErrors,
  onChangeField,
  onChangeCountry,
  individualInfo,
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
        data={individualInfo}
        fieldMap={fieldMap}
        optionMap={optionMap}
        session="individual"
        onChangeField={onChangeField}
        requiredFields={requiredFields}
        inputMap={INDIVIDUAL_INPUT}
      />
    ),
    [fieldMap, optionMap, individualInfo, errors]
  )

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Individual Particulars
      </Typography>
      <div className="flex gap-4">
        <FormField
          className="basis-1/2"
          label="Country of Residence"
          isRequired
          labelClassName="!text-dashboard-main !font-semibold text-sm"
        >
          <SearchableDropdown
            value={countryOptions.find((_option) => _option.value === individualInfo?.countryCode) || null}
            options={countryOptions}
            handleOnChange={(_country) => {
              onChangeField('individual', {
                firstName: individualInfo.firstName,
                lastName: individualInfo.lastName,
                countryCode: _country.value
              })
              onChangeCountry((prev) => ({ ...prev, individual: _country.value }))
            }}
            placeholder="Select a Country"
            name="country"
            width="100%"
          />
          {errors?.countryCode?.message && <HelperText helperText={errors?.countryCode?.message} />}
        </FormField>
        <FormField
          className="basis-1/2"
          label="Full Name (as registered with the bank)"
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

export default IndividualSection
