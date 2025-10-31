/* eslint-disable react/no-array-index-key */
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'
import DividerVertical from '../DividerVertical/DividerVertical'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { SourceType } from '@/slice/wallets/wallet-types'
import { useAppSelector } from '@/state'
import ReactTooltip from 'react-tooltip'

export interface IFormatOptionLabel {
  value: string
  label: string
  id?: string
  address?: string
  src?: string
  bankName?: string
  accountNumber?: string
  currencyCode?: string
  totalPrice?: string
  typeAddress?: SourceType
  tokenId?: string
  sourceId?: string
  tokenName?: string
  tokenImage?: string
  isDisabled?: boolean
  __isNew__?: boolean
  decimal?: number
  type?: SourceType
  chainImage?: any
  supportedBlockchains?: string[]
  isSelectedChainSupported?: boolean
  isConnectedAccountOwner?: boolean
}

const FormatOptionLabel = (props: IFormatOptionLabel) => {
  const chainIcons = useAppSelector(selectChainIcons)
  const { fiatCurrency: fiatCurrencySetting } = useAppSelector(orgSettingsSelector)

  return props?.value ? (
    props.isDisabled ? (
      <>
        <div
          data-tip={`disabled-make-payment-wallet-${props?.id}`}
          data-for={`disabled-make-payment-wallet-${props?.id}`}
          className="w-full flex items-center whitespace-nowrap rounded text-sm leading-5 font-medium font-inter justify-between opacity-60"
        >
          <div className="flex flex-1 items-center gap-3 max-w-[70%] pr-3">
            <div className="flex-shrink-0">
              <Avvvatars style="shape" size={24} value={props.label} />
            </div>
            <div className="text-grey-800 truncate max-w-[120px]">{props.label}</div>
            <div className="text-grey-700  truncate">{`${fiatCurrencySetting?.symbol}${props.totalPrice}`}</div>
          </div>
          <div className="flex items-center">
            <div className="text-grey-700 p-0">{toShort(props.address, 5, 4)}</div>
            <DividerVertical height="h-4" space="mx-4" />
            <div className="flex items-center w-fit min-w-[50px] h-6 bg-white">
              {props?.supportedBlockchains && props?.supportedBlockchains?.length > 0 ? (
                props?.supportedBlockchains?.map((chain, index) => (
                  <img
                    src={`${chainIcons[chain] || '/svg/ETH.svg'}`}
                    alt="Token"
                    className="h-3 w-auto -ml-1"
                    key={index}
                  />
                ))
              ) : (
                <img src={`${props.tokenImage || '/svg/ETH.svg'}`} alt="Token" className="h-3 w-auto" />
              )}
            </div>
          </div>
        </div>

        <ReactTooltip
          id={`disabled-make-payment-wallet-${props?.id}`}
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg"
        >
          {!props?.isSelectedChainSupported
            ? 'Your current wallet does not support the selected network. To use this wallet on this network, please go to the wallets settings and edit the chain configuration.'
            : 'You do not have permission to initiate a payment from this wallet address. To proceed, please connect to the respective wallet.'}
        </ReactTooltip>
      </>
    ) : (
      <div className="w-full flex items-center whitespace-nowrap rounded text-sm leading-5 font-medium font-inter justify-between ">
        <div className="flex flex-1 items-center gap-3 max-w-[70%] pr-3">
          <div className="flex-shrink-0">
            <Avvvatars style="shape" size={24} value={props.label} />
          </div>
          <div className="text-grey-800 truncate max-w-[120px]">{props.label}</div>
          <div className="text-grey-700  truncate">{`${fiatCurrencySetting?.symbol}${props.totalPrice}`}</div>
        </div>
        <div className="flex items-center truncate">
          <div className="text-grey-700 p-0">{toShort(props.address, 5, 4)}</div>
          <DividerVertical height="h-4" space="mx-4" />
          <div className="flex items-center w-fit min-w-[50px] h-6">
            {props?.supportedBlockchains && props?.supportedBlockchains?.length > 0 ? (
              props?.supportedBlockchains?.map((chain, index) => (
                <img
                  src={`${chainIcons[chain] || '/svg/ETH.svg'}`}
                  alt="Token"
                  className="h-3 w-auto -ml-1"
                  key={index}
                />
              ))
            ) : (
              <img src={`${props.tokenImage || '/svg/ETH.svg'}`} alt="Token" className="h-3 w-auto" />
            )}
          </div>
        </div>
      </div>
    )
  ) : (
    <div className="text-sm font-medium text-[#B5B5B3]">Search or select a wallet</div>
  )
}
export default FormatOptionLabel
