import { FC } from 'react'

import AlertBanner from '@/components-v2/molecules/Alert/Alert'
import Typography from '@/components-v2/atoms/Typography'

interface IDeploySafeProps {
  targetChainName: string
  connectedAccountOriginalOwner: string
}

const DeploySafe: FC<IDeploySafeProps> = ({ connectedAccountOriginalOwner, targetChainName }) => (
  <>
    <Typography>
      You are about to duplicate your Gnosis Safe smart contract to <strong>{targetChainName}</strong>. Please review
      the following before proceeding.
    </Typography>
    <div className="mt-4 flex flex-col gap-4">
      <Typography classNames=" mb-3">
        <strong>Exact Duplication:</strong> The duplicate will match your Safe at the time of its creation, excluding
        any subsequent changes.
      </Typography>
      <Typography classNames=" mb-3">
        <strong>Signer Differences:</strong> Changes to signers made after creation will not be reflected in the new
        Safe.
      </Typography>
      <Typography classNames=" mb-3">
        <strong>Potential Incompatibilities:</strong> The duplication process may fail due to blockchain
        incompatibilities.
      </Typography>
      <AlertBanner isVisible={!!connectedAccountOriginalOwner} variant="warning">
        <AlertBanner.Icon />
        <AlertBanner.Text>
          The connected wallet is not the original Safe creator. Please be aware that there may be some unexpected
          behaviour on the Safe UI if you proceed with this wallet.
          <br />
          <br />
          <strong>
            To ensure smooth deployment of the Safe, we recommend that you connect to the original Safe creator wallet{' '}
            {connectedAccountOriginalOwner}.
          </strong>
        </AlertBanner.Text>
      </AlertBanner>
    </div>
  </>
)

export default DeploySafe
