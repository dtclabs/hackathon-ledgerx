import { BlankView } from '@/components-v2/templates'
import SignIn from '@/views/SignIn/SignInPage'
import { NextPageWithLayout } from './_app'

const Page: NextPageWithLayout = () => <SignIn />
export default Page

Page.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
