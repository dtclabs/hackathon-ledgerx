import { FC } from 'react'

import { useRouter } from 'next/router'
import { useAppSelector } from '@/state'
import { useFormContext } from 'react-hook-form'
import { useOrganizationId } from '@/utils/getOrganizationId'

import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'

import { SourceType } from '@/slice/wallets/wallet-types'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { CurrencyType } from '@/api-v2/payment-api'
import Image from 'next/legacy/image'
import InfoIcon from '@/public/svg/icons/info-icon-circle-black.svg'
import Typography from '@/components-v2/atoms/Typography'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

interface IMakePaymentFooterProps {
  isLoading: boolean
  step: 'create' | 'review'
  sourceWalletId: string
  onClickSubmit: () => void
  recipients: any
  onClickBack?: () => Promise<void>
  currencyType?: CurrencyType
}

const MakePaymentFooter: FC<IMakePaymentFooterProps> = ({
  isLoading = false,
  step,
  recipients,
  sourceWalletId,
  onClickSubmit,
  onClickBack,
  currencyType = CurrencyType.CRYPTO
}) => {
  const router = useRouter()

  const organizationId = useOrganizationId()
  const walletMap = useAppSelector(selectWalletMapById)
  const selectedChain = useAppSelector(selectedChainSelector)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))
  const isMultiChainSafeEnabled = useAppSelector((state) => selectFeatureState(state, 'isMultiChainSafeEnabled'))

  const handleOnClickBackCreate = async () => {
    if (onClickBack) {
      await onClickBack()
    }
    router.push(
      `/${organizationId}/transfer/${
        isOffRampEnabled ? (currencyType === CurrencyType.CRYPTO ? 'crypto' : 'fiat') : ''
      }?step=create`
    )
  }
  const handleOnClickSubmit = () => {
    // setShouldScroll(true)
    onClickSubmit()
  }

  const renderFooterPrimaryLabel = () => {
    const wallet = walletMap[sourceWalletId]

    let threshold = null
    if (isMultiChainSafeEnabled) {
      // @ts-ignore
      threshold = wallet?.metadata?.find((chain) => selectedChain.id === chain?.blockchainId)?.threshold
    } else {
      // @ts-ignore
      threshold = wallet?.metadata?.threshold
    }

    if (wallet) {
      if (
        step === 'review' &&
        (wallet.sourceType === SourceType.ETH || (wallet.sourceType === SourceType.GNOSIS && threshold === 1))
      ) {
        return 'Confirm & Pay'
      }
      if (step === 'review' && wallet.sourceType === SourceType.GNOSIS) {
        return 'Confirm & Queue'
      }
    }
    return 'Next: Review Payment'
  }

  return (
    <div className="flex items-center justify-between gap-10">
      <section id="footer-buttons" className="flex flex-row gap-4 pt-4 bg-white">
        {step === 'review' && <Button onClick={handleOnClickBackCreate} variant="grey" label="Back" height={48} />}
        <Button
          data-tip="disable-make-payment-cta"
          data-for="disable-make-payment-cta"
          variant="black"
          height={48}
          type="submit"
          onClick={handleOnClickSubmit}
          loadingWithLabel={isLoading}
          label={renderFooterPrimaryLabel()}
          disabled={
            isLoading ||
            !sourceWalletId ||
            !recipients.some((recipient) => (recipient?.bankAccount || recipient?.walletAddress) && recipient.amount)
          }
        />
        {(!sourceWalletId ||
          !recipients.some(
            (recipient) => (recipient?.bankAccount || recipient?.walletAddress) && recipient.amount
          )) && (
          <ReactTooltip
            id="disable-make-payment-cta"
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            Please connect a wallet and add a recipient address and amount to proceed
          </ReactTooltip>
        )}
      </section>
      {currencyType === CurrencyType.FIAT && (
        <div className="flex items-center gap-2 pt-4">
          <Image src={InfoIcon} alt="info-icon" />
          <Typography color="secondary">
            Your funds will be sent to the off-ramp provider’s wallet address. Recipients will receive fiat amount
            within 3-5 business days.
          </Typography>
        </div>
      )}
    </div>
  )
}

export default MakePaymentFooter
