import { Alert } from '@/components/Alert'
import React from 'react'
import warning from '@/public/svg/warningBig.svg'
import Image from 'next/legacy/image'

interface IInvalidLink {
  amountMissing: boolean
  invoiceMissing: boolean
  tokenInvalid: boolean
  paymentId: boolean
  addressInvalid: boolean
}

const InvalidLink: React.FC<IInvalidLink> = ({
  addressInvalid,
  amountMissing,
  invoiceMissing,
  tokenInvalid,
  paymentId
}) => (
  <div className="bg-grey-100 h-screen w-full font-inter">
    <div className="w-full h-[80px] flex items-center justify-between bg-white border-b">
      <div className="flex items-center font-inter text-sm font-medium gap-8 text-black-0">
        <a className="ml-8" href="https://ledgerx.com">
          <img className="w-[180px]" src="/svg/logos/ledgerx-logo.svg" alt="logo" />
        </a>
      </div>
    </div>
    <div className="mt-16 w-[900px] bg-white rounded-2xl mx-auto py-8 flex flex-col items-center justify-center">
      <Image src={warning} />
      <div className="text-xl font-semibold leading-7 mt-4">Invalid Link</div>
      <Alert variant="danger" fontSize="text-base" className="mt-8 text-base leading-6 font-medium py-3 rounded-xl">
        <span className="mt-1">
          This payment link is invalid. Please review and try again.
          <ul className="pl-2 mt-1">
            {paymentId && <li className="mb-1">&#9679; The payment ID is missing</li>}
            {amountMissing && <li className="mb-1">&#9679; The payment amount is missing or incorrect</li>}
            {invoiceMissing && <li className="mb-1">&#9679; The invoice number is missing</li>}
            {tokenInvalid && <li className="mb-1">&#9679; The token you have provided is not supported</li>}
            {addressInvalid && <li>&#9679; The address you have entered is incorrect</li>}
          </ul>
        </span>
      </Alert>
    </div>
  </div>
)

export default InvalidLink

// {invalid
//   ? 'This payment link is invalid. Please review and try again.'
//   : amountMissing && invoiceMissing
//   ? 'The payment amount and invoice number is missing in the link. Please review and try again.'
//   : invoiceMissing
//   ? 'The invoice number is missing in the link. Please review and try again.'
//   : 'The payment amount is missing in the link. Please review and try again.'}
