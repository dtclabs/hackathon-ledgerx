import Typography from '@/components-v2/atoms/Typography'
import { toShort } from '@/utils/toShort'
import Image from 'next/legacy/image'
import { FC, ReactNode } from 'react'
import metamaskLogo from '@/public/svg/HeaderMetamask.svg'
import WalletConnectIcon from '@/public/svg/wallet-icons/wallet-connect-icon.svg'
import { useWeb3React } from '@web3-react/core'

interface IDisconnectWalletChipProps {
  isDisabled?: boolean
}

const DisconnectWalletChip: FC<IDisconnectWalletChipProps> = ({ isDisabled }) => {
  const { account, deactivate, library } = useWeb3React()

  const handleDisconnect = () => {
    deactivate()
  }

  return (
    <div className="border rounded flex p-2 items-center">
      <div className="flex items-center border-r pr-2 gap-2">
        <Image src={library?.provider?.isMetaMask ? metamaskLogo : WalletConnectIcon} width={20} height={20} />
        <Typography variant="caption" color="primary" styleVariant="semibold">
          Connected Wallet:
        </Typography>
        <Typography variant="caption" color="secondary">
          {toShort(account, 5, 4)}
        </Typography>
      </div>
      <button
        className="text-error-500 font-bold border-none text-xs pl-2"
        type="button"
        onClick={handleDisconnect}
        disabled={isDisabled}
      >
        Disconnect
      </button>
    </div>
  )
}

export default DisconnectWalletChip
