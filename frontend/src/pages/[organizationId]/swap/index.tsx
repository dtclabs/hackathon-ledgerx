import { NextPageWithLayout } from '@/pages/_app'
import CowSwap from '@/views/Swap/SwapView'
import { AuthenticatedView } from '@/components-v2/templates'

const Page: NextPageWithLayout = () => <CowSwap />

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
