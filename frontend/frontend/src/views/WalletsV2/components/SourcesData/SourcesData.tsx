import DropDown from '@/components/DropDown/DropDown'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import Image from 'next/legacy/image'
import React, { useId, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { IScoreRatingProps } from '../AddWallet/types'
import flagIcon from '@/public/svg/Flag.svg'
import unFlagIcon from '@/public/svg/FlagTransparent.svg'
import { FlagStatusLabel, LabelRejected } from '@/components/Label/Label'
import DividerVertical from '@/components/DividerVertical/DividerVertical'

const SourcesData = (props: IScoreRatingProps) => {
  const {
    rating,
    disabled,
    title,
    subTitle,
    price,
    subPrice,
    iconLeft,
    iconRight,
    iconEdit,
    iconFlag,
    onButtonClick,
    onEditButton,
    onFlagButton,
    token,
    type,
    className = '',
    address,
    flag
  } = props
  const id = useId()

  // trigger button for flagging feature
  const [isShowDropDown, setIsShowDropDown] = useState(false)

  return (
    <div>
      <div className={`mb-6 pl-1 ${className}`}>
        <div className="flex justify-between items-center mb-2 w-full">
          <div className="flex font-inter items-center">
            {title &&
              (title.length > 10 ? (
                <>
                  <ReactTooltip
                    id={id}
                    borderColor="#eaeaec"
                    border
                    place="top"
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg "
                  >
                    {title}
                  </ReactTooltip>

                  <div className="flex items-center gap-2 text-base font-medium text-grey-900 font-inter  w-[200px] xl:w-[250px]">
                    <div data-tip data-for={id} className="truncate">
                      {title}
                    </div>
                    {flag ? <FlagStatusLabel status="Flagged" /> : ''}
                  </div>
                </>
              ) : (
                <div
                  data-tip
                  className="flex items-center gap-2 text-base font-medium text-grey-900 font-inter w-[200px] xl:w-[250px] whitespace-nowrap"
                >
                  {title}
                  {flag ? <FlagStatusLabel status="Flagged" /> : ''}
                </div>
              ))}

            {address && !token && (
              <span className="text-xs font-medium text-dashboard-sub font-inter px-2 ">
                <WalletAddress
                  notFullWidth
                  address={address}
                  showFirst={5}
                  showLast={4}
                  addressClassName="w-24"
                  addressWidth="w-full"
                  noAvatar
                  noColor
                  useAddress
                />
              </span>
            )}
            {type && (
              <span className="min-w-fit text-xs font-medium text-dashboard-sub font-inter px-2 border-x border-dashboard-border-200 whitespace-nowrap">
                {type}
              </span>
            )}
            <span className="text-xs font-medium text-dashboard-sub font-inter px-2 whitespace-nowrap border-l">
              {subTitle}
            </span>
          </div>

          <div className="flex items-center whitespace-nowrap gap-3">
            {iconLeft}
            <span className="text-base font-medium text-grey-900 font-inter px-2 whitespace-nowrap">{`${
              !token ? '$' : ''
            }${price}`}</span>
            {subPrice && (
              <span className="text-xs font-medium text-dashboard-sub font-inter whitespace-nowrap">
                {`~$${subPrice}`} USD
              </span>
            )}
            <DividerVertical space="mx-0" height="h-4" />
            {iconFlag && (
              <div
                data-tip={disabled ? `flag_wallet_source_of_funds_${id}` : `${flag}_flag_wallet_${id}`}
                data-for={disabled ? `flag_wallet_source_of_funds_${id}` : `${flag}_flag_wallet_${id}`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onFlagButton}
                  className={`${
                    disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-grey-200'
                  } flex justify-between px-1 py-1 gap-2 items-center rounded-sm focus:outline-none bg-white`}
                >
                  {flag ? (
                    <Image src={flagIcon} alt="flag" height={16} width={16} />
                  ) : (
                    <Image src={unFlagIcon} alt="flag" height={16} width={16} />
                  )}
                </button>

                {disabled ? (
                  <ReactTooltip
                    id={`flag_wallet_source_of_funds_${id}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="left"
                    className="!opacity-100 !rounded-lg"
                  >
                    <div className="max-w-[250px] text-xs font-inter font-medium text-grey-800 whitespace-normal">
                      {`We are syncing transactions data. You will be able to ${
                        flag ? 'unflag' : 'flag'
                      } a source of funds after the sync is
                      completed.`}
                    </div>
                  </ReactTooltip>
                ) : (
                  <ReactTooltip
                    id={`${flag}_flag_wallet_${id}`}
                    borderColor="#eaeaec"
                    border
                    place="top"
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg "
                  >
                    {flag ? 'Unflag Wallet' : 'Flag Wallet'}
                  </ReactTooltip>
                )}
              </div>
            )}
            {iconEdit && (
              <div
                data-tip={disabled ? `edit_source_of_funds_${id}` : `${iconEdit}_edit_wallet_${id}`}
                data-for={disabled ? `edit_source_of_funds_${id}` : `${iconEdit}_edit_wallet_${id}`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onEditButton}
                  className={`${
                    disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-grey-200'
                  }  px-1 py-1 rounded-sm flex items-center justify-center`}
                >
                  <Image src={iconEdit} alt="image" height={16} width={16} />
                </button>

                {disabled ? (
                  <ReactTooltip
                    id={`edit_source_of_funds_${id}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="left"
                    className="!opacity-100 !rounded-lg"
                  >
                    <div className="max-w-[250px] text-xs font-inter font-medium text-grey-800 whitespace-normal">
                      We are syncing transactions data. You will be able to edit a source of funds after the sync is
                      completed.
                    </div>
                  </ReactTooltip>
                ) : (
                  <ReactTooltip
                    id={`${iconEdit}_edit_wallet_${id}`}
                    borderColor="#eaeaec"
                    border
                    place="top"
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg "
                  >
                    Edit Wallet
                  </ReactTooltip>
                )}
              </div>
            )}
            {iconRight && (
              <div
                data-tip={disabled ? `delete_source_of_funds_1111_${id}` : `${iconRight}_delete_wallet_${id}`}
                data-for={disabled ? `delete_source_of_funds_1111_${id}` : `${iconRight}_delete_wallet_${id}`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onButtonClick}
                  className={`${
                    disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-grey-200'
                  } px-1 py-1 rounded-sm flex items-center justify-center`}
                >
                  <Image src={iconRight} alt="image" height={16} width={16} />
                </button>

                {disabled ? (
                  <ReactTooltip
                    id={`delete_source_of_funds_1111_${id}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="left"
                    className="!opacity-100 !rounded-lg"
                  >
                    <div className="max-w-[250px] text-xs font-inter font-medium text-grey-800 whitespace-normal">
                      We are syncing transactions data. You will be able to delete a source of funds after the sync is
                      completed.
                    </div>
                  </ReactTooltip>
                ) : (
                  <ReactTooltip
                    id={`${iconRight}_delete_wallet_${id}`}
                    borderColor="#eaeaec"
                    border
                    place="top"
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg "
                  >
                    Delete Wallet
                  </ReactTooltip>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center mb-3">
          <div className="w-full bg-grey-200 rounded-2xl h-1">
            <div className="bg-grey-800 h-1 rounded-2xl" style={{ width: `${rating}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourcesData
