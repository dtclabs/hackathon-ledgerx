import { BlankView } from '@/components-v2/templates'
import Forbiden from '@/views/Forbiden/Forbiden'
import { NextPageWithLayout } from './_app'

const IndexPage: NextPageWithLayout = () => <Forbiden />

export default IndexPage

IndexPage.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
