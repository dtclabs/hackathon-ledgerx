import { Alert } from '@/components/Alert'
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import WalletAddressActionButtons from '@/components-v2/molecules/WalletAddressActionButtons'
import AddToContactsButton from '@/components-v2/molecules/AddToContactsButton'
import Image from 'next/legacy/image'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'

interface IAddSafeReview {
  safeInfo?: SafeInfoResponse
  safeError?: string
  organizationContacts: Map<any, any>
  supportedBlockchains: any
  supportedChainsOnPlatform: any
}

const AddSafeReview: React.FC<IAddSafeReview> = ({
  safeInfo,
  safeError,
  organizationContacts,
  supportedBlockchains,
  supportedChainsOnPlatform
}) => (
  /* eslint-disable react/jsx-no-useless-fragment */
  <>
    {safeError ? (
      <Alert variant="danger" className="mt-5 leading-6 font-medium py-3" fontSize="text-base">
        {safeError}
      </Alert>
    ) : safeInfo ? (
      <div className="w-full">
        <p className="text-sm text-neutral-900 pb-4 font-medium">Safe address</p>
        <div className="flex">
          <WalletAddress split={0} address={safeInfo.address} variant="body2" color="primary">
            <WalletAddress.Link
              address={safeInfo.address}
              options={supportedChainsOnPlatform.filter((chain) => chain.id === supportedBlockchains?.id)}
            />
            <WalletAddress.Copy address={safeInfo.address} />
          </WalletAddress>
        </div>
        <p className="text-sm text-neutral-900 pb-4 font-medium mt-8">Chain</p>
        <div className="flex gap-2">
          <Image src={supportedBlockchains.imageUrl} width={18} height={18} className="rounded" />
          <Typography variant="body2">{supportedBlockchains.name}</Typography>
        </div>

        <p className="text-sm text-neutral-900 pb-4 font-medium mt-8">Approval Threshold</p>
        <p className="text-dashboard-main font-medium">{safeInfo.threshold}</p>
        <p className="text-sm text-neutral-900 pb-4 font-medium mt-8">Safe Owners ({safeInfo.owners.length})</p>
        <div>
          {safeInfo.owners &&
            safeInfo.owners.map((owner, index) => {
              const addressExistsInContacts = !!organizationContacts.get(owner)
              return (
                <div key={owner} className="bg-gray-50 rounded-lg p-4 mb-3 grid grid-cols-3 items-center">
                  <Typography variant="body2">
                    {addressExistsInContacts
                      ? `${index + 1}. ${organizationContacts.get(owner)}`
                      : `${index + 1}. Unknown Address`}
                  </Typography>
                  <div className="flex">
                    <Typography variant="body2">{owner}</Typography>
                  </div>
                  {!addressExistsInContacts && (
                    <div className="w-[fit-content] justify-self-end">
                      <AddToContactsButton addressToAdd={owner} />
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    ) : (
      <div className="h-full w-full flex justify-center items-center flex-col bg-white ">
        <div className="flex gap-6 mt-6">
          <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
          <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
          <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        </div>
      </div>
    )}
  </>
)

export default AddSafeReview
