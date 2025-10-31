import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Badge from '@/components-v2/molecules/Badge/Badge2'
import VerifiedIcon from '@/public/svg/icons/check-verified-icon.svg'
import { CardOnboardingStatus } from '@/slice/cards/cards-type'
import Image from 'next/image'
import React, { useMemo } from 'react'
import useBlockpassSDK from '@/hooks-v2/onboarding/useBlockpassSDK'

const VerifyBusiness: React.FC<{ status: CardOnboardingStatus }> = ({ status }) => {
  const { startBlockpassKYC, isLoading } = useBlockpassSDK()
  const onStart = () => startBlockpassKYC()

  const handler = useMemo(() => {
    switch (status) {
      case CardOnboardingStatus.APPROVED:
        return {
          status: 'Completed',
          color: 'success',
          description: 'Your business has been verified successfully.',
          ctaLabel: 'Completed',
          ctaAction: onStart
        }
      case CardOnboardingStatus.REJECTED:
        return {
          status: 'Rejected',
          color: 'error',
          description: 'Your KYB verification has been rejected. Contact support for more information.',
          ctaLabel: 'Contact Support',
          ctaAction: onStart
        }
      case CardOnboardingStatus.INCOMPLETE:
        return {
          status: 'In Progress',
          color: 'orange',
          description:
            'Your KYB verification form is partially completed. Resume the KYB verification and submit for review.',
          ctaLabel: 'Resume KYB',
          ctaAction: onStart
        }
      case CardOnboardingStatus.INREVIEW:
        return {
          status: 'In Review',
          color: 'orange',
          description: 'Your KYB verification is submitted and is under review. This usually takes 3-5 working days.',
          ctaLabel: 'In Review'
        }
      case CardOnboardingStatus.BLOCKED:
        return {
          status: 'Action Required',
          color: 'error',
          description: 'Please provide requested documents to complete your KYB verification.',
          ctaLabel: 'Upload Documents'
        }
      default:
        return {
          status: 'Not Started',
          description: 'Verify your business in a few simple steps.',
          ctaLabel: 'Start KYB',
          ctaAction: onStart
        }
    }
  }, [status])

  return (
    <div className="bg-white rounded-lg w-[420px] h-[240px] px-8 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-between bg-[#FDF77D] p-[10px] rounded-full">
            <Image src={VerifiedIcon} alt="icon" width={20} height={20} />
          </div>
          <Typography variant="heading3">Verify Business</Typography>
        </div>

        <Badge variant="rounded" color={handler?.color as any}>
          <Badge.Label>{handler.status}</Badge.Label>
        </Badge>
      </div>
      <Typography variant="body2" color="secondary" classNames="flex-1">
        {handler.description}
      </Typography>

      <div className="border-b w-full" />

      <Button
        height={40}
        id="blockpass-kyc-connect"
        label={handler.ctaLabel}
        onClick={handler?.ctaAction}
        disabled={!handler?.ctaAction || isLoading}
        variant="black"
        classNames="w-fit"
      />
    </div>
  )
}

export default VerifyBusiness
