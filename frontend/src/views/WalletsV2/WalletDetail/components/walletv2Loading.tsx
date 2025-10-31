/* eslint-disable react/no-array-index-key */
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

interface Params {
    walletDetail?: boolean
    balanceDetail?: boolean
  }
const Walletv2Loading = ({walletDetail,balanceDetail} :Params) => (
    <div className="">
     {walletDetail &&( <div className="flex flex-row gap-20  items-center" >
        <div className="basis-1/3">
            <SkeletonLoader variant="rounded" height={12} width={180} />
            <SkeletonLoader variant="rounded" height={8} width="100%" />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={180} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={180} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={180} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={12} width={180} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
        </div>
      </div>
     )}
     {balanceDetail &&(  
     <div className="basis-1/3 flex flex-row gap-20 mt-5 ">
        <div className="basis-1/3">
            <SkeletonLoader variant="rounded" height={8} width="80%" />
            <SkeletonLoader variant="rounded" height={20} width={180} />
        </div>
        <div className="basis-1/3">
          <SkeletonLoader variant="rounded" height={8} width={100} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
          <SkeletonLoader variant="rounded" height={8} width="50%" />
        </div>
        <div className="basis-1/3">
        <SkeletonLoader variant="rounded" height={8} width={100} />
          <SkeletonLoader variant="rounded" height={8} width="100%" />
          <SkeletonLoader variant="rounded" height={8} width="50%" />
        </div>
      </div>
     )}
  </div>
)



export default Walletv2Loading
