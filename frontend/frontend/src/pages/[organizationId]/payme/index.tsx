import { NextPageWithLayout } from '@/pages/_app'
import ReceivePayment from '@/views/ReceivePayment/ReceivePayment'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <ReceivePayment />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
