/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react'
import Image from 'next/legacy/image'
import Xero from '@/public/svg/Xero.svg'
import MetamaskIcon from '@/public/svg/wallet-icons/metamask-icon.svg'
import Safe from '@/public/svg/wallet-icons/safe-icon.svg'
import WalletConnectIcon from '@/public/svg/wallet-icons/wallet-connect-icon.svg'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import Typography from '@/components-v2/atoms/Typography'

const XeroInfoCard = () => (
  <div className="w-[450px] p-8 bg-grey-100 font-inter text-neutral-900 rounded-l-lg">
    <div className="flex items-center">
      <Image src={Xero} alt="xero" width={55} height={55} />
      <DividerVertical space="mx-4" height="h-12" />
      <Typography classNames="" variant="heading3" color="primary">
        Wish to receive cryptocurrencies from Xero?
      </Typography>
    </div>
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="text-xs leading-[18px] bg-[#F3FF6D] px-[13px] py-[7px] rounded-[20px]">1</div>
        <Typography variant="body2">
          Enter your receiving wallet address and the asset you wish to receive in.
        </Typography>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="text-xs leading-[18px] bg-[#F3FF6D] px-[13px] py-[7px] rounded-[20px]">2</div>
        <Typography variant="body2">Click "Create Payment Link" to generate the payment link.</Typography>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="text-xs leading-[18px] bg-[#F3FF6D] px-[13px] py-[7px] rounded-[20px]">3</div>
        <div className="text-sm leading-5">
          <Typography variant="body2">Copy the payment link and add in Xero. Find out </Typography>
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://central.xero.com/s/article/Assign-edit-or-delete-payment-services#Editapaymentservice"
          >
            <Typography variant="body2">how to add HQ payment link in Xero.</Typography>
          </a>
        </div>
      </div>
    </div>
    <Typography variant="body2">Supported wallets for payment</Typography>
    <div className="flex mt-4 gap-3">
      <div className="bg-grey-200 rounded-lg p-2 flex items-center">
        <Image src={MetamaskIcon} width={28} height={28} />
      </div>
      <div className="bg-grey-200 rounded-lg p-2 flex items-center">
        <Image src={Safe} width={28} height={28} />
      </div>
      <div className="bg-grey-200 rounded-lg p-2 flex items-center">
        <Image src={WalletConnectIcon} width={28} height={28} />
      </div>
    </div>
  </div>
)

export default XeroInfoCard
