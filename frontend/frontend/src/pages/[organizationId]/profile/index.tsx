import { AuthenticatedView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import ProfilePage from '@/views/ProfileV2/ProfilePage'

const Page: NextPageWithLayout = () => <ProfilePage />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
