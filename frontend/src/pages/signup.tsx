import { BlankView } from '@/components-v2/templates'
import { SignupPage as Signup } from '@/views/Signup'
import { NextPageWithLayout } from './_app'

const SignupPage: NextPageWithLayout = () => <Signup />

export default SignupPage

SignupPage.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}
