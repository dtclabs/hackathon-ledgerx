import MonthPicker from '@/components-v2/MonthPicker/MonthPicker'
import SelectDropdown from '@/components-v2/Select/Select'
import { Alert } from '@/components-v2/molecules/Alert'
import { FormGroup } from '@/components-v2/molecules/Forms'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import PdfIcon from '@/public/image/pdf.png'
import CsvIcon from '@/public/svg/icons/csv-icon.svg'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import format from 'date-fns/format'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import ExportOptionLabel from '../ExportModalV2/components/ExportOptionLabel'
import { ExportTo, FILE_TYPE } from '../ExportModalV2/interface'
import { IGenerateReportModal, REPORT_OPTIONS, ReportInterval } from './interface'


function convertToUtcDate(date) {
  const utcYear = date.getUTCFullYear()
  const utcMonth = date.getUTCMonth()
  const utcDate = date.getUTCDate()
  const utcHours = date.getUTCHours()
  const utcMinutes = date.getUTCMinutes()
  const utcSeconds = date.getUTCSeconds()

  // Create a new Date object in UTC
  const utcDateObject = new Date(Date.UTC(utcYear, utcMonth, utcDate, utcHours, utcMinutes, utcSeconds))

  // Format the date as a string in 'yyyy-MM-dd' format
  const formattedUtcDate = format(utcDateObject, 'yyyy-MM-dd')

  return formattedUtcDate
}

const today = new Date()
const threeMonthsAgo = subMonths(startOfMonth(today), 2)

const GenerateReportModal: React.FC<IGenerateReportModal> = ({ provider, onClickPrimary, isLoading, isSuccess }) => {
  const organisationId = useOrganizationId()
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const [isReset, setIsReset] = useState<boolean>(false)

  const [exportTo, setExportTo] = useState<{ value: ExportTo; label: string; icon?: any }>({
    value: ExportTo.CSV,
    label: FILE_TYPE[ExportTo.CSV],
    icon: CsvIcon
  })
  const [reportInterval, setReportInterval] = useState<{ value: ReportInterval; label: string }>({
    value: ReportInterval.MONTHLY,
    label: 'Monthly Closing Balance'
  })
  const [reportPeriod, setReportPeriod] = useState<{ startDate: Date; endDate: Date }>({
    startDate: threeMonthsAgo,
    endDate: today
  })

  useEffect(() => {
    setIsReset(true)
  }, [isSuccess])

  const handleChangeExportTo = (_option) => {
    setExportTo(_option)
  }
  const handleChangeReportInterval = (_option) => {
    setReportInterval((prev) => ({ ...prev, ..._option }))
  }

  const handleStartDateChange = (date) => {
    if (isReset) setIsReset(false) // Todo - This is so bad
    const startMonth = startOfMonth(date)
    return setReportPeriod((prev) => ({ ...prev, startDate: startMonth }))
  }

  const handleEndDateChange = (date) => {
    if (isReset) setIsReset(false) // Todo - This is so bad
    const endMonth = endOfMonth(date)
    if (today >= endMonth) return setReportPeriod((prev) => ({ ...prev, endDate: endMonth }))

    return setReportPeriod((prev) => ({ ...prev, endDate: today }))
  }

  const handleOnCloseModal = () => {
    setReportPeriod({ startDate: threeMonthsAgo, endDate: today })
    setIsReset(true)
    provider.methods.setIsOpen(false)
  }

  const handleGenerate = () => {
    const startTime = format(reportPeriod?.startDate, 'yyyy-MM-dd')
    // const endTime = format(reportPeriod?.endDate, 'yyyy-MM-dd')

    const formattedEndDate = convertToUtcDate(reportPeriod?.endDate)

    if (startTime > formattedEndDate) {
      toast.error('Start month cannot be later than end month')
    } else {
      onClickPrimary({
        exportTo: exportTo?.value,
        reportInterval: reportInterval?.value,
        startTime,
        endTime: formattedEndDate
      })
    }
  }

  const primaryButtonLabel = useMemo(() => `Generate ${FILE_TYPE[exportTo?.value] || ''}`, [exportTo?.value])

  const checkSubscription = () => {
    if (subscriptionPlan?.status === 'active' && subscriptionPlan?.planName !== 'free_trial') {
      return true
    }
    return false
  }

  return (
    <BaseModal provider={provider} width="600">
      <BaseModal.Header>
        <BaseModal.Header.Title>Generate Report</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton onClose={handleOnCloseModal} />
      </BaseModal.Header>
      <BaseModal.Body>
        <div className="relative flex flex-col gap-6 mt-6">
          <div className="flex-1">
            <FormGroup label="Select Type" extendClass="font-semibold">
              <SelectDropdown
                name="report-interval"
                value={reportInterval}
                onChange={handleChangeReportInterval}
                options={REPORT_OPTIONS}
                className="font-normal"
              />
            </FormGroup>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <FormGroup label="Select Start Month" extendClass="font-semibold">
                <MonthPicker
                  closeOnSelect
                  minDate={checkSubscription() ? null : threeMonthsAgo}
                  maxDate={reportPeriod?.endDate}
                  selection={threeMonthsAgo}
                  isReset={isReset}
                  yearDropdown={checkSubscription()}
                  setSelection={handleStartDateChange}
                  isClearable={false}
                  widthBtn="w-full"
                  dropdownWidth="w-full"
                />
              </FormGroup>
            </div>
            <div className="flex-1">
              <FormGroup label="Select End Month" extendClass="font-semibold">
                <MonthPicker
                  closeOnSelect
                  minDate={checkSubscription() ? null : threeMonthsAgo}
                  maxDate={today}
                  selection={today}
                  isReset={isReset}
                  yearDropdown={checkSubscription()}
                  setSelection={handleEndDateChange}
                  isClearable={false}
                  widthBtn="w-full"
                  dropdownWidth="w-full"
                />
              </FormGroup>
            </div>
          </div>
          <div className="flex-1">
            <FormGroup label="Export to" extendClass="font-semibold">
              <SelectDropdown
                name="export-to"
                value={exportTo}
                onChange={handleChangeExportTo}
                options={[
                  { value: ExportTo.CSV, label: FILE_TYPE[ExportTo.CSV], icon: CsvIcon },
                  { value: ExportTo.PDF, label: FILE_TYPE[ExportTo.PDF], icon: PdfIcon }
                ]}
                formatOptionLabel={ExportOptionLabel}
                className="font-normal"
              />
            </FormGroup>
          </div>

          {checkSubscription() ? null : (
            <Alert variant="warning" isVisible>
              <Alert.Icon />
              <Alert.Text extendedClass="text-black-0">
                Upgrade required to see more than 3 months of data.{' '}
                <strong className="underline decoration-1">
                  <Link href={`/${organisationId}/orgsettings?activeTab=pricingAndPlans`}>See Plans</Link>
                </strong>
              </Alert.Text>
            </Alert>
          )}
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA onClick={handleOnCloseModal} disabled={isLoading} label="Cancel" />
        <BaseModal.Footer.PrimaryCTA
          type="submit"
          onClick={handleGenerate}
          disabled={isLoading}
          label={primaryButtonLabel}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default GenerateReportModal
