import { NextPageWithLayout } from '@/pages/_app'
import ImportEOAWallet from '@/views/Wallets/ImportWallet/ImportEOAWallet'
import ImportEOAWalletV2 from '@/views/WalletsV2/ImportWallet/ImportEOAWallet'
import { AuthenticatedView } from '@/components-v2/templates'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'

const Page: NextPageWithLayout = () => (isFeatureEnabledForThisEnv ? <ImportEOAWalletV2 /> : <ImportEOAWallet />)

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
