import { NextPageWithLayout } from '@/pages/_app'
import { InvoiceCreateView } from '@/views/Invoices'
import { AuthenticatedView } from '@/components-v2/templates'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

// const Page: NextPageWithLayout = () => {
//   const isDtcEnabled = useAppSelector((state) => selectFeatureState(state, 'isDtcEnabled'))
//   return isDtcEnabled ? <InvoiceCreateView /> : null
// }
const Page: NextPageWithLayout = () => <InvoiceCreateView />

export default Page
Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
