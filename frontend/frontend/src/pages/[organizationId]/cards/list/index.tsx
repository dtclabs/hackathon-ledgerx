import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useAppSelector } from '@/state'
import CardListPage from '@/views/Cards/List/CardListView'
import { NotFoundPage } from '@/views/NotFound'

const Page: NextPageWithLayout = () => {
  const isCardsEnabled = useAppSelector((state) => selectFeatureState(state, 'isCardsEnabled'))
  return isCardsEnabled ? <CardListPage /> : <NotFoundPage />
}

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
