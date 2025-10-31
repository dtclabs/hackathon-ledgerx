import { FC } from 'react'
import Image from 'next/legacy/image'
import QRCode from 'qrcode.react'
import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import Button from '@/components-v2/atoms/Button'
import TimeIcon from '@/public/svg/icons/time-icon.svg'
import { toast } from 'react-toastify'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'

interface IPaymentStepProps {
  payingTo: string
  amount: string
  fiatAmount: string
  address: string
  currency: string
  onClickResetQRPayment: () => void
  token: {
    label: string
    image: string
    value: string
  }
  network: {
    label: string
    image: string
  }
  remainingTime: {
    hours: number
    minutes: number
  }
}

const PaymentStep: FC<IPaymentStepProps> = ({
  payingTo,
  amount,
  address,
  fiatAmount,
  onClickResetQRPayment,
  remainingTime,
  token,
  network,
  currency
}) => {
  const remainingTimeMessage = `${remainingTime.hours}h ${remainingTime.minutes}m`
  const handleOnClickCopy = () => {
    navigator.clipboard.writeText(address)
    toast.success('Address copied successfully', {
      position: 'top-right',
      pauseOnHover: false
    })
  }
  return (
    <div className="w-full">
      <div className=" border border-[#EAECF0] p-4 mt-6">
        <Typography variant="body2" color="secondary" classNames="text-center mt-8">
          Paying to: <span className="font-[600] text-black">{payingTo}</span>
        </Typography>
        <div>
          <div className="flex flex-row justify-center mt-8 items-center gap-2">
            <Image src={token.image} alt="token-img" height={14} width={14} />
            <Typography variant="heading3" styleVariant="semibold">
              {amount ? formatNumberWithCommasBasedOnLocale(String(amount), 'SG') : '-'}
            </Typography>
            <Typography variant="heading3" styleVariant="semibold">
              {token.value}
            </Typography>
          </div>
          <div className="flex flex-row justify-center items-center gap-2">
            <Image src={network.image} alt="token-img" height={14} width={14} />
            <Typography>{network.label}</Typography>
          </div>
          <div className="flex justify-center  items-center flex-col">
            <QRCode className="mt-6 mb-4" value={address} />
            <Typography classNames="font-[500]">Scan QR Code</Typography>
            <Typography classNames="font-[400] opacity-60" color="secondary">
              Using your preferred Wallet app
            </Typography>
          </div>
          <div className="mt-6">
            <Typography classNames="text-center" color="secondary">
              Or copy the wallet address below to pay
            </Typography>
            <div className="flex  justify-center items-center gap-4 mt-4">
              <TextField extendInputClassName="!h-[40px]" value={address} disabled name="payment-address" />
              <Button
                onClick={handleOnClickCopy}
                height={40}
                width="w-[90px]"
                label="Copy"
                variant="black"
                type="button"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="mt-8 flex flex-row gap-2">
              <Image src={TimeIcon} alt="time-icon" height={14} width={14} />
              <Typography color="secondary">
                QR Code expiring in:{' '}
                <span style={{ fontWeight: 500 }} className="text-[#D14545]">
                  {remainingTimeMessage}
                </span>
              </Typography>
            </div>
          </div>
          <div className="flex justify-center mt-12 mb-4">
            <Button onClick={onClickResetQRPayment} height={40} variant="ghost" label="Select another token/network" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentStep
