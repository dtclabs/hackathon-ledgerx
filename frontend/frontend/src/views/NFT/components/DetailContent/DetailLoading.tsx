import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

export const NftDetailLoading = () => (
  <div className="w-full flex flex-col gap-8">
    <div className="flex gap-8 w-full">
      <SkeletonLoader height={400} width={400} variant="rounded" />
      <div className="flex flex-col gap-4">
        <SkeletonLoader height={14} width={100} variant="rounded" />
        <SkeletonLoader height={20} width={800} variant="rounded" />
        <SkeletonLoader height={130} width={800} variant="rounded" />
        <SkeletonLoader height={90} width={800} variant="rounded" />
        <SkeletonLoader height={90} width={800} variant="rounded" />
      </div>
    </div>
    <SkeletonLoader height={230} width={1232} variant="rounded" />
  </div>
)

export const CollectionDetailLoading = () => (
  <div className="w-full flex flex-col gap-8">
    <div className="flex gap-8 w-full">
      <SkeletonLoader width={112} height={112} variant="rounded" />
      <div className="flex flex-col gap-4">
        <SkeletonLoader height={20} width={200} variant="rounded" />
        <SkeletonLoader height={90} width={1100} variant="rounded" />
      </div>
    </div>
    <SkeletonLoader height={130} width={1232} variant="rounded" />
    <SkeletonLoader height={230} width={1232} variant="rounded" />
  </div>
)
