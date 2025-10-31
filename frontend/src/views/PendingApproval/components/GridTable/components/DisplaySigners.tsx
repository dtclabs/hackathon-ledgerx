import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

import GreenCheck from '@/public/svg/icons/check-success.svg'
import RedCross from '@/public/svg/icons/cancel-icon-red.svg'

const DisplaySigners = (params) => {
  const { data, isParsingTransactionOwnership } = params

  return (
    <div className="w-full h-full flex items-center gap-2">
      {isParsingTransactionOwnership ? (
        <SkeletonLoader variant="rounded" height={20} width={100} />
      ) : (
        <div className="w-full flex gap-2">
          <Image src={data?.isRejected ? RedCross : GreenCheck} alt="green-check" height={14} width={14} />
          <Typography color={data?.isRejected ? 'error' : 'success'}>
            {data?.confirmations?.length}/{data?.confirmationsRequired} {data?.isRejected ? 'Rejected' : 'Confirmed'}
          </Typography>

          {/* <Typography color="secondary" classNames="flex items-center align-middle">
            <span className="h-full grid place-items-center mr-2">
              <Image src={GreenCheck} alt="check-status" height={14} width={14} />
            </span>
            {data?.confirmations?.length}/{data?.confirmationsRequired} Approved
          </Typography> */}
        </div>
      )}
    </div>
  )
}
export default DisplaySigners
