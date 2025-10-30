import { NextPageWithLayout } from '@/pages/_app'
import Assets from '@/views/Assets'
import { AuthenticatedView } from '@/components-v2/templates'
import AssetsV2 from '@/views/Assets-v2'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'

const Page: NextPageWithLayout = () => (isFeatureEnabledForThisEnv ? <AssetsV2 /> : <Assets />)

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
