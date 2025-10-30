import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'

interface IPaymentInfoProps {
  payingTo: string
  amount: string
  currency: string
  wrapperClassName?: string
}

const PaymentInfo: FC<IPaymentInfoProps> = ({ payingTo, amount, wrapperClassName, currency }) => (
  <div className={`border p-4 border-[#EAECF0] ${wrapperClassName}`}>
    <div className="flex flex-row justify-between">
      <Typography>Paying To</Typography>
      <Typography>{payingTo}</Typography>
    </div>
    <div className="flex flex-row mt-6 justify-between">
      <Typography variant="body2">Amount to pay</Typography>
      <div className="flex flex-row gap-2">
        <Typography>{currency}</Typography>
        <Typography>{amount ? formatNumberWithCommasBasedOnLocale(String(amount), 'SG') : '-'}</Typography>
      </div>
    </div>
  </div>
)

export default PaymentInfo


