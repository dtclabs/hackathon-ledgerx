import { NextPageWithLayout } from '../_app'
import DashboardV2 from '@/views/Dashboard-v2'
import MainView from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'

const Page: NextPageWithLayout = () => <DashboardV2 />

export default Page

Page.Layout = function getLayout(page) {
  return <MainView>{page}</MainView>
}
