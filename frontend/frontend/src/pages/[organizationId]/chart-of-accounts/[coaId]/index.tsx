import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import ChartOfAccountDetail from '@/views/ChartOfAccounts/Detail'

const Page: NextPageWithLayout = (props) => <ChartOfAccountDetail {...props} />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
