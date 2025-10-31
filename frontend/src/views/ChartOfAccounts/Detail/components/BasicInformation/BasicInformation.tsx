import Typography from '@/components-v2/atoms/Typography'
import React from 'react'
import { IChartOfAccountDetail } from '@/api-v2/chart-of-accounts'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

interface IProps {
  chartOfAccount: IChartOfAccountDetail
  isLoading?: boolean
}

const CoABasicInformation: React.FC<IProps> = ({ chartOfAccount, isLoading }) => (
  <div className="mt-5 p-2 flex flex-col gap-6">
    <Typography variant="body1" classNames="font-semibold" color="primary">
      Basic Information
    </Typography>
    <div className="flex items-center">
      <Typography variant="body1" classNames="w-[300px]" color="secondary">
        Code
      </Typography>
      <Typography variant="body1" classNames="flex-1" color="primary">
        {isLoading ? <SkeletonLoader variant="rounded" width={50} height={18} /> : chartOfAccount?.code ?? '-'}
      </Typography>
    </div>
    <div className="flex items-center">
      <Typography variant="body1" classNames="w-[300px]" color="secondary">
        Name
      </Typography>
      <Typography variant="body1" classNames="flex-1" color="primary">
        {isLoading ? <SkeletonLoader variant="rounded" width={200} height={18} /> : chartOfAccount?.name}
      </Typography>
    </div>
    <div className="flex items-center">
      <Typography variant="body1" classNames="w-[300px]" color="secondary">
        Type
      </Typography>
      <Typography variant="body1" classNames="flex-1" color="primary">
        {isLoading ? <SkeletonLoader variant="rounded" width={100} height={18} /> : chartOfAccount?.type}
      </Typography>
    </div>
    <div className="flex items-center">
      <Typography variant="body1" classNames="w-[300px]" color="secondary">
        Description
      </Typography>
      <Typography variant="body1" classNames="flex-1" color="primary">
        {isLoading ? <SkeletonLoader variant="rounded" width={400} height={18} /> : chartOfAccount?.description ?? '-'}
      </Typography>
    </div>
  </div>
)

export default CoABasicInformation
