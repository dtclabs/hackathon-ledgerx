import { FC } from 'react'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { IRecipientAddress } from '@/slice/contacts/contacts.types'
import Typography from '@/components-v2/atoms/Typography'
import { useAppSelector } from '@/state'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'

interface IDisplayContactDetailsProps {
  recipientAddresses: IRecipientAddress[]
}

const DisplayContactDetails: FC<IDisplayContactDetailsProps> = ({ recipientAddresses }) => {
  const supportedChains = useAppSelector(supportedChainsSelector)

  if (recipientAddresses.length === 1) {
    return (
      <div className="mt-1">
        <WalletAddressCopy address={recipientAddresses[0].address} variant="caption">
          <WalletAddressCopy.Link
            address={recipientAddresses[0].address}
            isMultiple={false}
            linkType="address"
            blockExplorer={
              supportedChains?.find((_chain) => _chain.id === recipientAddresses[0].blockchainId)?.blockExplorer
            }
          />
          <WalletAddressCopy.Copy address={recipientAddresses[0].address} />
        </WalletAddressCopy>
      </div>
    )
  }

  return (
    <Tooltip
      shortText={
        <Typography variant="caption" color="secondary" classNames="mt-1">
          {recipientAddresses.length} Addresses
        </Typography>
      }
      text={recipientAddresses.map((address) => (
        <div className="m-2">
          <WalletAddressCopy address={address.address}>
            <WalletAddressCopy.Link
              address={address.address}
              isMultiple={false}
              linkType="address"
              blockExplorer={supportedChains?.find((_chain) => _chain.id === address.blockchainId)?.blockExplorer}
            />
            <WalletAddressCopy.Copy address={address.address} />
          </WalletAddressCopy>
        </div>
      ))}
      position={ETooltipPosition.BOTTOM}
    />
  )
}
export default DisplayContactDetails
