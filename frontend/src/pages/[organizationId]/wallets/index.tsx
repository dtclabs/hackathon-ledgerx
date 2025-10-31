import { AuthenticatedView } from '@/components-v2/templates'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { NextPageWithLayout } from '@/pages/_app'
import WalletSourceOfFunds from '@/views/Wallets/SourceOfFunds'
import WalletV2List from '@/views/WalletsV2/SourceOfFunds'

export const WHITELIST_ENV = ['localhost', 'development', 'staging', 'production'] // TODO: TO DEPRECATE ONCE ALL DEPENDENCIES IN VARIOUS PLACES ARE REMOVED

const Page: NextPageWithLayout = () => (isFeatureEnabledForThisEnv ? <WalletV2List /> : <WalletSourceOfFunds />)

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
