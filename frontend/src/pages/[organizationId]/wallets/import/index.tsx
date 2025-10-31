import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import ImportWallet from '@/views/WalletsV2/ImportWallet'

const Page: NextPageWithLayout = () => <ImportWallet />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
