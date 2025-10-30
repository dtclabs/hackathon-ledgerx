import { NextPageWithLayout } from '@/pages/_app'
import Recipients from '@/views/Recipients/Recipients'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <Recipients />

export default Page
Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
