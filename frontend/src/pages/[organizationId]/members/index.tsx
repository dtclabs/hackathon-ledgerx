import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import MembersPage from '@/views/Members/MembersPage'

const Page: NextPageWithLayout = (props) => <MembersPage {...props} />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
