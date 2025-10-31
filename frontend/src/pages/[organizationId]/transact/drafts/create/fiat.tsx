import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import CreateFiatPayment from '@/views/CreateDraftPayment/FiatPayment/CreateFiatPayment'

const Page: NextPageWithLayout = () => <CreateFiatPayment />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
