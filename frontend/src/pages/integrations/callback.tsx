import { BlankView } from '@/components-v2/templates'
import IntegrationsCallback from '@/views/IntegrationsCallback'
import { NextPageWithLayout } from '../_app'

const IntegrationsPage: NextPageWithLayout = () => <IntegrationsCallback />

export default IntegrationsPage

IntegrationsPage.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
