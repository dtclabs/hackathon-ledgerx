import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import { TransferPage } from '@/views/Transfer/CryptoPayment'

const Page: NextPageWithLayout = () => <TransferPage />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
