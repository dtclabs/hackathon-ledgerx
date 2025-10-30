import { TransactionsV2 } from '@/views/Transactions-v2'
import { NextPageWithLayout } from '../_app'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <TransactionsV2 />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
