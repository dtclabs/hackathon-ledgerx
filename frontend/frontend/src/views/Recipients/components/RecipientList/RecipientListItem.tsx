import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import Edit from '@/public/svg/Edit.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { IRecipientAddress } from '@/slice/contacts/contacts.types'
import { useAppSelector } from '@/state'
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import React, { useId } from 'react'
import ReactTooltip from 'react-tooltip'

export interface IRecipientListItem {
  addresses: IRecipientAddress[]
  id: string
  name: string
  active: boolean
  time: string
  updatedAt: string
  checked: boolean
  organisationName: string
  onCheckboxChange: () => void
  onShowDetailRecipient?: React.MouseEventHandler<HTMLButtonElement>
  onTransferFunds?: React.MouseEventHandler<HTMLButtonElement>
  isLastItem: boolean
  isTableOverflowed: boolean
}

const RecipientListItem: React.FC<IRecipientListItem> = ({
  addresses,
  name,
  active,
  time,
  updatedAt,
  onShowDetailRecipient,
  onTransferFunds,
  organisationName,
  onCheckboxChange,
  checked,
  isLastItem,
  isTableOverflowed
}) => {
  const id = useId()
  const supportedChains = useAppSelector(supportedChainsSelector)

  return (
    <div
      className={`p-4 flex w-full justify-between ${
        isLastItem && isTableOverflowed ? '' : 'border-b border-[#CECECC]'
      } font-medium text-sm text-dashboard-main`}
    >
      <div className="flex items-center w-[63%]">
        <div className="w-1/2 flex gap-8 items-center truncate">
          {/* <div>
            <Checkbox onChange={onCheckboxChange} isChecked={checked} accentColor="accent-grey-900" />
          </div> */}
          <div className="flex justify-between  truncate">
            <div className="flex  gap-3  items-center truncate">
              <div>
                <Avvvatars style="shape" size={32} value={addresses[0]?.address} />
              </div>
              <ReactTooltip
                id={id}
                borderColor="#eaeaec"
                border
                place="top"
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg !font-medium"
              >
                {organisationName || name}
              </ReactTooltip>
              {(organisationName.trim() || name.trim()).length > 25 ? (
                <div className="truncate pr-5 flex-1">
                  <span data-tip data-for={id}>
                    {toShort(organisationName || name, 25, 0)}
                  </span>
                </div>
              ) : (
                <div className="truncate pr-5 flex-1">{organisationName || name}</div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 pr-5">
          {addresses.length > 1 ? (
            'Multiple Addresses'
          ) : (
            <WalletAddress split={5} address={addresses[0]?.address} color="dark">
              <WalletAddress.Link address={addresses[0]?.address} options={supportedChains} />
              <WalletAddress.Copy address={addresses[0]?.address} />
            </WalletAddress>
          )}
        </div>
      </div>
      <div className="flex w-[37%] items-center">
        <div className="w-1/2">
          {updatedAt
            ? format(new Date(updatedAt), 'dd MMM yyyy, hh:mm a')
            : format(new Date(time), 'dd MMM yyyy, hh:mm a')}
        </div>
        <div className=" flex items-center">
          {/* <button
            type="button"
            className="w-1/2 invisible whitespace-nowrap text-xs border border-dashboard-border-200 rounded-lg px-3 py-[7px]"
            onClick={onTransferFunds}
          >
            Transfer Funds
          </button> */}
          <button
            type="button"
            className="whitespace-nowrap text-xs border border-[#CECECC] rounded-lg px-3 py-[7px]"
            onClick={onShowDetailRecipient}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecipientListItem
