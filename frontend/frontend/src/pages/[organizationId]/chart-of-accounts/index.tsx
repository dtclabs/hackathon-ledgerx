import { NextPageWithLayout } from '@/pages/_app'
import ChartOfAccountsListView from '@/views/ChartOfAccounts/List'
import { AuthenticatedView } from '@/components-v2/templates'

export const WHITELIST_ENV = ['localhost', 'development', 'staging', 'production']
const Page: NextPageWithLayout = () => <ChartOfAccountsListView />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
