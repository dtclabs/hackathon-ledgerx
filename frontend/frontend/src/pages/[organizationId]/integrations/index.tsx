import { NextPageWithLayout } from '@/pages/_app'
import IntegrationsPage from '@/views/Integrations'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <IntegrationsPage />

export default Page
Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
