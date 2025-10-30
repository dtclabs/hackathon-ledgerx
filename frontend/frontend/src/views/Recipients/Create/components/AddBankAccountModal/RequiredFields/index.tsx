import { FormField } from '@/components-v2'
import { DateTimePicker } from '@/components-v2/DateTimePicker'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import { SearchableDropdown } from '@/views/OrgSettings/components/ReportingSetting'
import { format } from 'date-fns'
import _ from 'lodash'
import React from 'react'
import { InputType } from '../constant'

interface IRequiredFields {
  control: any
  errors: any
  data: any
  fieldMap: string[][]
  inputMap: { [key: string]: InputType }
  optionMap: { [key: string]: any[] }
  requiredFields: { [key: string]: any }
  onChangeField: (field, value) => void
  session: 'destinationAccount' | 'individual' | 'company'
}

const RequiredFields: React.FC<IRequiredFields> = ({
  control,
  errors,
  fieldMap,
  data,
  inputMap,
  optionMap,
  requiredFields,
  onChangeField,
  session
}) => (
  <>
    {fieldMap.map((_batch) => (
      <div className="flex gap-4" key={`group-${session}-${_batch?.[0]}`}>
        {_batch.map((_field) => {
          switch (inputMap[_field]) {
            case InputType.SELECT:
              return (
                <FormField
                  key={`${session}-${_field}`}
                  className={_batch.length === 1 ? 'w-[calc(50%-8px)]' : 'basis-1/2'}
                  label={_.startCase(_field)}
                  isRequired
                  labelClassName="!text-dashboard-main !font-semibold text-sm"
                >
                  <SearchableDropdown
                    value={optionMap?.[_field]?.find((_option) => _option.value === data?.[_field])}
                    options={optionMap?.[_field]?.filter((_option) => {
                      if (requiredFields[_field]?.options?.length > 0) {
                        return requiredFields[_field].options.includes(_option.value)
                      }
                      return true
                    })}
                    handleOnChange={(_option) =>
                      onChangeField(session, {
                        ...data,
                        [_field]: _option.value
                      })
                    }
                    placeholder={`Select a ${_.startCase(_field)}`}
                    name={_field}
                    width="100%"
                  />
                  {errors?.[_field]?.message && <HelperText helperText={errors?.[_field].message} />}
                </FormField>
              )
            case InputType.TEXT:
              return (
                <FormField
                  key={`${session}-${_field}`}
                  className={_batch.length === 1 ? 'w-[calc(50%-8px)]' : 'basis-1/2'}
                  label={_.startCase(_field)}
                  isRequired
                  labelClassName="!text-dashboard-main !font-semibold text-sm"
                >
                  <TextField
                    control={control}
                    errorClass="mt-1"
                    name={`${session}.${_field}`}
                    placeholder={`${_.startCase(_field)} *`}
                  />
                  {errors?.[_field]?.message && <HelperText helperText={errors?.[_field].message} />}
                </FormField>
              )
            case InputType.DATE:
              return (
                <FormField
                  key={`${session}-${_field}`}
                  className={_batch.length === 1 ? 'w-[calc(50%-8px)]' : 'basis-1/2'}
                  label={_.startCase(_field)}
                  isRequired
                  labelClassName="!text-dashboard-main !font-semibold text-sm"
                >
                  <DateTimePicker
                    placeholder={`Select ${_.startCase(_field)} *`}
                    height="48"
                    classNames="!border-grey-200"
                    inputDate={data?.[_field] ? new Date(data?.[_field]) : null}
                    onSelect={(date) =>
                      onChangeField(session, {
                        ...data,
                        [_field]: format(date, 'yyyy-MM-dd')
                      })
                    }
                  />
                  {errors?.[_field]?.message && <HelperText helperText={errors?.[_field].message} />}
                </FormField>
              )
            default:
              return null
          }
        })}
      </div>
    ))}
  </>
)

export default RequiredFields
