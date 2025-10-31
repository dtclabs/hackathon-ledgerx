/* eslint-disable react/no-array-index-key */
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import DividerVertical from '@/components/DividerVertical/DividerVertical'

export const NFTsLoading = ({ rows = 8 }) => (
  <>
    {[...Array(rows).keys()].map((item, index) => (
      <div
        key={index}
        style={{
          boxShadow: '0px 0px 80px 0px rgba(0, 0, 0, 0.02), 0px 16px 48px -16px rgba(0, 0, 0, 0.02)'
        }}
        className="flex items-center justify-between text-sm px-6 py-4 rounded-lg"
      >
        <div className="flex items-center gap-3 laptop:w-[220px] w-[270px]">
          <SkeletonLoader variant="rounded" height={40} width={40} />
          <div className="flex flex-col space-between">
            <SkeletonLoader variant="rounded" height={13} width={120} />
            <SkeletonLoader variant="rounded" height={10} width={120} />
          </div>
        </div>
        <div className="flex justify-between laptop:w-[calc(100%-270px)] w-[calc(100%-320px)] gap-4">
          <div className="flex flex-col shrink w-1/5">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={120} />
          </div>
          <div className="flex flex-col shrink w-1/5">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={120} />
          </div>
          <div className="flex flex-col shrink w-1/5">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={100} />
            <SkeletonLoader variant="rounded" height={10} width={100} />
          </div>
          <div className="flex flex-col shrink w-1/5">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={100} />
            <SkeletonLoader variant="rounded" height={10} width={100} />
          </div>
          <div className="flex flex-col shrink w-1/5">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={120} />
          </div>
        </div>
      </div>
    ))}
  </>
)

export const CollectionsLoading = ({ rows = 8 }) => (
  <>
    {[...Array(rows).keys()].map((item, index) => (
      <div
        key={index}
        style={{
          boxShadow: '0px 0px 80px 0px rgba(0, 0, 0, 0.02), 0px 16px 48px -16px rgba(0, 0, 0, 0.02)'
        }}
        className="flex items-center px-6 py-4 rounded-lg"
      >
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-[22%] max-w-[250px] laptop:max-w-[200px]">
            <SkeletonLoader variant="rounded" height={40} width={40} />
            <div className="flex flex-col space-between">
              <SkeletonLoader variant="rounded" height={13} width={120} />
              <SkeletonLoader variant="rounded" height={10} width={120} />
            </div>
          </div>
          <div className="flex flex-col w-1/6">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={120} />
          </div>
          <div className="flex flex-col w-[12%]">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={20} />
          </div>
          <div className="flex flex-col w-1/6">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={100} />
            <SkeletonLoader variant="rounded" height={10} width={100} />
          </div>
          <div className="flex flex-col w-1/6">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={100} />
            <SkeletonLoader variant="rounded" height={10} width={100} />
          </div>
          <div className="flex flex-col w-1/6">
            <SkeletonLoader variant="rounded" height={13} width={80} />
            <SkeletonLoader variant="rounded" height={13} width={120} />
          </div>
        </div>
        <DividerVertical height="h-10" space="ml-4" />
        <div className="ml-4 mt-2">
          <SkeletonLoader variant="box" height={24} width={24} />
        </div>
      </div>
    ))}
  </>
)
