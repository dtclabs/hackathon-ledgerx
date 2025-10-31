// import { NextPageWithLayout } from '@/pages/_app'
// import { AuthenticatedView } from '@/components-v2/templates'
// import { SelectPaymentType } from '@/views/Transfer/SelectPaymentType'
// import { useAppSelector } from '@/state'
// import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
// import { TransferPage } from '@/views/Transfer/CryptoPayment'

// const Page: NextPageWithLayout = () => {
//   const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))
//   return isOffRampEnabled ? <SelectPaymentType /> : <TransferPage />
// }

// Page.Layout = function getLayout(page) {
//   return <AuthenticatedView>{page}</AuthenticatedView>
// }

// export default Page

import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import Typography from '@/components-v2/atoms/Typography'

const Page: NextPageWithLayout = () => (
  <div className="bg-white p-6 rounded-lg">
    <Typography variant="heading3">Transfer</Typography>
    <div className="mt-2">
      <Typography color="secondary">Coming soon</Typography>
      <Typography variant="body2" classNames="mt-1">
        We&apos;re preparing the Transfer experience. Please check back later.
      </Typography>
    </div>
  </div>
)

Page.Layout = function getLayout(page) {
  return <View>{page}</View>
}

export default Page
