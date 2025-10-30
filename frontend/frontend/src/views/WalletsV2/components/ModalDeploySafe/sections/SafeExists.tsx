import Typography from '@/components-v2/atoms/Typography'
import { FC } from 'react'
import { useAppSelector } from '@/state'
import { selectChainByNameMap } from '@/slice/chains/chain-selectors'
import AlertBanner from '@/components-v2/molecules/Alert/Alert'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { useSystemContact } from '@/hooks-v2/useSystemContact'

interface ISafeExistsProps {
  safeInfo: any
  targetNetwork: string
}

const SafeExisits: FC<ISafeExistsProps> = ({ safeInfo, targetNetwork }) => {
  const targetChain = useAppSelector(selectChainByNameMap)[targetNetwork]
  const { systemContacts } = useSystemContact()

  return (
    <div className="flex flex-col gap-4">
      <AlertBanner isVisible variant="warning">
        <AlertBanner.Icon />
        <AlertBanner.Text>
          This safe has been found on {targetChain?.name} with the following details. You can proceed to import the
          Safe to HQ directly.
        </AlertBanner.Text>
      </AlertBanner>
      <Typography classNames="mb-3">
        <strong>Safe Address:</strong> {safeInfo.address}
      </Typography>
      <Typography classNames="mb-3">
        <strong>Chain:</strong> {targetChain?.name}
      </Typography>
      <Typography classNames="mb-3">
        <strong>Nonce:</strong> {safeInfo?.nonce}
      </Typography>
      <Typography classNames="mb-3">
        <strong>Threshold:</strong> {safeInfo?.threshold}
      </Typography>
      <Typography classNames="mb-3">
        <strong>Owners:</strong>
      </Typography>
      <div className="max-h-[180px] overflow-auto">
        {safeInfo.owners &&
          safeInfo.owners.map((owner, index) => {
            const ownerContact = systemContacts?.find(
              (contact) => contact.address.toLowerCase() === owner?.toLowerCase()
            )
            return (
              <div key={owner} className="bg-gray-50 rounded-lg p-4 mb-3 flex items-center gap-3">
                <Typography classNames="max-w-[180px] truncate">{ownerContact?.name || 'Unknown'}</Typography>
                <WalletAddress split={0} address={owner}>
                  <WalletAddress.Link address={owner} isMultiple={false} blockExplorer={targetChain?.blockExplorer} />
                  <WalletAddress.Copy address={owner} />
                </WalletAddress>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default SafeExisits
