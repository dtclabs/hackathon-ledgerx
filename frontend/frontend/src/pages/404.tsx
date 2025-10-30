import { BlankView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import { NotFoundPage } from '@/views/NotFound'

const Page: NextPageWithLayout = () => <NotFoundPage />

export default Page

Page.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
