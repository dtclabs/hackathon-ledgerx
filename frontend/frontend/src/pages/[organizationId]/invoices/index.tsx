import { NextPageWithLayout } from '@/pages/_app'
import { InvoiceListView } from '@/views/Invoices'
import { AuthenticatedView } from '@/components-v2/templates'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

// const Page: NextPageWithLayout = () => {
//   const isDtcEnabled = useAppSelector((state) => selectFeatureState(state, 'isDtcEnabled'))
//   return isDtcEnabled ? <InvoiceListView /> : null
// }
const Page: NextPageWithLayout = () => <InvoiceListView />

export default Page
Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
