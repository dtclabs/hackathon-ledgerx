import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import { AccountPage } from '@/views/Account'

const Page: NextPageWithLayout = () => <AccountPage />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
