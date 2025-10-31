import React from 'react'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import CryptoSvg from 'public/svg/icons/crypto-to-crypto.svg'
import FiatSvg from 'public/svg/icons/crypto-to-fiat.svg'
import Gnosis from '@/public/svg/Gnosis.svg'
import Disperse from '@/public/svg/Disperse.svg'
import TripleA from '@/public/svg/TripleA.svg'
import { CurrencyType } from '@/api-v2/payment-api'

interface IPaymentIconSquare {
  paymentName: string
  description: string
  paymentType: CurrencyType
}

const PaymentIconSquare: React.FC<IPaymentIconSquare> = ({ paymentName, description, paymentType }) => (
  <div className="justify-center pt-4 gap-4 rounded-lg border border-dashboard-border-200 py-6 w-[300px] flex flex-col items-center hover:bg-grey-200 hover:border-grey-200 relative">
    {paymentType === CurrencyType.FIAT && (
      <div className="text-xs bg-[#FCF22D] py-1 px-2.5 rounded-[100px] font-bold absolute top-2 left-2">New</div>
    )}
    <div className="p-2 w-max flex items-center">
      <Image src={paymentType === CurrencyType.CRYPTO ? CryptoSvg : FiatSvg} />
    </div>
    <Typography variant="subtitle1">{paymentName}</Typography>
    <Typography variant="caption" color="tertiary" classNames="px-6">
      {description}{' '}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
        }}
      >
        <Typography color="tertiary" styleVariant="underline" variant="caption">
          Learn more
        </Typography>
      </button>
    </Typography>
    <hr className="mt-4  w-[236px]" />
    <div className="flex flex-row items-center">
      <Typography variant="caption" classNames="text-gray-700">
        Powered by
      </Typography>
      {paymentType === CurrencyType.CRYPTO ? (
        <>
          <div className="px-1">
            <Image src={Disperse} width={14} height={14} />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              window.open('https://disperse.app/', '_blank')
            }}
          >
            <Typography variant="caption" styleVariant="underline">
              Disperse
            </Typography>
          </button>
          <Typography variant="caption" classNames="text-gray-700 text-sm px-2">
            &amp;
          </Typography>
          <div className="pr-1">
            <Image src={Gnosis} width={14} height={14} />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              window.open('https://app.safe.global/welcome', '_blank')
            }}
          >
            <Typography variant="caption" styleVariant="underline">
              Safe
            </Typography>
          </button>
        </>
      ) : (
        <div className="px-1">
          <Image src={TripleA} width={62} height={16} />
        </div>
      )}
    </div>
  </div>
)

export default PaymentIconSquare
