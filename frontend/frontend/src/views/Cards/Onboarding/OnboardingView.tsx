import Typography from '@/components-v2/atoms/Typography'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import useStorage from '@/hooks-v2/utility/useStorage'
import { useGetCardOnboardingStepQuery } from '@/slice/cards/cards-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useEffect, useState } from 'react'
import InitialBanner from './components/InitialBanner'
import VerifyBusiness from './components/VerifyBusiness'
import WhitelistWallet from './components/WhitelistWallet'

const CardOnboardingPage = () => {
  const { setItem, getItem } = useStorage('local')
  const organizationId = useOrganizationId()

  const { data: onboardingStep, isLoading } = useGetCardOnboardingStepQuery(
    {
      organizationId
    },
    { skip: !organizationId }
  )

  const [isCardOnboardingAcknowledged, setIsCardOnboardingAcknowledged] = useState(
    getItem('is-card-onboarding-acknowledged')?.[organizationId] ?? false
  )

  useEffect(() => {
    if (organizationId) {
      setIsCardOnboardingAcknowledged(getItem('is-card-onboarding-acknowledged')?.[organizationId] ?? false)
    }
  }, [organizationId])

  const handleStartOnboarding = () => {
    setIsCardOnboardingAcknowledged(true)

    const obj = getItem('is-card-onboarding-acknowledged')
    setItem('is-card-onboarding-acknowledged', {
      ...obj,
      [organizationId]: true
    })
  }

  return (
    <>
      {isCardOnboardingAcknowledged && (
        <Header>
          <Header.Left>
            <Header.Left.Title>Cards</Header.Left.Title>
          </Header.Left>
        </Header>
      )}
      <View.Content>
        {!isCardOnboardingAcknowledged ? (
          <InitialBanner onStartOnboarding={handleStartOnboarding} />
        ) : (
          <div className="w-full bg-grey-200 p-6 rounded-xl">
            <Typography styleVariant="semibold">
              Complete the following steps to get your corporate Visa card.
            </Typography>
            <div className="flex gap-6 mt-6">
              <VerifyBusiness status={onboardingStep?.status} />
              <WhitelistWallet status={onboardingStep?.status} address={onboardingStep?.metadata?.wallet_address} />
            </div>
          </div>
        )}
      </View.Content>
    </>
  )
}
export default CardOnboardingPage
