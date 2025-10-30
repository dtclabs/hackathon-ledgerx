import { NextPageWithLayout } from '@/pages/_app'
import Categories from '@/views/Categories'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <Categories />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
