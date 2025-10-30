import { AuthenticatedView } from '@/components-v2/templates'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { NextPageWithLayout } from '@/pages/_app'
import ImportSafe from '@/views/Wallets/ImportWallet/ImportSafe'
import ImportSafeV2 from '@/views/WalletsV2/ImportWallet/ImportSafe'

const Page: NextPageWithLayout = () => (isFeatureEnabledForThisEnv ? <ImportSafeV2 /> : <ImportSafe />)

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
