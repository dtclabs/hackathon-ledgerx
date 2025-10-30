import { NextPageWithLayout } from '@/pages/_app'
import TaxLots from '@/views/Assets/components/TaxLots'
import TaxLotsV2 from '@/views/Assets-v2/components/TaxLots'
import { AuthenticatedView } from '@/components-v2/templates'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'

const Page: NextPageWithLayout = () => (isFeatureEnabledForThisEnv ? <TaxLotsV2 /> : <TaxLots />)

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
