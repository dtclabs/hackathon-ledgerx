/* eslint-disable react/no-array-index-key */
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

interface Params {
    value?: boolean
  }
const Assetsv2Loading = ({value}:Params) => (
    <div className="mt-4" style={{ backgroundColor: '#fafafa'}}>
       {!value &&( <div style={{ backgroundColor: '#FFFFFF' } }>
        <div className="flex flex-row mt-4 gap-6" >
          <div className="mt-2">
          <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
          <div className="mt-2">
            <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
          <div className="mt-2">
          <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
        </div>

        <div className="flex flex-row mt-4 gap-6">
          <div className="basis-7/12" style={{marginTop:'-6px'}}>
          <SkeletonLoader variant="rounded" height={12} width="50%"/>
          </div>
          <div>
            <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
          <div className="">
          <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
          <div className="">
          <SkeletonLoader variant="rounded" height={12} width={100} />
          </div>
          <div className="">
          <SkeletonLoader variant="circle" size={28} />
          </div>
        </div>
        </div>
       )}
    {[...Array(4).keys()].map((item, index) => (
        <div style={{ backgroundColor: '#FFFFFF' }} >
            <div className="flex flex-row mt-4 gap-6">
                <div className="mt-1">
                    <SkeletonLoader variant="circle" size={28} />
                </div>
                <div className="mt-2">
                    <SkeletonLoader variant="rounded" height={12} width={100} />
                </div>
                <div className="mt-2">
                    <SkeletonLoader variant="rounded" height={12} width={20} />
                </div>
            </div>
            <div
                key={index}
                className="flex flex-row gap-6 h-[96px] items-center mb-6"
                style={{ borderTop: '1px solid #F1F1EF' }}>
                <div className="basis-2/12">
                    <SkeletonLoader variant="rounded" height={12} width={150} />
                    <SkeletonLoader variant="rounded" height={8} width="100%" />
                </div>
                <div className="basis-2/12">
                    <SkeletonLoader variant="rounded" height={12} width={150} />
                    <SkeletonLoader variant="rounded" height={8} width="100%" />
                </div>
                <div className="basis-2/12">
                    <SkeletonLoader variant="rounded" height={12} width={150} />
                    <SkeletonLoader variant="rounded" height={8} width="100%" />
                </div>
                <div className="basis-2/12">
                    <SkeletonLoader variant="rounded" height={12} width={150} />
                    <SkeletonLoader variant="rounded" height={8} width="100%" />
                </div>
                <div className="basis-2/12">
                    <SkeletonLoader variant="rounded" height={12} width={150} />
                    <SkeletonLoader variant="rounded" height={8} width="100%" />
                </div>
            </div>
        </div>
    ))}
  </div>
)



export default Assetsv2Loading
