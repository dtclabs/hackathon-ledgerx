/* eslint-disable react/no-unescaped-entities */
import { useRef, useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import Link from 'next/link'
import LedgerXLogo from '@/public/svg/logos/ledgerx-logo.svg'

const MaintenancePage = () => (
  <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
    <div className="block rounded-lg shadow-lg bg-white max-w-xl font-inter">
      <div className="px-6 pb-6">
        <div className="flex justify-center">
          <Image src={LedgerXLogo} alt="ledgerx-logo" width={200} height={100} />
        </div>
        <Typography variant="heading2" classNames="text-center -mt-4 mb-2">
          We'll Be Back Soon
        </Typography>
        <Typography classNames="mb-3">
          <span className="font-bold">Temporary Downtime Alert:</span> We're currently undergoing a scheduled upgrade.
        </Typography>
        <Typography classNames="mb-1" variant="caption">
          Outage time is expected as follows:
        </Typography>
        <div className="mb-3">
          <ul className="mb-1">
            <Typography>
              <span className="font-bold">- Start:</span> 11:00 UTC April 7th 2024
            </Typography>
          </ul>
          <ul>
            <Typography>
              <span className="font-bold">- Finish:</span> 15:00 UTC April 7th 2024
            </Typography>
          </ul>
        </div>
        <Typography classNames="mb-3">
          <span className="font-bold">Why?</span> We're enhancing security, improving performance, and adding new
          features to bring you an even better experience.
        </Typography>
        <Typography classNames="mb-3">
          <span className="font-bold">Need Help?</span>{' '}
          <a className="underline hover:text-gray-500 hover:font-bold" href="https://www.ledgerx.com/contact">
            Contact Us
          </a>{' '}
          for assistance.
        </Typography>
        <Typography styleVariant="medium">— The LedgerX Team</Typography>
      </div>
      <hr />
    </div>
  </div>
)

export default MaintenancePage
