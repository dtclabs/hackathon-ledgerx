import React from 'react'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { InvoiceWithTax } from '../Create/CreateInvoiceView'
import { DTCInvoice } from '@/components-v2/organisms/DTCInvoice'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import Typography from '@/components-v2/atoms/Typography'

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
  issuedAt: string
  expiredAt: string
  currency: string
  notes: string
  settlementStatus: string
  status?: string
}

interface InvoicePreviewModalProps {
  provider: any

  isLoading?: boolean
  onClose?: () => void
  fiatCurrencySetting: {
    currencyCode: string
    currencyCategory: string
    currencyImage: string
  }
  countryIso: string
  taxType?: string
  data: IInvoicePreviewProps
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  provider,
  data,
  fiatCurrencySetting,
  countryIso,
  onClose,
  isLoading,
  taxType
}) => {
  const invoiceTitle = data?.invoiceNumber.length > 15 ? `${data?.invoiceNumber.slice(0, 15)}...` : data?.invoiceNumber

  return (
    <BaseModal provider={provider} width="900">
      <BaseModal.Header>
        <div className="flex flex-row justify-between items-center flex-grow ">
          <div>
            <div className="flex flex-row gap-2 items-center">
              <BaseModal.Header.Title>Invoice #</BaseModal.Header.Title>
              {isLoading ? (
                <SkeletonLoader variant="rounded" width={130} height={17} />
              ) : (
                <div>
                  {data?.invoiceNumber?.length > 15 ? (
                    <Tooltip
                      position={ETooltipPosition.TOP}
                      shortText={<BaseModal.Header.Title>{invoiceTitle}</BaseModal.Header.Title>}
                      text={<Typography variant="caption">{data?.invoiceNumber}</Typography>}
                    />
                  ) : (
                    <BaseModal.Header.Title>{invoiceTitle}</BaseModal.Header.Title>
                  )}
                </div>
              )}
            </div>
          </div>

          <BaseModal.Header.CloseButton onClose={onClose} />
        </div>
      </BaseModal.Header>
      <BaseModal.Body>
        <DTCInvoice
          taxType={taxType}
          fiatCurrencySetting={{
            ...fiatCurrencySetting,
            currencyCode: 'USD'
          }}
          countryIso={countryIso}
          data={data}
          isLoading={isLoading}
        />
      </BaseModal.Body>
    </BaseModal>
  )
}
export default InvoicePreviewModal
