/* eslint-disable react/no-array-index-key */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import Typography from '@/components-v2/atoms/Typography'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { selectCryptocurrencyBySymbol } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import ReviewLineItem from './ReviewLineItem'
import SectionNotes from './SectionNotes'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useLazyDownloadPaymentFileQuery } from '@/api-v2/payment-api'
import PopupDialog from '../PopupDialog'
import { Divider } from '@/components-v2/Divider'
import { useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'

const COLUMNS = [
  {
    Header: 'Recipient',
    accessor: 'recipient'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Account',
    accessor: 'account'
  },
  {
    Header: 'Notes',
    accessor: 'notes'
  },
  {
    Header: 'Files',
    accessor: 'files'
  },
  {
    Header: 'Status',
    accessor: 'status'
  }
]

interface IReviewPaymentProps {
  formData: any
}

const ReviewPayment: FC<IReviewPaymentProps> = ({ formData }) => {
  const init = useRef(false)
  const organizationId = useOrganizationId()
  const { fiatCurrency } = useAppSelector(orgSettingsSelector)
  const [cryptocurrencyPrices, setCryptocurrencyPrices] = useState<any>({})
  const cryptocurrencies = formData?.recipients.map((recipient) => recipient.token)
  const [triggerGetPrice] = useLazyGetTokenPriceQuery()
  const ethToken = useAppSelector((state) => selectCryptocurrencyBySymbol(state)(['eth']))
  const reviewTableProvider = useTableHook({})

  const [downloadFile] = useLazyDownloadPaymentFileQuery()
  const [triggerPreviewFile] = useLazyPreviewFileQuery()

  useEffect(() => {
    // Reset form on dismount incase for items added so API is called
    return () => {
      init.current = false
    }
  }, [])

  useEffect(() => {
    // Call API to get price of all cryptocurrencies
    if (cryptocurrencies.length > 0 && !init.current) {
      for (const cryptocurrency of cryptocurrencies) {
        triggerGetPrice({
          params: {
            cryptocurrencyId: cryptocurrency?.value || ethToken[0]?.publicId,
            fiatCurrency: fiatCurrency?.code,
            date: new Date().toISOString() // Need to check if we can send just DD-MM-YYYY to backend so we can cache this
          }
        })
          .unwrap()
          .then((res) => {
            setCryptocurrencyPrices((prevState) => ({
              ...prevState,
              [cryptocurrency?.value]: res?.data
            }))
          })
      }
      init.current = true
    }
  }, [cryptocurrencies])

  const getAmountMapForAllCurrencies = (recipients) => {
    const amountMap = new Map()
    const totalCryptoAssets = []
    recipients.forEach((recipient) => {
      const publicId = recipient.token.value
      if (amountMap.has(publicId)) {
        const currentObj = amountMap.get(publicId)
        const updatedValue = parseFloat(currentObj.amount) + parseFloat(recipient.amount)
        amountMap.set(publicId, { ...currentObj, amount: updatedValue.toString(), id: publicId })
      } else {
        amountMap.set(publicId, {
          id: publicId,
          amount: recipient.amount,
          symbol: recipient.token.label,
          image: recipient.token.src
        })
      }
    })

    amountMap.forEach((amountObj) => totalCryptoAssets.push(amountObj))
    return totalCryptoAssets
  }

  const totalCryptoAssets = getAmountMapForAllCurrencies(formData?.recipients)

  // Find payment total based on all line items
  const paymentTotal = formData?.recipients?.reduce(
    (acc, user) => {
      const tokenSymbol = user?.token?.value
      const tokenAmount = parseFloat(user?.amount)
      const tokenPrice = cryptocurrencyPrices[tokenSymbol] || 0
      const userValue = tokenAmount * tokenPrice

      // Add to total value
      acc.totalValue += userValue

      // Add to individual token total
      if (!acc.tokenTotals[tokenSymbol]) {
        acc.tokenTotals[tokenSymbol] = 0
      }
      acc.tokenTotals[tokenSymbol] += userValue

      return acc
    },
    { totalValue: 0, tokenTotals: {} }
  )

  const handleDownloadDraftFile = (draftId: string, fileId: string) => {
    const fileName = fileId.slice(37)
    downloadFile({ organizationId, id: draftId, fileId, fileName })
  }
  const handlePreviewFile = (file) => {
    if (file?.id) {
      triggerPreviewFile({ key: file.id, filename: file.name })
    } else {
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
    }
  }
  // Render all the tokens used in the payment for display at top of page

  const renderTable = useMemo(
    () => (
      <SimpleTable
        columns={COLUMNS}
        data={formData?.recipients || []}
        pagination
        provider={reviewTableProvider}
        renderRow={(row) => (
          <ReviewLineItem
            index={row?.index}
            data={row?.original}
            fiatCurrency={fiatCurrency}
            cryptocurrencyPrices={cryptocurrencyPrices}
            onDownloadDraftFile={handleDownloadDraftFile}
            onPreviewFile={handlePreviewFile}
          />
        )}
      />
    ),
    [cryptocurrencyPrices, fiatCurrency, formData?.recipients]
  )

  const mergedAssets = totalCryptoAssets
    .map((asset) => {
      return {
        ...asset,
        tokenPrice: paymentTotal.tokenTotals[asset.id]
      }
    })
    .sort((a, b) => b.tokenPrice - a.tokenPrice)

  return (
    <div className="flex flex-col gap-2">
      <div className="border p-4 rounded-md flex mb-2 justify-between">
        <Typography styleVariant="semibold">Paying From</Typography>
        <div className="flex flex-row items-center gap-2">
          <Typography styleVariant="semibold">{formData?.sourceWallet.label}</Typography>
          <WalletAddressCopy address={formData?.sourceWallet.address} />
          {/* <Image src={selectedChain?.imageUrl} alt="network-image" height={14} width={14} /> */}
        </div>
      </div>
      <div className="border p-4 rounded-md flex flex-col  justify-between">
        <div className="flex items-center justify-between">
          <Typography styleVariant="semibold">Paying To</Typography>
          <div className="flex items-center flex-row gap-4">
            <Typography classNames="border-r border-[#F1F1EF] pr-2">
              {formData?.recipients?.length} Recipient{formData?.recipients?.length > 1 && 's'}
            </Typography>
            <div className="flex gap-3 border-r border-[#F1F1EF] pr-2" data-tip="asset-grid" data-for="asset-grid">
              {mergedAssets?.slice(0, 2)?.map((amountObj, _index) => (
                <div key={_index} className="flex gap-1">
                  {/* <Image src={amountObj.image} width={16} height={16} className="flex-shrink-0" /> */}
                  <Typography variant="body2" styleVariant="semibold">
                    {amountObj.amount}
                  </Typography>
                </div>
              ))}
              <PopupDialog
                placement="below"
                width="250px"
                trigger={
                  <Typography styleVariant="semibold" classNames="cursor-pointer underline">
                    View Full Summary
                  </Typography>
                }
              >
                <div>
                  <div className="flex flex-col  " data-tip="asset-grid" data-for="asset-grid">
                    {mergedAssets?.map((amountObj, _index) => (
                      <div key={_index} className="mb-3">
                        <div className="flex gap-2 items-center ">
                          {/* <Image src={amountObj.image} width={16} height={16} /> */}
                          <Typography variant="body2" classNames="-ml-1" styleVariant="semibold">
                            {amountObj?.amount ?? 'N/A'}
                          </Typography>
                          <Typography variant="body2" styleVariant="semibold">
                            {amountObj?.symbol ?? 'N/A'}
                          </Typography>
                        </div>
                        <Typography variant="caption" color="secondary">
                          ~ {fiatCurrency?.symbol}
                          {amountObj?.tokenPrice ?? 'N/A'} {fiatCurrency?.code}
                        </Typography>
                      </div>
                    ))}
                    <div className="-mt-5">
                      <Divider />
                      <div className="flex flex-col gap-2">
                        <Typography variant="caption" color="secondary">
                          Total
                        </Typography>
                        <Typography styleVariant="semibold">
                          ~ {fiatCurrency?.symbol}
                          {paymentTotal?.totalValue?.toFixed(2) ?? 'N/A'} {fiatCurrency?.code}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </PopupDialog>
            </div>
            <Typography
              classNames="cursor-pointer"
              data-tip="payment-total"
              data-for="payment-total"
              styleVariant="semibold"
            >
              ~ {fiatCurrency?.symbol}
              {paymentTotal?.totalValue.toFixed(2)} {fiatCurrency?.code}
            </Typography>
            <ReactTooltip
              id="payment-total"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {fiatCurrency?.symbol}
              {paymentTotal?.totalValue}
            </ReactTooltip>
          </div>
        </div>

        <div className="mt-6">{renderTable}</div>
      </div>

      <div className=" mt-3">
        <SectionNotes />
      </div>
    </div>
  )
}

export default ReviewPayment
