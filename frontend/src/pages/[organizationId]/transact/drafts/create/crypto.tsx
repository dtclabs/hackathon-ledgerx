import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import CreateCryptoPayment from '@/views/CreateDraftPayment/CryptoPayment/CreateCryptoPayment'

const Page: NextPageWithLayout = () => <CreateCryptoPayment />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
