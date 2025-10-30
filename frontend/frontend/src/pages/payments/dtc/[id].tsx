import { BlankView } from '@/components-v2/templates'
import { DTCPaymentUserView } from '@/views/DTCPaymentUser'
import { NextPageWithLayout } from '@/pages/_app'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

export const WHITELIST_ENV = ['localhost', 'development', 'staging']

const Page: NextPageWithLayout = () => {
  const isDtcEnabled = useAppSelector((state) => selectFeatureState(state, 'isDtcEnabled'))
  return isDtcEnabled ? <DTCPaymentUserView /> : null
}

export default Page
Page.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
