import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import OrganisationSettings from '@/views/OrgSettings'

const Page: NextPageWithLayout = () => <OrganisationSettings />

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}

export default Page
