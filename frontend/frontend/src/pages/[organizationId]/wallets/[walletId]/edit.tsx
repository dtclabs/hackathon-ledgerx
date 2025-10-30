import { NextPageWithLayout } from '@/pages/_app'
import EditEOAWallet from '@/views/WalletsV2/EditWallet/EditEOAWallet'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <EditEOAWallet />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
