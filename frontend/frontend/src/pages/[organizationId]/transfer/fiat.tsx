import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import { TransferFiatPayment } from '@/views/Transfer/FiatPayment'

const Page: NextPageWithLayout = () => <TransferFiatPayment />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
