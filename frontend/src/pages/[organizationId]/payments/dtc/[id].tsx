import { BlankView } from '@/components-v2/templates'
import { DTCPaymentUserView } from '@/views/DTCPaymentUser'
import { NextPageWithLayout } from '@/pages/_app'

export const WHITELIST_ENV = ['localhost', 'development', 'staging']

const Page: NextPageWithLayout = () =>
  WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT) ? <DTCPaymentUserView /> : null

export default Page
Page.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
