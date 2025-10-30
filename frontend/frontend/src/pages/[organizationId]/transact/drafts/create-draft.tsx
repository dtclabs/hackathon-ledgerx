import { NextPageWithLayout } from '@/pages/_app'
import CreateDraftPayment from '@/views/CreateDraftPayment'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <CreateDraftPayment />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
