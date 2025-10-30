import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { Alert } from '@/components-v2/molecules/Alert'
import useActivateWeb3Provider from '@/hooks-v2/useActivateWeb3Provider'
import MetamaskIcon from '@/public/svg/wallet-icons/metamask-icon.svg'
import WalletConnectIcon from '@/public/svg/wallet-icons/wallet-connect-icon.svg'
import Image from 'next/legacy/image'

const ConnectWallet = ({ ownerAddress }: { ownerAddress: string }) => {
  const { connectMetamaskWallet, connectWalletConnect } = useActivateWeb3Provider()

  return (
    <div className="flex flex-col gap-4">
      <Typography color="primary" styleVariant="semibold" variant="body1">
        Please connect your wallet to proceed.
      </Typography>
      <Alert isVisible variant="warning">
        <Alert.Icon />
        <Alert.Text>
          To ensure a risk-free deployment of this Safe to another chain, it is highly recommended to use the original
          Safe creator wallet {ownerAddress || ''} to pay for the gas fee for this transaction.
        </Alert.Text>
      </Alert>
      <Button
        height={64}
        leadingIcon={<Image src={MetamaskIcon} width={30} height={30} alt="metamaskIcon" />}
        variant="grey"
        classNames="w-full !text-base !font-semibold"
        onClick={connectMetamaskWallet}
        label="Metamask"
      />
      <Button
        height={64}
        leadingIcon={<Image src={WalletConnectIcon} width={30} height={30} alt="walletConnectIcon" />}
        variant="grey"
        classNames="w-full !text-base !font-semibold"
        onClick={connectWalletConnect}
        label="Wallet Connect"
      />
    </div>
  )
}

export default ConnectWallet
