/* eslint-disable no-else-return */
/* eslint-disable no-promise-executor-return */
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/legacy/image'
import { DTCInvoice } from '@/components-v2/organisms/DTCInvoice'
import DTCPaymentForm from './DTCPaymentForm'
import { Card } from '@/components-v2/Card'
import LedgerXLogo from '@/public/svg/logos/ledgerx-logo.svg'
import Typography from '@/components-v2/atoms/Typography'
import { useRouter } from 'next/router'
import { LoaderLX } from '@/components-v2'
import { useGetInvoicePublicQuery } from '@/api-v2/invoices-api'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { isEmpty } from 'lodash'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import LargeCheckIcon from '@/public/svg/empty-data-icons/check-icon.svg'
import useCountdownTimerV2 from '@/hooks-v2/useCountdownTimer-v2'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import ClockIcon from '@/public/svg/icons/clock-transparent-bg.svg'

const DTCPaymentUserView = () => {
  const router = useRouter()

  const [pollingInterval, setPollingInterval] = useState(5000)

  const { data: invoicePublic, isLoading: isInvoicePublicLoading } = useGetInvoicePublicQuery(
    {
      id: router.query.id as string,
      organizationId: router?.query?.organization as string
    },
    { skip: !router?.query?.organization, pollingInterval }
  )

  const remainingTime = useCountdownTimerV2(invoicePublic?.data?.expiredAt)
  useEffect(() => {
    if (invoicePublic?.data?.status === 'paid') {
      setPollingInterval(0)
    }
  }, [invoicePublic?.data?.status])

  const networkAndTokenData = useMemo(() => {
    const networkTokenOptions = {}
    const networkOptions = []
    // Iterate over the data
    invoicePublic?.data?.sourceMetadata?.channels.forEach((item) => {
      const blockchainId = item.blockchain.id
      const isBlockchainIdExist = networkOptions.find((network) => network.value === blockchainId)
      if (!isBlockchainIdExist) {
        networkOptions.push({
          label: item.blockchain.name,
          value: item.blockchain.id,
          image: item.blockchain.imageUrl
        })
      }
      const cryptocurrency = {
        channelId: item.id,
        label: item.cryptocurrency.name,
        value: item.cryptocurrency.symbol,
        image: item.cryptocurrency.image?.small
      }

      // Add the cryptocurrency to the networkTokenOptions under the blockchainId
      if (!networkTokenOptions[blockchainId]) {
        networkTokenOptions[blockchainId] = [cryptocurrency]
      } else {
        networkTokenOptions[blockchainId].push(cryptocurrency)
      }
    })

    return {
      networkOptions,
      networkTokenOptions
    }
  }, [invoicePublic])

  if (!router?.query?.id || isInvoicePublicLoading) {
    return (
      <div className="flex h-[100vh] justify-center">
        <LoaderLX />
      </div>
    )
  }

  const calculateTaxType = () => {
    if (invoicePublic?.data) {
      const invoiceTotal = invoicePublic?.data?.totalAmount
      const subTotal = invoicePublic?.data?.invoiceDetails?.subtotal
      const taxTotal = invoicePublic?.data?.invoiceDetails?.taxTotal
      if (parseFloat(taxTotal) === 0) {
        return 'none'
      } else if (invoiceTotal === subTotal) {
        return 'inclusive'
      }
      return 'exclusive'
    }
    return ''
  }

  if (isEmpty(invoicePublic?.data)) {
    return (
      <div className="flex h-[100vh] justify-center">
        <EmptyData>
          <EmptyData.Icon icon={LargeCheckIcon} />
          <EmptyData.Title>Your invoice link has expired.</EmptyData.Title>
          <EmptyData.Subtitle>
            If you have not paid for the invoice, please contact your Merchant to extend the due date.
          </EmptyData.Subtitle>
        </EmptyData>
      </div>
    )
  }
  const invoiceTitle =
    invoicePublic?.data?.invoiceNumber.length > 15
      ? `${invoicePublic?.data?.invoiceNumber.slice(0, 15)}...`
      : invoicePublic?.data?.invoiceNumber

  return (
    <div className="font-inter p-4 bg-[#FBFAFA] flex flex-col">
      <div className="mb-2 flex flex-col min-xl:flex-row items-center justify-between">
        <Image src={LedgerXLogo} alt="ledgerx-logo" width={200} height={50} />
        <div className="flex flex-row items-center gap-2">
          <Image src={ClockIcon} alt="clock-icon" width={14} height={14} />
          <Typography variant="body2" color="secondary">
            Link expiry: <span style={{ fontWeight: 500, color: '#2D2D2C' }}>{remainingTime}</span>
          </Typography>
        </div>
      </div>
      <div className="flex flex-row xl:flex-col gap-8 flex-grow">
        <div className="min-xl:h-[calc(100vh-100px)] xl:w-full 3xl:w-4/6 w-4/5">
          <Card className="h-full p-12">
            <div className="flex flex-row gap-2 items-center">
              <BaseModal.Header.Title className="flex gap-2 items-center">
                Invoice #
                {isInvoicePublicLoading ? (
                  <SkeletonLoader variant="rounded" width={130} height={17} />
                ) : (
                  // <BaseModal.Header.Title>{invoicePublic?.data?.invoiceNumber ?? '-'}</BaseModal.Header.Title>
                  <div>
                    {invoicePublic?.data?.invoiceNumber.length > 15 ? (
                      <Tooltip
                        whitespace="whitespace-normal"
                        position={ETooltipPosition.TOP}
                        shortText={<BaseModal.Header.Title>{invoiceTitle}</BaseModal.Header.Title>}
                        text={<Typography variant="caption">{invoicePublic?.data?.invoiceNumber}</Typography>}
                      />
                    ) : (
                      <BaseModal.Header.Title>{invoiceTitle ?? '-'}</BaseModal.Header.Title>
                    )}
                  </div>
                )}
              </BaseModal.Header.Title>
            </div>
            <DTCInvoice
              countryIso="SG"
              fiatCurrencySetting={{
                currencyCode: invoicePublic?.data?.currency ?? 'SGD',
                currencyCategory: invoicePublic?.data?.currencyCategory ?? 'fiat',
                currencyImage: invoicePublic?.data?.currencyImage ?? ''
              }}
              taxType={calculateTaxType()}
              isLoading={isInvoicePublicLoading}
              data={invoicePublic?.data}
            />
          </Card>
        </div>
        <div className="h-[calc(100vh-100px)] xl:w-full 3xl:w-2/6 w-2/6">
          <Card className="h-full p-8">
            <DTCPaymentForm
              id={router.query.id}
              status={invoicePublic?.data?.status ?? ''}
              organizationId={router?.query?.organization as string}
              payingTo={invoicePublic?.data?.fromMetadata?.name ?? ''}
              amount={invoicePublic?.data?.totalAmount ?? 0}
              chains={networkAndTokenData.networkOptions}
              cryptoCurrencies={networkAndTokenData.networkTokenOptions}
              paymentInfo={{
                currency: invoicePublic?.data?.currency ?? '',
                amountInToken: invoicePublic?.data?.sourceMetadata?.amount ?? 0,
                network: invoicePublic?.data?.sourceMetadata?.blockchain ?? '',
                cryptoCurrency: invoicePublic?.data?.sourceMetadata?.cryptocurrency ?? '',
                expiry: invoicePublic?.data?.sourceMetadata?.expiry ?? '',
                qrCode: invoicePublic?.data?.sourceMetadata?.qr ?? '',
                transactionHash: invoicePublic?.data?.sourceMetadata?.transactionHash ?? '',
                paidOn: invoicePublic?.data?.sourceMetadata?.paidAt ?? ''
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DTCPaymentUserView
