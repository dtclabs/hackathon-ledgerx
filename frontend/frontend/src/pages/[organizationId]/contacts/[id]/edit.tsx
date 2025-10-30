import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import EditContact from '@/views/Recipients/Edit/EditContact'

const Page: NextPageWithLayout = () => <EditContact />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
