/* eslint-disable react/no-unescaped-entities */
import { Button } from '@/components-v2'
import Modal from '@/components/Modal'
import React from 'react'
import Image from 'next/legacy/image'
import { useAppDispatch } from '@/state'
import Welcome from '@/public/svg/icons/welcome-icon.svg'
import { setShowBanner } from '@/slice/platform/platform-slice'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { format } from 'date-fns'
import { getUTCDate } from '@/utils/getUTCDate'
import Typography from '@/components-v2/atoms/Typography'

interface IOnboardingModal {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  expiryDate: any
}

const OnboardingModal: React.FC<IOnboardingModal> = ({ setShowModal, showModal, expiryDate }) => {
  const dispatch = useAppDispatch()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="bg-white font-inter rounded-3xl px-[60px] flex flex-col items-center justify-center max-w-[580px]">
        <div className="pt-[72px] pb-8 flex flex-col items-center justify-center">
          <Image src={Welcome} />

          <Typography classNames="my-4" variant="heading2" color="dark">
            Unlimited Access to ledgerx.com!
          </Typography>
          <Typography variant="body2" classNames="text-center mb-4" color="secondary">
            You're early and have unlimited access until{' '}
            {expiryDate ? format(getUTCDate(expiryDate), 'do LLLL yyyy') : ''}!
          </Typography>
          <Typography variant="body2" classNames="text-center mb-4" color="secondary">
            We will be introducing our paid offerings which will be even more powerful for those who need them. Thank
            you for your support and we look forward to hearing your feedback.
          </Typography>
          <Typography variant="body2" classNames="text-center mb-4" color="secondary">
            Until then, happy accounting!
          </Typography>
        </div>
        <Button
          onClick={() => {
            setShowModal(false)
            dispatch(setShowBanner(false))
            triggerSendAnalysis({
              eventType: 'CLICK',
              metadata: {
                action: 'promo_modal_cta'
              }
            })
          }}
          size="xl"
          className="w-[140px] mb-12"
        >
          Let’s Go
        </Button>
      </div>
    </Modal>
  )
}

export default OnboardingModal
