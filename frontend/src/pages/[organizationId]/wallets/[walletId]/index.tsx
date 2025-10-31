import { AuthenticatedView } from '@/components-v2/templates'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { NextPageWithLayout } from '@/pages/_app'
import WalletDetail from '@/views/Wallets/WalletDetail'
import WalletDetailV2 from '@/views/WalletsV2/WalletDetail'

const Page: NextPageWithLayout = () => (isFeatureEnabledForThisEnv ? <WalletDetailV2 /> : <WalletDetail />)

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
