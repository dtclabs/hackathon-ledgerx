/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
import { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

import { useAppSelector, useAppDispatch } from '@/state'
import Typography from '@/components-v2/atoms/Typography'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { selectReviewData } from '@/slice/transfer/transfer.selectors'
import { resetTransferSlice } from '@/slice/transfer/transfer.slice'
import PopupDialog from '../../components/PopupDialogue'
import { ReviewTable } from './components'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { Divider } from '@/components-v2/Divider'
import usePaymentReviewData from '../../hooks/useReviewPayment'
import useExecutePayment from '../../hooks/useExecutePayment'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp' // TODO - Replace with new component
import NotificationSending from '@/components/NotificationSending/NotificationSending' // TODO - Replace with new component

import { PaymentFooter } from '../../components'
import { SourceType } from '@/slice/wallets/wallet-types'
import Remarks from './components/Remarks'
import { usePaymentForm } from '../../hooks/usePaymentForm'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

const ReviewPayment = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const [isSending, setIsSending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const reviewData = useAppSelector(selectReviewData)
  const walletMapById = useAppSelector(selectWalletMapById)
  const selectedChain = useAppSelector(selectedChainSelector)
  const { fiatCurrency } = useAppSelector(orgSettingsSelector)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))
  const { tokenPriceTotals, reviewItems, successModalCopy } = usePaymentReviewData()
  const { executePayment } = useExecutePayment()
  const { control, getValues } = usePaymentForm()
  const isMultiChainSafeEnabled = useAppSelector((state) => selectFeatureState(state, 'isMultiChainSafeEnabled'))

  const wallet = walletMapById[reviewData.sourceWalletId]

  const onClickSubmitPayment = async () => {
    setIsSending(true)
    setIsSuccess(false)
    const result = await executePayment({
      sourceWalletId: reviewData.sourceWalletId,
      recipients: reviewData.recipients,
      remarks: getValues('remarks')
    })
    setIsSending(false)
    if (result.isSuccess === true) {
      setIsSuccess(true)
      toast.success('Payment successful')
    } else if (result.isSuccess === false) {
      if (result.error.type === 'WalletActionRejected') {
        toast.error(result.error.message)
      } else {
        console.log('ERROR IN REVIEW PAYMENT', result.error)
        toast.error('Sorry, an unexpected error occurred. Please try again later.')
      }
    }
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
    router.push(`/${organizationId}/transfer${isOffRampEnabled ? '/crypto' : ''}?step=create&reset=true`)
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
                {tokenPriceTotals.tokenTotals?.slice(0, 2)?.map((amountObj, _index) => (
                  <div key={_index} className="flex gap-1">
                    <Image src={amountObj.image} width={16} height={16} className="flex-shrink-0" />
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
                    <div className="flex flex-col" data-tip="asset-grid" data-for="asset-grid">
                      {tokenPriceTotals?.tokenTotals.map((amountObj, _index) => (
                        <div key={_index} className="mb-3">
                          <div className="flex gap-2 items-center ">
                            <Typography variant="body2" classNames="-ml-1" styleVariant="semibold">
                              {amountObj?.amount ?? 'N/A'}
                            </Typography>
                            <Typography variant="body2" styleVariant="semibold">
                              {amountObj?.symbol ?? 'N/A'}
                            </Typography>
                          </div>
                          <Typography variant="caption" color="secondary">
                            ~ {fiatCurrency?.symbol}
                            {parseFloat(amountObj?.tokenPrice) * amountObj.amount ?? 'N/A'} {fiatCurrency?.code}
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
                            {tokenPriceTotals?.paymentTotal?.toFixed(2) ?? 'N/A'} {fiatCurrency?.code}
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
                {tokenPriceTotals?.paymentTotal?.toFixed(2)} {fiatCurrency?.code}
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
                {tokenPriceTotals?.paymentTotal}
              </ReactTooltip>
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

export default ReviewPayment
