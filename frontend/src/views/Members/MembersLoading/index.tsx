/* eslint-disable react/no-array-index-key */
import Typography from '@/components-v2/atoms/Typography'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

const MembersLoading = ({ isInviteTab = false }: { isInviteTab?: boolean }) =>
  isInviteTab ? (
    <div className="mt-4 border">
      <div className="bg-grey-100 rounded-t-lg flex flex-row gap-6 px-6 items-center">
        <div className="basis-[20%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Name
          </Typography>
        </div>
        <div className="basis-[10%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Role
          </Typography>
        </div>
        <div className="basis-[18%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Date Invited
          </Typography>
        </div>
        <div className="basis-[15%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Invited By
          </Typography>
        </div>
        <div className="basis-[15%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Status
          </Typography>
        </div>
        <div className="basis-[22%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Actions
          </Typography>
        </div>
      </div>
      {[...Array(5).keys()].map((item, index) => (
        <div
          key={index}
          className="flex flex-row gap-6 h-[80px] items-center px-6"
          style={{ borderBottom: '1px solid #F1F1EF' }}
        >
          <div className="basis-[20%]">
            <SkeletonLoader variant="rounded" height={14} width={80} />
            <SkeletonLoader variant="rounded" height={10} width={110} />
          </div>
          <div className="basis-[10%]">
            <SkeletonLoader variant="rounded" height={14} width={50} />
          </div>
          <div className="basis-[18%]">
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
          <div className="basis-[15%]">
            <SkeletonLoader variant="rounded" height={14} width={100} />
          </div>
          <div className="basis-[15%]">
            <SkeletonLoader variant="rounded" height={14} width={100} />
          </div>
          <div className="basis-[22%]">
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-4 border">
      <div className="bg-grey-100 rounded-t-lg flex flex-row gap-6 px-6 items-center">
        <div className="basis-[28%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Name
          </Typography>
        </div>
        <div className="basis-[18%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Role
          </Typography>
        </div>
        <div className="basis-[28%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Date Added
          </Typography>
        </div>
        <div className="basis-[26%] py-3">
          <Typography variant="caption" color="primary" styleVariant="medium">
            Actions
          </Typography>
        </div>
      </div>
      {[...Array(5).keys()].map((item, index) => (
        <div
          key={index}
          className="flex flex-row gap-6 h-[80px] items-center px-6"
          style={{ borderBottom: '1px solid #F1F1EF' }}
        >
          <div className="basis-[28%]">
            <SkeletonLoader variant="rounded" height={14} width={80} />
            <SkeletonLoader variant="rounded" height={10} width={110} />
          </div>
          <div className="basis-[18%]">
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
          <div className="basis-[28%]">
            <SkeletonLoader variant="rounded" height={14} width={150} />
          </div>
          <div className="basis-[26%]">
            <SkeletonLoader variant="rounded" height={14} width={100} />
          </div>
        </div>
      ))}
    </div>
  )

export default MembersLoading
