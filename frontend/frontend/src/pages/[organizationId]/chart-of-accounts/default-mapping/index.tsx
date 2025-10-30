import { NextPageWithLayout } from '@/pages/_app'
import DefaultMappingView from '@/views/ChartOfAccounts/DefaultMapping'
import { AuthenticatedView } from '@/components-v2/templates'

export const WHITELIST_ENV = ['localhost', 'development', 'staging', 'production']

const Page: NextPageWithLayout = () => <DefaultMappingView />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
