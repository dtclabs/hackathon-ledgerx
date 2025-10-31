import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FiatSvg from 'public/svg/icons/crypto-to-fiat.svg'
import { useMemo } from 'react'
import CreateFiatPayment from '../sections/CreateFiatPayment/CreateFiatPayment'
import ReviewFiatPayment from '../sections/ReviewFiatPayment/ReviewFiatPayment'
import { useAppSelector } from '@/state'
import { integrationSelector } from '@/slice/org-integration/org-integration-selector'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { useWhitelistRequestStatusQuery } from '@/api-v2/merge-rootfi-api'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { IntegrationWhitelistRequestStatus, OrgIntegrationStatus } from '@/slice/org-integration/org-integration-slice'

const TransferFiatPayment = () => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const paymentStep = router.query?.step ?? 'create'

  const organizationIntegrations = useAppSelector(integrationSelector)
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)

  const { data: tripleAWhitelistRequestStatus } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.TRIPLE_A
    },
    { skip: !organizationId }
  )

  const breadcrumbItems = [
    { to: `/${organizationId}/transfer`, label: 'Make Payment' },
    { to: `/${organizationId}/transfer/fiat`, label: 'Crypto to Fiat' }
  ]

  const onGetStarted = (e) => {
    e.stopPropagation()
    router.push(`/${organizationId}/integrations`)
  }
  const onClickContactSupport = (e) => {
    e.stopPropagation()
    window.open('https://www.ledgerx.com/contact', '_blank')
  }
  const onClickLearnMore = (e) => {
    e.stopPropagation()
  }
  const renderFiatPayment = useMemo(() => {
    const tripleAIntegrations = organizationIntegrations?.find(
      (integration) => integration.integrationName === IntegrationName.TRIPLE_A
    )
    const onboarding = (
      <div className="relative bg-[#FBFAFA] rounded-lg p-8 w-[800px] h-[430px] flex flex-col justify-between items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Typography variant="heading2" styleVariant="semibold" color="primary" classNames="text-center px-6">
          You are just a step away from unlocking our seamless Crypto to Fiat payment experience!
        </Typography>
        <div className="p-2 w-max flex items-center">
          <Image src={FiatSvg} width={310} height={104} />
        </div>
        <Typography variant="subtitle1" styleVariant="semibold" color="primary" classNames="text-center">
          Connect with Triple-A now and start making Crypto to Fiat payments.
        </Typography>
        <div className="flex items-center justify-center gap-3">
          <Button label="Learn More" variant="grey" height={40} onClick={onClickLearnMore} />
          <Button label="Get Started" variant="black" height={40} onClick={onGetStarted} />
        </div>
      </div>
    )
    const rejected = (
      <div className="relative bg-[#FBFAFA] rounded-lg p-8 w-[800px] h-[430px] flex flex-col justify-between items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Typography variant="heading2" styleVariant="semibold" color="primary" classNames="text-center px-6">
          Sorry, your business verification failed.
        </Typography>
        <div className="p-2 w-max flex items-center">
          <Image src={FiatSvg} width={310} height={104} />
        </div>
        <Typography variant="subtitle1" styleVariant="semibold" color="primary" classNames="text-center">
          Your KYB application has been rejected. If you have any questions, please contact customer support.
        </Typography>
        <div className="flex items-center justify-center gap-3">
          <Button label="Contact Support" variant="black" height={40} onClick={onClickContactSupport} />
        </div>
      </div>
    )
    const pending = (
      <div className="relative bg-[#FBFAFA] rounded-lg p-8 w-[800px] h-[430px] flex flex-col justify-between items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Typography variant="heading2" styleVariant="semibold" color="primary" classNames="text-center px-6">
          You are just a step away from unlocking our seamless Crypto to Fiat payment experience!
        </Typography>
        <div className="p-2 w-max flex items-center">
          <Image src={FiatSvg} width={310} height={104} />
        </div>
        <Typography variant="subtitle1" styleVariant="semibold" color="primary" classNames="text-center">
          Your application has been received and is being processed. This usually takes 3-4 business days. If you have
          any questions, please contact customer support.
        </Typography>
        <div className="flex items-center justify-center gap-3">
          <Button label="Learn More" variant="grey" height={40} onClick={onClickLearnMore} />
          <Button label="Contact Support" variant="black" height={40} onClick={onClickContactSupport} />
        </div>
      </div>
    )

    if (!subscriptionPlan?.organizationIntegrationAddOns?.triple_a) {
      return onboarding
    }

    if (tripleAIntegrations?.status) {
      switch (tripleAIntegrations?.status) {
        case OrgIntegrationStatus.COMPLETED:
          return paymentStep === 'create' ? <CreateFiatPayment /> : <ReviewFiatPayment />

        default:
          return onboarding
      }
    }

    switch (tripleAWhitelistRequestStatus?.status) {
      case IntegrationWhitelistRequestStatus.REQUESTED:
        return pending
      case IntegrationWhitelistRequestStatus.REJECTED:
        return rejected
      default:
        return onboarding
    }
  }, [tripleAWhitelistRequestStatus, organizationIntegrations, subscriptionPlan, paymentStep])

  return (
    <>
      <Header>
        <div className="flex items-center">
          <Button
            variant="ghost"
            height={24}
            classNames="!h-[30px] p-[0.5rem]"
            leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
            onClick={() => router.back()}
          />
          <Breadcrumb>
            {breadcrumbItems.map(({ to, label }) => (
              <Link key={to} href={to} legacyBehavior>
                {label}
              </Link>
            ))}
          </Breadcrumb>
        </div>
      </Header>
      <View.Content>{renderFiatPayment}</View.Content>
    </>
  )
}
export default TransferFiatPayment
