import { FC } from 'react'
import Image from 'next/legacy/image'
import QRCode from 'qrcode.react'
import Typography from '@/components-v2/atoms/Typography'
import Button from '@/components-v2/atoms/Button'
import CircleErrorIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'

interface IPaymentStepProps {
  payingTo: string
  amount: string
  currency: string
  fiatAmount: string
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
  onClickRefresh: () => void
}

const ExpiredLinkStep: FC<IPaymentStepProps> = ({
  payingTo,
  amount,
  fiatAmount,
  token,
  network,
  onClickRefresh,
  currency,
  onClickResetQRPayment
}) => (
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
        <div className="flex justify-center relative items-center flex-col">
          <div
            className="absolute top-6 flex flex-col justify-center items-center"
            style={{ width: 170, height: 170, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          >
            <Image src={CircleErrorIcon} alt="error-icon" height={40} width={40} />
            <Typography classNames="mt-2" styleVariant="semibold" variant="caption">
              QR code has expired
            </Typography>
          </div>
          <QRCode size={170} className="mt-6 mb-6" value="This link is no longer valid" />
        </div>
        <Typography classNames="text-center font-[500] ">Scan QR Code</Typography>
        <Typography classNames="text-center font-[400] opacity-60" color="secondary">
          Using your preferred Wallet app
        </Typography>
      </div>

      <div className="flex justify-center mt-6">
        <div className="mt-4 flex justify-center">
          <Button label="Refresh QR code" variant="black" height={40} onClick={onClickRefresh} />
        </div>
      </div>

      <div className="flex justify-center mt-4 mb-4">
        <Button onClick={onClickResetQRPayment} height={40} variant="ghost" label="Select another token/network" />
      </div>
    </div>
  </div>
)

export default ExpiredLinkStep
