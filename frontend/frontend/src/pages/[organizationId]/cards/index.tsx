import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'

import { useAppSelector } from '@/state'
import { NotFoundPage } from '@/views/NotFound'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { CardOnboardingPage } from '@/views/Cards/Onboarding'

const Page: NextPageWithLayout = () => {
  const isCardsEnabled = useAppSelector((state) => selectFeatureState(state, 'isCardsEnabled'))
  return isCardsEnabled ? <CardOnboardingPage /> : <NotFoundPage />
}

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
