import { NextPageWithLayout } from '@/pages/_app'
import { AuthenticatedView } from '@/components-v2/templates'
import { NFTPage } from '@/views/NFT'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import NftWaitList from '@/views/NFT/NftWaitList'

const Page: NextPageWithLayout = () => {
  const isNftEnabled = useAppSelector((state) => selectFeatureState(state, 'isNftEnabled'))
  return isNftEnabled ? <NFTPage /> : <NftWaitList />
}

export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
