/* eslint-disable react/no-array-index-key */
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import { isRejected } from '@reduxjs/toolkit'
import { StatusPendingLabel, StatusRejectedLabel, StatusSuccessLabel } from '../Label/Label'
import { IConfirmation } from '@/slice/old-tx/interface'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { IChain } from '@/slice/platform/platform-slice'

export interface ISignersModal {
  signers: IConfirmation[]
  listOwner: any
  isExecuted: boolean
  isRejectedTransaction?: boolean
  selectedChain: IChain
}

const SignersModal: React.FC<ISignersModal> = ({
  signers,
  listOwner,
  isExecuted,
  isRejectedTransaction,
  selectedChain
}) => (
  <div className="rounded-lg border border-dashboard-border-200 font-inter">
    <div className="rounded-lg flex items-center justify-between py-4 pl-4 pr-7 bg-gray-50 font-medium text-xs text-dashboard-sub">
      <div>Signers</div>
      <div>Status</div>
    </div>

    {listOwner &&
      listOwner.owners.map((owner, index) => (
        <div
          key={index}
          className={`last-of-type:rounded-b-lg flex items-center justify-between p-4 ${
            index % 2 !== 0 ? 'bg-gray-50' : ''
          }`}
        >
          <div className="flex gap-2">
            <WalletAddressV2
              address={owner}
              noColor
              noCopy
              noScan
              sizeAvatar={24}
              showFirst={5}
              showLast={4}
              scanType="address"
              addressClassName="w-fit"
              addressWidth="w-fit"
            />
            <WalletAddress.Link address={owner} isMultiple={false} blockExplorer={selectedChain.blockExplorer} />
            <WalletAddress.Copy address={owner} />
          </div>
          {signers.find((item) => item.owner === owner) ? (
            isRejectedTransaction ? (
              <StatusRejectedLabel nobg status="Rejected" />
            ) : (
              <StatusSuccessLabel status="Confirmed" />
            )
          ) : !isExecuted ? (
            <StatusSuccessLabel pending status="Pending" />
          ) : (
            ''
          )}
        </div>
      ))}
  </div>
)
export default SignersModal
