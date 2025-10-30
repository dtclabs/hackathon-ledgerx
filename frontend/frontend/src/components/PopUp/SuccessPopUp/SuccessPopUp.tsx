/* eslint-disable react/no-array-index-key */
import React from 'react'
import { toShort } from '@/utils/toShort'
import CopyToClipboardBtn from '@/utils/copyTextToClipboard'
import tickIcon from '@/public/image/TickIcon.png'
import final from '@/public/svg/SendPayment.svg'
import success from '@/public/svg/Success.svg'
import { useNetWork } from '@/hooks/useNetwork'
import useFreeContext from '@/hooks/useFreeContext'
import Typography from '@/components-v2/atoms/Typography'

interface ISuccessPopUp {
  title: string
  description?: string | any
  action: any
  buttonText?: string
  safe?: boolean
  address?: string
  safeHash?: string
}

const SuccessPopUp: React.FC<ISuccessPopUp> = ({
  title,
  description,
  action,
  buttonText,
  safe = false,
  address,
  safeHash
}) => {
  const { networkConfig: networkConfigs } = useFreeContext()
  return (
    <div className=" w-[650px]  rounded-[24px]  text-center bg-white">
      {!safe ? (
        <>
          <div className="flex items-center  p-8">
            <div className="  mr-8">
              <img src={success.src} alt="icon" />
            </div>
            <div>
              <div className="mb-1 text-2xl font-supply text-black-0 text-left uppercase">{title}</div>
              <div className="text-[#787878]  text-base font-inter text-left  whitespace-pre-line">{description}</div>
            </div>{' '}
          </div>
          <div className="border-b " />
          <div className="m-8">
            <button
              onClick={action}
              type="button"
              className=" py-4 w-full font-semibold rounded-[8px] text-base hover:bg-grey-901  font-inter text-white bg-grey-900"
            >
              {buttonText || 'Continue'}
            </button>
          </div>
        </>
      ) : (
        <div className="">
          <div className=" p-8">
            <div className="  flex  flex-col justify-center">
              <div className="flex  justify-center">
                <img src={final.src} alt="icon" className="mb-6" />
              </div>

              <Typography classNames="px-[110px]" variant="heading2" color="primary">
                {title}
              </Typography>
              <div className=" text-sm font-inter text-neutral-900 font-semibold leading-5 mt-6">
                Check the status of your payment
              </div>
              {(address || safeHash) && (
                <div className="flex justify-center">
                  <div className="flex  justify-center items-center w-fit mt-4 py-2 border px-3 border-dashboard-border-200 rounded-lg bg-gray-50">
                    {safeHash ? (
                      <div className="text-[#787878] pr-4 text-xs font-inter whitespace-pre-line">
                        Safe Transaction Hash
                      </div>
                    ) : (
                      <div className="text-[#787878] pr-4 text-xs font-inter whitespace-pre-line">Transaction Hash</div>
                    )}
                    <div className="pr-2 text-neutral-900 font-medium leading-5 font-inter text-sm">
                      {safeHash ? toShort(safeHash, 5, 4) : toShort(address, 5, 4)}
                    </div>
                    {safeHash ? null : (
                      <a
                        target="_blank"
                        href={`${networkConfigs.scanUrlHash}tx/${address}`}
                        rel="noreferrer noopener"
                        className="block rounded-full w-3 h-3 hover:bg-gray-100  cursor-pointer"
                      >
                        <img className="" src="./svg/Share.svg" alt="share" />
                      </a>
                    )}
                    <div className="pl-2">
                      <CopyToClipboardBtn width="w-3" height="h-3" textToCopy={address || safeHash} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-8 border-y border-dashboard-border max-h-[calc(100vh-410px)] overflow-auto scrollbar">
            <div className="text-neutral-900 text-base font-semibold leading-6 whitespace-pre-line font-inter">
              {description}
            </div>
            <div className=" pt-6 flex flex-col justify-center font-inter text-sm">
              <div className="font-medium pb-6 text-base text-neutral-900">
                Looking to streamline your Web3 FinOps? Experience the full version of LedgerX.
              </div>
              <div className="flex-col text-sm text-grey-20">
                <div className="flex items-center ">
                  <div className="flex-col gap-1 mb-6">
                    <div className="flex items-center w-full pl-[10px] text-left font-semibold text-sm leading-5 text-neutral-900">
                      <img src={tickIcon.src} alt="icon" className="mr-[18px] h-[10px] w-[14px]" />
                      Bookkeeping
                    </div>
                    <div className="w-full pl-[42px] pr-2 text-left font-medium text-grey-800 text-sm leading-5">
                      Easily sync your on-chain transaction data with common accounting software like Quickbooks and
                      Xero.
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-col gap-1 mb-6">
                    <div className="flex items-center w-full pl-[10px] text-left font-semibold text-sm leading-5 text-neutral-900">
                      <img src={tickIcon.src} alt="icon" className="mr-[18px] h-[10px] w-[14px]" />
                      Bulk Payouts
                    </div>
                    <div className="w-full pl-[42px] pr-2 text-left font-medium text-grey-800 text-sm leading-5">
                      Send assets to multiple addresses all in one transfer.
                    </div>
                  </div>
                </div>
                <div className="flex items-center ">
                  <div className="flex-col gap-1">
                    <div className="flex items-center w-full pl-[10px] text-left font-semibold text-sm leading-5 text-neutral-900">
                      <img src={tickIcon.src} alt="icon" className="mr-[18px] h-[10px] w-[14px]" />
                      Team Workflows
                    </div>
                    <div className="w-full pl-[42px] pr-2 text-left font-medium text-grey-800 text-sm leading-5">
                      Add your team members and vendors, assign access controls, create contacts and more!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" m-8 gap-4 flex">
            <button
              onClick={action}
              type="button"
              className=" py-4 font-semibold flex-1 rounded-[4px] text-base hover:bg-gray-300 text-grey-800 font-inter bg-grey-200"
            >
              Close
            </button>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://ledgerx.com"
              className=" py-4 flex-1 font-semibold rounded-[4px] text-base hover:bg-grey-901 text-white font-inter bg-grey-900"
            >
              Learn More
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuccessPopUp
