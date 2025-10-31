import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import CreateOrganisationContact from '@/views/Recipients/Create/Organisation/CreateOrganisationContact'

const Page: NextPageWithLayout = () => <CreateOrganisationContact />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
