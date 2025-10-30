import { FC } from 'react'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { toast } from 'react-toastify'

interface IWalletActionButtons {
  address: string
  gap?: string
}

const WalletAddressActionButtons: FC<IWalletActionButtons> = ({ address, gap = 'gap-2' }) => (
  <div className={`flex flex-row pl-2 ${gap}`}>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        // Todo: Change this to support multichain
        window.open(`https://etherscan.io/address/${address}`, '_blank')
      }}
    >
      <SVGIcon name="ExternalLinkIcon" width={14} height={14} />
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toast.success('Copied successfully', {
          position: 'top-right',
          pauseOnHover: false
        })
        navigator.clipboard.writeText(`${address}`)
      }}
    >
      <SVGIcon name="CopyIcon" width={14} height={14} />
    </button>
  </div>
)

export default WalletAddressActionButtons
