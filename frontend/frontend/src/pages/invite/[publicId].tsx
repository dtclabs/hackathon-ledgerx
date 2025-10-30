import { BlankView } from '@/components-v2/templates'
import { NextPageWithLayout } from '@/pages/_app'
import InvitePage from '@/views/Invite/InvitePage'

const Page: NextPageWithLayout = () => <InvitePage />

export default Page

Page.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
