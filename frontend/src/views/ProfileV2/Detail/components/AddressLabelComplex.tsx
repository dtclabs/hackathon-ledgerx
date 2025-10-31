import { FC } from 'react'
import Image from 'next/legacy/image'
import EthSymbol from '@/assets/svg/ETH.svg'
import { Button } from '@/components-v2/Button'
import CopyIcon from '@/assets/svg/copy.svg'
import LinkIcon from '@/public/svg/external-link.svg'
import { toast } from 'react-toastify'
import Typography from '@/components-v2/atoms/Typography'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import WalletAddressActionButtons from '@/components-v2/molecules/WalletAddressActionButtons'

interface IAddressLabelProps {
  chain: any
  address: string
  symbol: string
}

const AddressLabelComplex: FC<IAddressLabelProps> = ({ address, chain, symbol }) => {
  const handleCopyMessage = () => {
    toast.success('Address copied', {
      position: 'top-right',
      pauseOnHover: false
    })
    navigator.clipboard.writeText(address)
  }

  const handleOnClickExternalLink = () => {
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  return (
    <div className="flex flex-row items-center">
      <Typography classNames="pr-2" color="tertiary" variant="body1">
        {chain.name}
      </Typography>
      <div className="flex flex-row items-center">
        <Image src={chain.imageUrl} height={20} width={20} />

        <Typography classNames="pl-2 pr-4" variant="body1" styleVariant="semibold">
          {symbol}
        </Typography>
        <div className="pr-4" style={{ borderLeft: '1px solid #EAECF0', height: 10 }} />
      </div>

      <Typography color="primary" variant="body1">
        {address}
      </Typography>
      <WalletAddressActionButtons address={address} />
    </div>
  )
}

export default AddressLabelComplex
