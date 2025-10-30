import { NextPageWithLayout } from '../_app'
import { AuthenticatedView } from '@/components-v2/templates'
import { PendingApprovalLegacy } from '@/views/_deprecated/PendingApproval'
import { PendingApprovalView as PendingApprovalPage } from '@/views/PendingApproval'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

const Page: NextPageWithLayout = () => {
  const isBatchExecuteEnabled = useAppSelector((state) => selectFeatureState(state, 'isBatchExecuteEnabled'))
  return isBatchExecuteEnabled ? <PendingApprovalPage /> : <PendingApprovalLegacy />
}
export default Page

Page.Layout = function getLayout(page) {
  return <AuthenticatedView>{page}</AuthenticatedView>
}
