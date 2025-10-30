import { FC } from 'react'
import Image from 'next/legacy/image'
import SelectDropdown from '@/components-v2/Select/Select'
import Typography from '@/components-v2/atoms/Typography'
import useActivateWeb3Provider from '@/hooks-v2/useActivateWeb3Provider'
import MetamaskIcon from '@/public/svg/wallet-icons/metamask-icon.svg'
import WalletConnectIcon from '@/public/svg/wallet-icons/wallet-connect-icon.svg'

interface IConnectWalletButton {
  isDisabled?: boolean
}

const options = [
  {
    label: 'Select a wallet to Connect',
    value: '',
    disabled: true
  },
  {
    label: (
      <Typography variant="body1" classNames="flex items-center py-2">
        <span className="pr-5">
          <Image src={MetamaskIcon} alt="metamask icon" height={20} />
        </span>
        MetaMask
      </Typography>
    ),
    value: 'metamask'
  },
  {
    label: (
      <Typography variant="body1" classNames="flex items-center py-2">
        <span className="pr-5">
          <Image src={WalletConnectIcon} alt="WalletConnect icon" height={20} />
        </span>
        WalletConnect
      </Typography>
    ),
    value: 'walletConnect'
  }
]

const ConnectWalletButton: FC<IConnectWalletButton> = ({ isDisabled }) => {
  const { connectMetamaskWallet, connectWalletConnect } = useActivateWeb3Provider()

  const handleChangeSelection = (e) => {
    if (e.value === 'metamask') {
      connectMetamaskWallet()
      return
    }
    connectWalletConnect()
  }

  return (
    <SelectDropdown
      placeholder={<Typography variant="body1">Connect Wallet</Typography>}
      options={options}
      disableIndicator
      name="select wallet"
      className="w-[300px] z-20"
      closeMenuOnSelect
      onChange={handleChangeSelection}
      disabled={isDisabled}
    />
  )
}

export default ConnectWalletButton
