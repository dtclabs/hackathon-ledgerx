import ReactTooltip from 'react-tooltip'
import Image from 'next/legacy/image'
import InformationIcon from '@/public/svg/icons/info-icon-circle-black.svg'
import Typography from '@/components-v2/atoms/Typography'
import { format } from 'date-fns'

const SAFE_CHAIN_MAP = {
  ethereum: 'eth',
  polygon: 'matic',
  bsc: 'bnb',
  arbitrum_1: 'arb1',
  sepolia: 'sep',
  optimism: 'oeth',
  gnosis_chain: 'gno'
}

const DisplayTo = (params) => {
  const { data, rowIndex } = params

  const url = `https://app.safe.global/transactions/queue?safe=${SAFE_CHAIN_MAP[data?.blockchainId]}:${
    data?.wallet?.address
  }`

  return (
    <div className="h-full flex items-center">
      <div>
        {data?.isUnknown ? (
          <div className="flex items-center  gap-2 h-[30px] -mb-1">
            <Typography variant="body2">Unknown Transaction</Typography>
            <div
              className="cursor-pointer mt-1"
              data-tip={`incoming-icon-${rowIndex}`}
              data-for={`incoming-icon-${rowIndex}`}
            >
              <Image src={InformationIcon} height={15} width={15} />
            </div>
            <ReactTooltip
              id={`incoming-icon-${rowIndex}`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              clickable
              delayHide={200}
              className="!opacity-100 !rounded-lg !my-1"
            >
              We currently only support transfer transactions. For details on this transaction, please refer to the{' '}
              <span
                aria-hidden
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(url)
                }}
                className="underline cursor-pointer"
              >
                Gnosis Safe app.
              </span>
            </ReactTooltip>
          </div>
        ) : (
          <Typography variant="body2">
            {data?.isRejected
              ? 'On-Chain Rejection'
              : `${data?.recipients?.length} Recipient${data?.recipients?.length > 1 ? 's' : ''}`}
          </Typography>
        )}

        <Typography classNames="mt-1" color="secondary" variant="caption">
          {data?.submissionDate ? format(new Date(data?.submissionDate), 'do MMM yyyy, h:mm a') : '-'}
        </Typography>
      </div>
    </div>
  )
}
export default DisplayTo
