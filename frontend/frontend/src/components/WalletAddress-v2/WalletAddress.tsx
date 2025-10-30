/* eslint-disable no-param-reassign */
/* eslint-disable react/style-prop-object */
import { useAppSelector } from '@/state'
import CopyToClipboardBtn from '@/utils/copyTextToClipboard'
import Avvvatars from 'avvvatars-react'
import React, { useMemo } from 'react'
import { networkConfigs } from '@/constants/network'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
// TODO - Just a temp fix to ensure that no regression occurs in other areas using this
interface IWalletAddress {
  address?: string
  showFirst?: number
  showLast?: number
  noColor?: boolean
  noCopy?: boolean
  scanType?: 'address' | 'txHash'
  noScan?: boolean
  noAvatar?: boolean
  className?: string
  sizeAvatar?: number
  maxWidth?: string
  name?: string
  organizationName?: string
  spaceBetween?: boolean
  addressClassName?: string
  addressWidth?: string
  notFullWidth?: boolean
  useAddress?: boolean
  textAlign?: 'left' | 'right'
  showAddress?: boolean
  chainId?: number
}

const WalletAddress: React.FC<IWalletAddress> = ({
  address = '0x0000000000000000000000000000000000000000',
  showFirst,
  showLast = 4,
  noColor = false,
  noCopy = false,
  noScan = false,
  scanType = 'address',
  addressWidth = 'w-3/4',
  noAvatar = false,
  className = '',
  maxWidth = '',
  textAlign = 'left',
  addressClassName = 'w-40',
  sizeAvatar,
  organizationName,
  name,
  spaceBetween = false,
  useAddress = false,
  chainId,
  showAddress = false
}) => {
  const organizationId = useOrganizationId()
  const { data } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId }
  )
  const recipientList = data?.items
  const sourceList = useAppSelector(walletsSelector)

  const number = (string) => {
    let result = 0
    for (let i = 0; i < string.length; i++) {
      result += string.charCodeAt(i)
      if (result > 255) {
        result -= 255
      }
    }
    return result
  }
  const splitPos = address && address.length - showLast - 1
  if (showFirst > splitPos) {
    showFirst = splitPos
  }
  const from = address && number(address.substring(0, Math.floor(address.length / 2)))
  const to = address && number(address.substring(Math.floor(address.length / 2), address.length - 1))
  const gradient = `linear-gradient(-75deg, hsl(${from},100%,40%) 0%, hsl(${to},100%,36%) 100%)`
  const colorText = noAvatar && !noColor

  const source = useMemo(() => {
    if (sourceList && !useAddress) {
      return sourceList.find((item) => item.address && address && item.address.toLowerCase() === address.toLowerCase())
    }

    return undefined
  }, [address, sourceList, useAddress])

  const recipient = useMemo(() => {
    if (recipientList && !useAddress) {
      return recipientList.find((item) =>
        item.recipientAddresses.find(
          (recipientItem) =>
            recipientItem.address && address && recipientItem.address.toLowerCase() === address.toLowerCase()
        )
      )
    }

    return undefined
  }, [address, chainId, recipientList, useAddress])

  return (
    <div
      className={`whitespace-nowrap items-center w-full flex ${spaceBetween && 'justify-between'} ${
        !colorText ? '' : ' bg-clip-text text-transparent after:bg-clip-text after:text-transparent'
      } ${className} ${maxWidth}`}
      style={{
        backgroundImage: !colorText ? 'none' : gradient
      }}
    >
      {!noAvatar && (
        <span className="pr-4">
          <Avvvatars style="shape" size={sizeAvatar} value={address} />
        </span>
      )}
      {name && <p className="text-base text-[#344054] pr-3">{name}</p>}
      <div
        className={`flex items-center ${addressClassName} gap-4 ${
          textAlign === 'left' ? 'justify-start' : 'justify-end pr-3'
        }`}
      >
        <div className={`truncate leading-5 ${addressWidth}`}>
          {showAddress ? (
            <>
              <span className="text-ellipsis shrink overflow-hidden">
                {address && address.substring(0, showFirst > 1 && showFirst < splitPos ? showFirst : splitPos + 1)}
                {showFirst > 1 && showFirst < splitPos ? '...' : ''}
              </span>
              <span>{address && address.substring(splitPos + 1, address.length)}</span>
            </>
          ) : organizationName ? (
            <p className="truncate ">{organizationName}</p>
          ) : recipient ? (
            <p className="truncate">{recipient.organizationName || recipient.contactName}</p>
          ) : source ? (
            <p className="truncate">{source.name}</p>
          ) : (
            <>
              <span className="text-ellipsis shrink overflow-hidden">
                {address && address.substring(0, showFirst > 1 && showFirst < splitPos ? showFirst : splitPos + 1)}
                {showFirst > 1 && showFirst < splitPos ? '...' : ''}
              </span>
              <span>{address && address.substring(splitPos + 1, address.length)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 text-[99A4AF]">
        {!noScan && (
          <span>
            <a
              target="_blank"
              href={`${
                (scanType === 'address' && networkConfigs[chainId]?.scanUrlAddress) ||
                (scanType === 'txHash' && `${networkConfigs[chainId]?.scanUrlHash}tx/`)
              }${address}`}
              rel="noreferrer noopener"
              className=" rounded-full flex  items-center justify-center w-3 h-3 hover:bg-gray-100  cursor-pointer"
            >
              <img className="" src="/svg/Share.svg" alt="share" />
            </a>
          </span>
        )}{' '}
        {!noCopy && (
          <span>
            <CopyToClipboardBtn width="w-3" height="h-3" textToCopy={address} />
          </span>
        )}
      </div>
    </div>
  )
}

export default WalletAddress
