import { BlankView } from '@/components-v2/templates'
import Organization from '@/views/Organization/Organization'
import { NextPageWithLayout } from './_app'

const IndexPage: NextPageWithLayout = () => <Organization />

export default IndexPage

IndexPage.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
