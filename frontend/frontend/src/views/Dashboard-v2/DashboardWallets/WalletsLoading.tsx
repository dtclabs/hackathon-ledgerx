/* eslint-disable react/no-array-index-key */
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

const WalletsLoading = () => (
  <div className="mt-4">
    {[...Array(5).keys()].map((item, index) => (
      <div
        key={index}
        className="flex flex-row gap-6 h-[80px] items-center"
        style={{ borderBottom: '1px solid #F1F1EF' }}
      >
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={80} />
          <SkeletonLoader variant="rounded" height={8} width={110} />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={50} />
          <SkeletonLoader variant="rounded" height={8} width={90} />
        </div>
        <div className="flex  justify-end basis-1/3">
          <div>
            <SkeletonLoader variant="rounded" height={12} width={100} />
            <div className="flex justify-end">
              <SkeletonLoader variant="rounded" height={8} width={30} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default WalletsLoading
