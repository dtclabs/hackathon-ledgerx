/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { Divider } from '@/components-v2/Divider'
import Typography from '@/components-v2/atoms/Typography'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp' // TODO - Replace with new component
import NotificationSending from '@/components/NotificationSending/NotificationSending' // TODO - Replace with new component
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { selectReviewData } from '@/slice/transfer/transfer.selectors'
import { resetTransferSlice, updateReviewData } from '@/slice/transfer/transfer.slice'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import PopupDialog from '../../components/PopupDialogue'
import useExecutePayment from '../../hooks/useExecutePayment'
import { ReviewTable } from './components'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { CurrencyType } from '@/api-v2/payment-api'
import { SourceType } from '@/slice/wallets/wallet-types'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { PaymentFooter } from '../../components'
import useFiatPaymentForm from '../../hooks/useFiatPaymentForm/useFiatPaymentForm'
import useFiatPaymentReviewData from '../../hooks/useReviewFiatPayment'
import Remarks from '../ReviewPayment/components/Remarks'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import usePaymentHandler from '../../hooks/usePaymentHandler'

const ReviewFiatPayment = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const reviewData = useAppSelector(selectReviewData)
  const walletMapById = useAppSelector(selectWalletMapById)
  const selectedChain = useAppSelector(selectedChainSelector)
  const { fiatCurrency } = useAppSelector(orgSettingsSelector)
  const isMultiChainSafeEnabled = useAppSelector((state) => selectFeatureState(state, 'isMultiChainSafeEnabled'))

  const { tokenPriceTotals, sourceCurrency, reviewItems, successModalCopy } = useFiatPaymentReviewData()
  const { deletePayments } = usePaymentHandler()

  const { executePayment } = useExecutePayment()
  const { control, getValues } = useFiatPaymentForm()

  const wallet = walletMapById[reviewData.sourceWalletId]

  const onClickSubmitPayment = async () => {
    setIsSending(true)
    setIsSuccess(false)

    const result = await executePayment({
      sourceWalletId: reviewData.sourceWalletId,
      recipients: reviewData.recipients,
      remarks: getValues('remarks'),
      destinationCurrencyType: CurrencyType.FIAT
    })

    setIsSending(false)
    if (result.isSuccess === true) {
      setIsSuccess(true)
      toast.success('Payment successful')
    } else if (result.isSuccess === false) {
      if (result.error.type === 'WalletActionRejected') {
        toast.error(result.error.message)
      } else {
        toast.error('Sorry, an unexpected error occurred. Please try again later.')
      }
    }
  }

  const onBackStep = async () => {
    await deletePayments({ recipients: reviewData.recipients })

    const _recipients = reviewData.recipients.map((item) => ({
      ...item,
      draftMetadata: item.draftMetadata?.status ? item.draftMetadata : null
    }))
    dispatch(updateReviewData({ recipients: _recipients, sourceWalletId: reviewData.sourceWalletId }))
  }

  const handleAcceptNavigateToPendingTab = () => {
    setIsSuccess(false)
    dispatch(resetTransferSlice())

    if (wallet.sourceType === SourceType.ETH) {
      router.push(`/${organizationId}/transactions`)
    } else {
      router.push(`/${organizationId}/pendingApproval`)
    }
  }

  const handleContinueTransfer = () => {
    setIsSuccess(false)
    dispatch(resetTransferSlice())
    router.push(`/${organizationId}/transfer/fiat?step=create&reset=true`)
  }

  const renderCurrentWalletThreshold = () => {
    let threshold = null
    if (isMultiChainSafeEnabled) {
      // @ts-ignore
      threshold = wallet?.metadata?.find((chain) => selectedChain.id === chain?.blockchainId)?.threshold
    } else {
      // @ts-ignore
      threshold = wallet?.metadata?.threshold
    }

    return threshold
  }

  const successCopy = successModalCopy({
    sourceWalletType: wallet?.sourceType,
    threshold: renderCurrentWalletThreshold()
  })

  return (
    <div className="flex flex-col flex-grow h-full">
      <div className="flex flex-col gap-2 flex-1 overflow-auto pr-4">
        <div className="border p-4 rounded-md flex mb-2 justify-between">
          <Typography styleVariant="semibold">Paying From</Typography>
          <div className="flex flex-row items-center gap-2">
            <Typography styleVariant="semibold">{walletMapById[reviewData.sourceWalletId]?.name}</Typography>
            <WalletAddressCopy address={walletMapById[reviewData.sourceWalletId]?.address} />
            <Image src={selectedChain?.imageUrl} alt="network-image" height={14} width={14} />
          </div>
        </div>
        <div className="border p-4 rounded-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Typography styleVariant="semibold">Paying To</Typography>
            <div className="flex items-center flex-row gap-4">
              <Typography classNames="border-r border-[#F1F1EF] pr-2">
                {reviewData.recipients?.length} Recipient{reviewData.recipients?.length > 1 && 's'}
              </Typography>
              <div className="flex gap-3 border-r border-[#F1F1EF] pr-2" data-tip="asset-grid" data-for="asset-grid">
                {tokenPriceTotals.currencyTotals?.slice(0, 2)?.map((amountObj, _index) => (
                  <div key={_index} className="flex gap-1">
                    <Image src={amountObj.image} width={16} height={16} className="flex-shrink-0" />
                    <Typography variant="body2" styleVariant="semibold">
                      {amountObj?.symbol}
                      {toNearestDecimal(String(amountObj.amount), 'SG', 2)} {amountObj?.code}
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
                    <Typography styleVariant="semibold" classNames="mb-2">
                      Summary
                    </Typography>
                    <div className="flex flex-col" data-tip="asset-grid" data-for="asset-grid">
                      {tokenPriceTotals?.currencyTotals.map((amountObj, _index) => (
                        <div key={_index} className="mb-3">
                          <div className="flex items-center gap-2">
                            <Image src={amountObj.image} width={16} height={16} className="flex-shrink-0" />
                            <Typography variant="body2" styleVariant="semibold">
                              {amountObj?.symbol ?? ''}
                              {toNearestDecimal(String(amountObj?.amount), 'SG', 2) ?? 'N/A'} {amountObj?.code ?? 'N/A'}
                            </Typography>
                          </div>
                          <Typography variant="caption" color="secondary">
                            ~ {toNearestDecimal(String(amountObj?.tokenAmount), 'SG', 2) ?? 'N/A'}{' '}
                            {sourceCurrency?.symbol}
                          </Typography>
                        </div>
                      ))}
                      <div className="">
                        <div className="w-full border-b mb-3" />
                        <div className="flex flex-col gap-1">
                          <Typography variant="caption" color="secondary" classNames="mb-1">
                            Total
                          </Typography>
                          <div className="flex gap-2 items-center ">
                            {sourceCurrency?.image?.small && (
                              <Image
                                src={sourceCurrency?.image?.small}
                                width={14}
                                height={14}
                                className="flex-shrink-0"
                              />
                            )}
                            <Typography styleVariant="semibold">
                              {toNearestDecimal(String(tokenPriceTotals?.totalSourceAmount), 'SG', 2) ?? 'N/A'}{' '}
                              {sourceCurrency?.symbol}
                            </Typography>
                          </div>
                          <Typography variant="caption" color="secondary">
                            {fiatCurrency?.symbol}
                            {toNearestDecimal(String(tokenPriceTotals?.totalFiatPrice), 'SG', 2)} {fiatCurrency?.code}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopupDialog>
              </div>
              <div className="flex items-center gap-1" data-tip="payment-total" data-for="payment-total">
                <Typography variant="body1" styleVariant="semibold">
                  Total:
                </Typography>
                <img src={sourceCurrency?.image?.small} alt="token-img" width={16} />
                <Typography
                  classNames="cursor-pointer"
                  data-tip="payment-total"
                  data-for="payment-total"
                  styleVariant="semibold"
                >
                  {toNearestDecimal(String(tokenPriceTotals?.totalSourceAmount), 'SG', 2)} {sourceCurrency?.symbol} (
                  {fiatCurrency?.symbol}
                  {toNearestDecimal(String(tokenPriceTotals?.totalFiatPrice), 'SG', 2)} {fiatCurrency?.code})
                </Typography>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ReviewTable data={reviewItems} />
          </div>
        </div>
        <Remarks control={control} />
      </div>
      <PaymentFooter
        onClickSubmit={onClickSubmitPayment}
        sourceWalletId={reviewData.sourceWalletId}
        recipients={reviewData.recipients}
        isLoading={isSending}
        step="review"
        currencyType={CurrencyType.FIAT}
        onClickBack={onBackStep}
      />
      <NotificationSending
        showModal={isSending}
        setShowModal={setIsSending}
        title="Sending transfer."
        subTitle="Please wait until the transfer is completed."
      />
      <NotificationPopUp
        type="success"
        width="w-[650px]"
        title={successCopy.title}
        description={successCopy.description}
        option
        setShowModal={setIsSuccess}
        showModal={isSuccess}
        declineText={successCopy.declineText}
        acceptText={successCopy.acceptText}
        onClose={handleAcceptNavigateToPendingTab}
        onAccept={handleContinueTransfer}
      />
    </div>
  )
}

export default ReviewFiatPayment
