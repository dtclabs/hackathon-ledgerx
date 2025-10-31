import Typography from '@/components-v2/atoms/Typography'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { FC } from 'react'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import Button from '@/components-v2/atoms/Button'
import Download from '@/public/svg/Download.svg'
import Image from 'next/legacy/image'
import { Badge2 } from '@/components-v2/molecules/Badge'
import { capitalize } from 'lodash'
import { IPayment, PaymentStatus } from '@/api-v2/billing-api'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'

interface IPaymentAndBilling {
  data: IPayment[]
  showBanner?: boolean
  onRedirectToPlan: () => void
  onDownloadInvoice: (invoiceId: string, fileName: string) => (e) => void
}

const PAYMENT_TABLE_HEADERS = [
  {
    Header: 'Payment Date',
    accessor: 'paymentDate'
  },
  {
    Header: 'Invoice Number',
    accessor: 'invoiceNumber'
  },
  {
    Header: 'Plan Name',
    accessor: 'planName'
  },
  {
    Header: 'Billing Cycle',
    accessor: 'billingCycle'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Payment Status',
    accessor: 'paymentStatus'
  },
  {
    Header: 'Payment Method',
    accessor: 'paymentMethod'
  },
  {
    Header: 'Actions',
    accessor: 'actions'
  }
]

const PaymentAndBilling: FC<IPaymentAndBilling> = ({ data, showBanner, onRedirectToPlan, onDownloadInvoice }) => {
  const {
    timezone: timeZonesetting,
    country: countrySetting,
    fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)

  return (
    <div className="mt-6">
      <Typography variant="heading3" classNames="mb-4">
        Payment History
      </Typography>
      <SimpleTable
        noData={
          <EmptyData>
            <EmptyData.Icon />
            <EmptyData.Title>No payment history found. Buy a plan to continue enjoying full access.</EmptyData.Title>
            <EmptyData.CTA label="See Plans" onClick={onRedirectToPlan} />
          </EmptyData>
        }
        tableHeight={showBanner ? 'h-[calc(100vh-468px)]' : 'h-[calc(100vh-300px)]'}
        defaultPageSize={999}
        renderRow={(row: { original: IPayment }) => (
          <>
            <BaseTable.Body.Row.Cell>
              {row?.original?.status === PaymentStatus.PAID
                ? formatTimeBasedonUTCOffset(
                    row?.original?.paidAt,
                    timeZonesetting?.utcOffset || 480,
                    countrySetting?.iso || 'SG',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }
                  )
                : '-'}
            </BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>{row?.original?.invoiceMetadata?.invoiceNumber || '-'}</BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>
              {capitalize(row?.original?.subscriptionDetails?.planName)}
            </BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>
              {capitalize(row?.original?.subscriptionDetails?.billingCycle)}
            </BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>
              {fiatCurrencySetting?.symbol}
              {row?.original?.status === PaymentStatus.PAID
                ? formatNumberWithCommasBasedOnLocale(row?.original?.paidAmount, countrySetting?.iso)
                : formatNumberWithCommasBasedOnLocale(row?.original?.billedAmount, countrySetting?.iso)}
            </BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>
              <div className="w-fit">
                <Badge2
                  variant="rounded"
                  color={row?.original?.status === PaymentStatus.PAID ? 'success' : 'orange'}
                  size="small"
                >
                  <Badge2.Label>{capitalize(row?.original?.status)}</Badge2.Label>
                </Badge2>
              </div>
            </BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>
              {row?.original?.status === PaymentStatus.PAID && row?.original?.paymentMethod
                ? capitalize(row?.original?.paymentMethod?.replace('_', ' '))
                : '-'}
            </BaseTable.Body.Row.Cell>
            <BaseTable.Body.Row.Cell>
              {row?.original?.invoiceMetadata?.invoiceNumber ? (
                <Button
                  onClick={onDownloadInvoice(row?.original?.id, row?.original?.invoiceMetadata.s3Filename)}
                  height={32}
                  label="Invoice"
                  variant="grey"
                  leadingIcon={<Image src={Download} width={14} height={14} />}
                />
              ) : (
                '-'
              )}
            </BaseTable.Body.Row.Cell>
          </>
        )}
        columns={PAYMENT_TABLE_HEADERS}
        data={data || []}
      />
    </div>
  )
}

export default PaymentAndBilling
