import { NextPageWithLayout } from '@/pages/_app'
import EditSafeWallet from '@/views/WalletsV2/EditWallet/EditSafeWallet'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <EditSafeWallet />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
