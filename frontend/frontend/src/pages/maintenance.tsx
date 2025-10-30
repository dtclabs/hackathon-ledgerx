import { NextPageWithLayout } from '@/pages/_app'
import { MaintenancePage } from '@/views/Maintenance'

const Page: NextPageWithLayout = () => <MaintenancePage />

export default Page

Page.Layout = function getLayout(page) {
  return page
}
