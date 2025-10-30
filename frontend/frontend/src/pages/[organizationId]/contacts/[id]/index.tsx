import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useAppSelector } from '@/state'
import ContactDetail from '@/views/Recipients/Detail/ContactDetail'
import RecipientDetailModal from '@/views/Recipients/components/RecipientModal/RecipientDetailModal'

const Page: NextPageWithLayout = () => {
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))
  return isOffRampEnabled ? <ContactDetail /> : <RecipientDetailModal />
}

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
