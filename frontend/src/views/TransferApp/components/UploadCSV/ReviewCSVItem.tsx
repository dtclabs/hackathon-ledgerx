import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import { formatNumber } from '@/utils/formatNumber'
import { isNumber } from '@/utils/isNumber'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

export interface IReviewCSVItem {
  item: any[]
  sourceAddress: string
  token: any
  tokenLogoUrl: any
  correctToken: string
  validDecimal: (amount: string | number, checkToken: string) => boolean
  fullTokenName: string[]
  addressExists: any[]
  csvResult: any[]
  isRemarkColumn: boolean
  remark: any
}

const ReviewCSVItem: React.FC<IReviewCSVItem> = ({
  csvResult,
  item,
  sourceAddress,
  token,
  tokenLogoUrl,
  fullTokenName,
  correctToken,
  validDecimal,
  addressExists,
  isRemarkColumn,
  remark
}) => {
  const { account } = useWeb3React()
  const safeService = useSafeServiceClient()
  const [isAddressError, setIsAddressError] = useState(false)
  const [addressError, setAddressError] = useState(false)
  const [isAmountError, setIsAmountError] = useState(false)
  const [isTokenError, setIsTokenError] = useState(false)

  useEffect(() => {
    let isMetamask: boolean
    const callback = async () => {
      if (sourceAddress === account) {
        isMetamask = true
      }

      if (isAddress(item[0])) {
        setIsAddressError(false)
        setAddressError(false)
      } else {
        setAddressError(true)
      }

      if (isMetamask) {
        try {
          const isGnosisSafeAddress = await safeService.getSafeInfo(item[0])
          if (isGnosisSafeAddress) setIsAddressError(true)
        } catch (error) {
          sentryCaptureException(error)
          setIsAddressError(false)
        }
      }
    }
    callback()
    const amountValue =
      Number(item[2]) > 100 ? Number(item[2]) : formatNumber(item[2], { locate: 'en-US', maximumFractionDigits: 20 })

    if (item[1] && fullTokenName.includes(item[1].toLowerCase())) {
      setIsTokenError(false)
    } else {
      setIsTokenError(true)
    }
    if (
      isNumber(amountValue.toString().toLowerCase()) &&
      !validDecimal(amountValue, correctToken) &&
      Number([amountValue]) !== 0
    ) {
      setIsAmountError(false)
    } else {
      setIsAmountError(true)
    }
  }, [account, item, safeService, sourceAddress])

  return (
    <tr
      // eslint-disable-next-line react/no-array-index-key
      className=" border-t font-inter text-sm  leading-4 font-semibold h-[53px]"
    >
      <td className="pl-4 py-[18px] text-[#101828] text-left">
        <div className="flex gap-2 items-center w-[380px] h-4 mb-2">
          <div className={`${addressError || isAddressError || isTokenError || isAmountError ? 'line-through' : ''}  `}>
            {item[0]}
          </div>
        </div>
        {addressExists.includes(item[0]) && (
          <div className="text-yellow-500 text-sm font-normal">This address occurs more than once in this import</div>
        )}
        {(addressError && <div className=" text-neutral-900 text-sm font-normal">Invalid wallet address</div>) ||
          (isAddressError && <div className="text-neutral-900 text-sm font-normal">Invalid wallet address</div>)}
      </td>
      <td className="pl-4 py-[18px] text-[#101828] text-left ">
        <div className="flex gap-2 items-center w-[100px] h-4 mb-2">
          {token(item[1] && item[1].toLocaleUpperCase()) && (
            <img className="w-3 h-auto" src={tokenLogoUrl(item[1] && item[1].toLocaleUpperCase())} alt="logo" />
          )}

          <div title={item[1]} className="font-medium text-right text-[#101828] truncate">
            <div
              className={`${addressError || isAddressError || isTokenError || isAmountError ? 'line-through' : ''}  `}
            >
              {item[1] && item[1].toUpperCase()}
            </div>
          </div>
        </div>
        {isTokenError && <div className=" text-neutral-900 text-sm left-4 font-normal">Invalid token</div>}
      </td>
      <td className="pl-4 py-[18px] text-[#101828] truncate">
        <div className="flex gap-2 items-center w-[100px] h-4 mb-2 truncate">
          <div title={item[2]} className=" truncate font-medium">
            <div
              className={`truncate ${
                addressError || isAddressError || isTokenError || isAmountError ? 'line-through' : ''
              }  `}
            >
              {item[2]}
            </div>
          </div>
        </div>
        {isAmountError && (
          <div className="text-neutral-900 text-sm right-4 whitespace-nowrap font-normal">Invalid amount</div>
        )}
      </td>
      {remark.length > 0 && (
        <td className="px-4 py-[18px]  text-[#101828] truncate flex self-start">
          <div title={item[3]} className="flex gap-2 w-[100px] h-4 truncate font-medium ">
            {item[3]}
          </div>
        </td>
      )}
    </tr>
  )
}

export default ReviewCSVItem
