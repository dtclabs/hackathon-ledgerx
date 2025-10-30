import Image from 'next/legacy/image'
import Typography, { ITypographyProps } from '@/components-v2/atoms/Typography'
import { truncateString } from '@/utils-v2/string-utils'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { v4 as uuidv4 } from 'uuid'
import ReactTooltip from 'react-tooltip'

interface ChildProps {
  children?: React.ReactNode
  address: string
  split?: number
  id?: string
}
interface WalletComponentWithChildren extends React.FC<ChildProps & Partial<ITypographyProps>> {
  Copy: React.FC<IShareProps>
  Link: React.FC<ILinkProps>
  Tooltip: React.FC<ITooltipProps>
}

interface ITooltipProps {
  children: any
  id?: any
  maxWidth?: string
}

export interface ILinkProps {
  address: string
  options?: any[]
  placement?: 'left' | 'right'
  isMultiple?: boolean
  blockExplorer?: string
  linkType?: 'address' | 'transaction'
}

interface IShareProps {
  address: string
}

interface ChildComponentProps {
  id: string
}

export const WalletAddress: WalletComponentWithChildren = ({
  children,
  address,
  split = 3,
  variant = 'body2',
  color = 'secondary',
  styleVariant = 'regular',
  id = uuidv4()
}) => (
  <div className="flex flex-row items-center">
    <Typography
      data-tip={`wallet_copy_${id}`}
      data-for={`wallet_copy_${id}`}
      variant={variant}
      color={color}
      styleVariant={styleVariant}
    >
      {address ? truncateString(address, split) : '-'}
    </Typography>
    <div className="flex flex-row gap-2 ml-2">
      {React.Children.map(children, (child) => {
        if (React.isValidElement<ChildComponentProps>(child)) {
          return React.cloneElement(child, { id })
        }
        return child
      })}
    </div>
  </div>
)

const LinkComponent: React.FC<ILinkProps> = ({
  options,
  address,
  isMultiple = true,
  blockExplorer = 'https://etherscan.io/',
  placement = 'right',
  linkType = 'address'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    setIsOpen(false)
  })
  const explorerUrlType = linkType === 'address' ? 'address' : 'tx'
  return isFeatureEnabledForThisEnv && isMultiple ? (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="flex items-center !text-[#858585]"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <SVGIcon name="ExternalLinkIcon" width={16} height={16} strokeWidth={1} stroke="#858585" />
      </button>
      {isOpen ? (
        <div
          className={`absolute mt-1 z-10 ${
            placement === 'right' ? 'left-0' : 'right-0'
          } rounded-md shadow-lg bg-white border w-[200px]`}
        >
          <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {options?.map((option) => (
              <button
                key={option.id}
                type="button"
                className="px-3 py-2 flex items-center text-sm text-dashboard-main font-medium gap-3 w-full hover:bg-gray-100 truncate"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(`${option.blockExplorer}${explorerUrlType}/${address}`, '_blank')
                  setIsOpen(false)
                }}
              >
                <Image src={option.imageUrl} width={18} height={18} />
                <p className="truncate max-w-[82%]">{option.name}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  ) : (
    <button
      type="button"
      className="flex items-center"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(`${blockExplorer}address/${address}`, '_blank')
      }}
    >
      <SVGIcon name="ExternalLinkIcon" width={16} height={16} strokeWidth={1} stroke="#858585" />
    </button>
  )
}

const ShareComponent = ({ address }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      navigator.clipboard.writeText(`${address}`)
      toast.success('Copied successfully', {
        position: 'top-right',
        pauseOnHover: false
      })
    }}
  >
    <SVGIcon name="CopyIcon" width={16} height={16} strokeWidth={1} stroke="#858585" />
  </button>
)

const Tooltip: React.FC<ITooltipProps> = ({ children, id, maxWidth }) => (
  <ReactTooltip
    id={`wallet_copy_${id}`}
    borderColor="#eaeaec"
    border
    backgroundColor="white"
    textColor="#111111"
    effect="solid"
    place="right"
    className="!opacity-100 !rounded-lg"
  >
    <Typography
      classNames={`${maxWidth ? `max-w-[${maxWidth}px]` : 'max-w-[250px]'}`}
      variant="caption"
      color="secondary"
    >
      {children}
    </Typography>
  </ReactTooltip>
)

WalletAddress.Tooltip = Tooltip
WalletAddress.Link = LinkComponent
WalletAddress.Copy = ShareComponent

export default WalletAddress
