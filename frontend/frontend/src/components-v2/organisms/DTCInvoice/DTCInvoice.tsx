/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unneeded-ternary */
import React, { FC } from 'react'
import Image from 'next/legacy/image'
import { Badge2 as Badge } from '@/components-v2/molecules/Badge'
import Typography from '@/components-v2/atoms/Typography'
import DTCLogo from '@/public/svg/logos/dtcpay-logo.svg'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import {
  STATUS_COLOR_MAP,
  INVOICE_STATUS_MAP,
  calculateInvoiceTotalByTax,
  calculateInvoiceItemByTax
} from '@/views/Invoices/invoice-utils'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { capitalize } from 'lodash'
import { format } from 'date-fns'
import ReactCountryFlag from 'react-country-flag'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import InvoiceDetailsLoading from '@/views/Invoices/components/SkeletonLoaderInvoiceRows'
import { formatNumberByLocale } from '@/utils-v2/number-formatting'
import { InvoiceWithTax } from '@/views/Invoices/Create/CreateInvoiceView'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'

export interface IInvoicePreviewProps {
  invoiceNumber: string
  fromMetadata: {
    name: string
    address: string
  }
  invoiceDetails: {
    items: InvoiceWithTax[]
  }
  toMetadata: {
    name: string
  }
  metadata?: {
    note?: string
  }
  sourceMetadata?: {
    paidAt?: string
    transactionHash?: string
  }
  issuedAt: string
  expiredAt: string
  currency: string
  notes: string
  settlementStatus: string
  status?: string
}

interface InvoicePreviewModalProps {
  isLoading?: boolean
  fiatCurrencySetting: {
    currencyCode: string
    currencyCategory: string
    currencyImage: string
  }
  countryIso: string
  taxType?: string
  data: IInvoicePreviewProps
}

const DTCInvoice: FC<InvoicePreviewModalProps> = ({ data, taxType, countryIso, fiatCurrencySetting, isLoading }) => {
  const invoiceTotal = calculateInvoiceTotalByTax(data?.invoiceDetails?.items, taxType)
  const invoiceStatus = INVOICE_STATUS_MAP[data?.status ?? 'pending']
  const invoiceNotes = data?.metadata?.note || data?.notes
  const billedTo =
    data?.toMetadata?.name?.length > 15 ? `${data?.toMetadata?.name.slice(0, 15)}...` : data?.toMetadata?.name

  return (
    <div className="mt-6">
      <div className="flex flex-col min-xl:flex-row gap-8">
        <div className="basis-1/5">
          <Typography color="secondary" variant="caption">
            From:
          </Typography>
          <div>
            {isLoading ? (
              <div>
                <SkeletonLoader variant="rounded" width={80} height={10} />
                <SkeletonLoader variant="rounded" width={80} height={10} />
              </div>
            ) : (
              <div>
                <Typography styleVariant="semibold">{data?.fromMetadata?.name}</Typography>
                <Typography variant="caption">{data?.fromMetadata?.address}</Typography>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          {data?.toMetadata?.name && (
            <>
              {' '}
              <Typography color="secondary" variant="caption">
                Billed to:
              </Typography>
              <div className="w-[180px] ">
                {isLoading ? (
                  <div>
                    <SkeletonLoader variant="rounded" width={80} height={10} />
                    <SkeletonLoader variant="rounded" width={80} height={10} />
                  </div>
                ) : (
                  <div>
                    {data?.toMetadata?.name.length > 15 ? (
                      <Tooltip
                        position={ETooltipPosition.TOP}
                        shortText={<Typography styleVariant="semibold">{billedTo}</Typography>}
                        text={<Typography variant="caption">{data?.toMetadata?.name}</Typography>}
                      />
                    ) : (
                      <Typography styleVariant="semibold">{billedTo}</Typography>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          {isLoading ? (
            <SkeletonLoader variant="rounded" width={70} height={40} />
          ) : (
            <div className="max-w-[80px]">
              <Badge size="large" variant="rounded" color={STATUS_COLOR_MAP[invoiceStatus]}>
                <Badge.Label>{capitalize(invoiceStatus)}</Badge.Label>
              </Badge>
            </div>
          )}
          {data?.sourceMetadata?.paidAt && (
            <Typography variant="caption" color="secondary">
              Paid On: {format(new Date(data?.sourceMetadata?.paidAt), 'dd/MM/yyyy') ?? '-'}
            </Typography>
          )}
          {data?.sourceMetadata?.transactionHash && (
            <div className="flex flex-row items-center gap-2 -mt-1">
              <Typography variant="caption" color="secondary">
                Txn ID:
              </Typography>
              <WalletAddress variant="caption" split={5} address={data?.sourceMetadata?.transactionHash}>
                <WalletAddress.Copy address={data?.sourceMetadata?.transactionHash} />
              </WalletAddress>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col min-xl:flex-row mt-8 gap-4 justify-between">
        <div className="flex flex-row  justify-between">
          {' '}
          <div className="w-[120px]">
            <Typography variant="caption">Issued Date:</Typography>
            {isLoading ? (
              <SkeletonLoader variant="rounded" width={80} height={14} />
            ) : (
              <Typography variant="body2" styleVariant="medium">
                {data?.issuedAt ? format(new Date(data?.issuedAt), 'dd/MM/yyyy') : '-'}
              </Typography>
            )}
          </div>
          <div className="max-w-[120px]">
            <Typography variant="caption">Due Date:</Typography>

            {isLoading ? (
              <SkeletonLoader variant="rounded" width={80} height={14} />
            ) : (
              <Typography variant="body2" styleVariant="medium">
                {data?.expiredAt ? format(new Date(data?.expiredAt), 'dd/MM/yyyy') : '-'}
              </Typography>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-6 justify-between">
          <div>
            <Typography variant="caption" color="secondary" classNames="mb-1">
              Payment Method:
            </Typography>{' '}
            <Image src={DTCLogo} alt="dtc-logo" width={70} height={20} />
          </div>
          <div>
            <Typography variant="caption" color="secondary" classNames="mb-1">
              Default Currency:
            </Typography>{' '}
            <div className="flex flex-row gap-2">
              {isLoading ? (
                <SkeletonLoader variant="rounded" width={70} height={15} />
              ) : (
                <>
                  {fiatCurrencySetting.currencyCategory === 'cryptocurrency' ? (
                    <Image src={fiatCurrencySetting.currencyImage} height={16} width={16} alt="currency-image" />
                  ) : (
                    <ReactCountryFlag
                      className="mt-1"
                      countryCode="US"
                      svg
                      style={{
                        fontSize: '20px',
                        lineHeight: '20px'
                      }}
                    />
                  )}
                  <Typography variant="body2" styleVariant="medium" classNames="pt-0.5">
                    {data?.currency ?? '-'}
                  </Typography>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <section id="table" className="mt-4">
        <div className="max-h-[300px] overflow-y-auto">
          <BaseTable>
            <BaseTable.Header>
              <BaseTable.Header.Row>
                <BaseTable.Header.Row.Cell>Item</BaseTable.Header.Row.Cell>
                <BaseTable.Header.Row.Cell>Qty</BaseTable.Header.Row.Cell>
                <BaseTable.Header.Row.Cell>Unit Price</BaseTable.Header.Row.Cell>
                <BaseTable.Header.Row.Cell>Tax</BaseTable.Header.Row.Cell>
                <BaseTable.Header.Row.Cell>Total Amount</BaseTable.Header.Row.Cell>
              </BaseTable.Header.Row>
            </BaseTable.Header>
            <BaseTable.Body>
              {isLoading ? (
                <InvoiceDetailsLoading emptyRows={1} />
              ) : (
                data?.invoiceDetails?.items?.map((invoice, index) => {
                  const quantity = formatNumberByLocale(invoice?.quantity, countryIso ?? 'SG')
                  const unitPrice = formatNumberWithCommasBasedOnLocale(invoice?.amount, countryIso ?? 'SG')
                  const itemTotalPrice = formatNumberWithCommasBasedOnLocale(
                    calculateInvoiceItemByTax({
                      quantity: invoice?.quantity,
                      unitPrice: invoice?.amount,
                      taxType,
                      // @ts-ignore
                      tax: invoice?.tax?.amount ?? invoice?.tax
                    }).toString(),
                    countryIso ?? 'SG'
                  )

                  return (
                    <BaseTable.Body.Row key={index}>
                      <BaseTable.Body.Row.Cell id="name">{invoice?.name ?? '-'}</BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>{quantity === '0' ? '-' : quantity}</BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell id="unit-price">
                        {parseFloat(unitPrice) > 0 ? unitPrice : '-'}
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        {taxType === 'none'
                          ? '-'
                          : parseFloat(invoice?.tax?.amount ?? invoice?.tax) > 0
                          ? `${invoice?.tax?.amount ?? invoice?.tax}%`
                          : '-'}
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        {parseFloat(itemTotalPrice) > 0 ? (
                          <>
                            {invoice?.amount ? fiatCurrencySetting?.currencyCode : ''} {itemTotalPrice}
                          </>
                        ) : (
                          '-'
                        )}
                      </BaseTable.Body.Row.Cell>
                    </BaseTable.Body.Row>
                  )
                })
              )}

              <BaseTable.Body.Row>
                <BaseTable.Body.Row.Cell colSpan="5">
                  <div className="flex justify-end ">
                    <div className="flex flex-row ">
                      <div className="flex flex-col items-end">
                        <div className="p-4">
                          <Typography>Subtotal</Typography>
                        </div>
                        <div className="p-4">
                          <Typography>
                            {!taxType || taxType === 'none'
                              ? 'Tax'
                              : taxType === 'inclusive'
                              ? 'Tax Inclusive'
                              : 'Tax Exclusive'}
                          </Typography>
                        </div>
                        <div className={`${isLoading ? 'mt-1' : ''} bg-[#FBFAFA] p-4`}>
                          <Typography styleVariant="semibold">Total</Typography>
                        </div>
                      </div>
                      <div>
                        <div className="p-4 flex items-center">
                          {isLoading ? (
                            <SkeletonLoader variant="rounded" height={12} width={100} />
                          ) : (
                            <Typography>
                              {fiatCurrencySetting?.currencyCode}{' '}
                              {formatNumberWithCommasBasedOnLocale(
                                String(invoiceTotal.subtotal) ?? ' -',
                                countryIso ?? 'SG'
                              )}
                            </Typography>
                          )}
                        </div>
                        <div className="p-4">
                          {isLoading ? (
                            <SkeletonLoader variant="rounded" height={12} width={100} />
                          ) : (
                            <Typography>
                              {fiatCurrencySetting?.currencyCode}{' '}
                              {formatNumberWithCommasBasedOnLocale(
                                String(invoiceTotal.taxTotal) ?? ' -',
                                countryIso ?? 'SG'
                              )}
                            </Typography>
                          )}
                        </div>
                        <div className=" bg-[#FBFAFA] p-4">
                          {isLoading ? (
                            <SkeletonLoader variant="rounded" height={12} width={100} />
                          ) : (
                            <Typography styleVariant="semibold">
                              {fiatCurrencySetting?.currencyCode}{' '}
                              {formatNumberWithCommasBasedOnLocale(
                                String(invoiceTotal.total) ?? ' -',
                                countryIso ?? 'SG'
                              )}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseTable.Body.Row.Cell>
              </BaseTable.Body.Row>
            </BaseTable.Body>
          </BaseTable>
        </div>
      </section>
      <div className="mt-10 mb-4">
        <Typography variant="caption" color="secondary">
          Notes:
        </Typography>
        {isLoading ? (
          <SkeletonLoader variant="rounded" width={160} height={14} />
        ) : (
          <Typography styleVariant="semibold">{invoiceNotes ? invoiceNotes : '-'}</Typography>
        )}
      </div>
    </div>
  )
}

export default DTCInvoice
