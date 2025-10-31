import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import CreateIndividualContact from '@/views/Recipients/Create/Individual/CreateIndividualContact'

const Page: NextPageWithLayout = () => <CreateIndividualContact />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
