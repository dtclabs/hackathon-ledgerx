// import { NextPageWithLayout } from '@/pages/_app'
// import { DraftTransactionListPage } from '@/views/Transact/DraftList'
// import { AuthenticatedView } from '@/components-v2/templates'
// import { useAppSelector } from '@/state'
// import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

// const Page: NextPageWithLayout = () => {
//   const isDraftTransactionsEnabled = useAppSelector((state) => selectFeatureState(state, 'isDraftTransactionsEnabled'))
//   return isDraftTransactionsEnabled ? <DraftTransactionListPage /> : null
// }

// export default Page
// Page.Layout = function getLayout(page) {
//   return <AuthenticatedView>{page}</AuthenticatedView>
// }

import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import Typography from '@/components-v2/atoms/Typography'

const Page: NextPageWithLayout = () => (
  <div className="bg-white p-6 rounded-lg">
    <Typography variant="heading3">Drafts</Typography>
    <div className="mt-2">
      <Typography color="secondary">Coming soon</Typography>
      <Typography variant="body2" classNames="mt-1">
        We&apos;re preparing the Drafts experience. Please check back later.
      </Typography>
    </div>
  </div>
)

export default Page

Page.Layout = function getLayout(page) {
  return <View>{page}</View>
}
