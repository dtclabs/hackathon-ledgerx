import { FC } from 'react'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import { Divider } from '@/components-v2/Divider'
import { format } from 'date-fns'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import DtcPoweredIcon from '@/public/svg/logos/dtcpay-powered.svg'

interface IPaymentStepProps {
  transactionHash: string
  paidDate: string
  token: {
    label: string
    image: string
    value: string
  }
  network: {
    label: string
    image: string
  }
  fiatAmount: string
  cryptocurrencyAmount: string
  currency: string
}

const PaidStep: FC<IPaymentStepProps> = ({
  fiatAmount,
  token,
  paidDate,
  network,
  transactionHash,
  cryptocurrencyAmount,
  currency
}) => (
  <div className="flex flex-col justify-between">
    <div className=" flex flex-col flex-grow ">
      <Divider />
      <div className="mt-4">
        <Typography variant="caption" color="secondary" classNames="mb-1">
          Transaction ID:
        </Typography>
        <WalletAddress split={5} address={transactionHash}>
          <WalletAddress.Copy address={transactionHash} />
        </WalletAddress>
      </div>
      <div className="mt-6">
        <Typography variant="caption" color="secondary" classNames="mb-1">
          Paid on:
        </Typography>
        {paidDate ? (
          <Typography>{format(new Date(paidDate), 'dd/MM/yyyy HH:mm')}</Typography>
        ) : (
          <Typography>-</Typography>
        )}
      </div>
      <div className="mt-6">
        <Typography variant="caption" color="secondary" classNames="mb-1">
          Network:
        </Typography>
        <div className="flex flex-row gap-2">
          <Image src={network?.image} alt="token-img" height={14} width={18} />
          <Typography>{network?.label}</Typography>
        </div>
      </div>
      <div className="mt-6">
        <Typography variant="caption" color="secondary" classNames="mb-1">
          Token:
        </Typography>
        <div className=" flex flex-row gap-2">
          <Image src={token?.image} alt="token-img" height={14} width={18} />
          <Typography>
            {token?.label} ({token?.value})
          </Typography>
        </div>
      </div>
      <div className="mt-8">
        <Typography color="secondary">
          This link will expire once due date is up. Please take a screenshot if needed.
        </Typography>
      </div>
    </div>
    <div className="flex flex-row items-center gap-2">
      <Typography classNames="text-[#B5B5B3] opacity-60" styleVariant="medium">
        Powered by
      </Typography>
      <Image src={DtcPoweredIcon} alt="dtcpay-logo" />
    </div>
  </div>
)

export default PaidStep
// "This link will expire once the due date has passed."