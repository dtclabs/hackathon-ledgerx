import { FC } from 'react'
import Image from 'next/legacy/image'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'

interface IAssetChainGroupImage {
  assetImageUrl: string
  assetImageSize?: number
  chainImageUrl: string
}

const AssetChainGroupImage: FC<IAssetChainGroupImage> = ({ assetImageUrl, chainImageUrl }) => (
  <div className="h-[28px] relative">
    <Image src={assetImageUrl} alt="asset" className="z-[1]" width={28} height={28} />
    {/* {isFeatureEnabledForThisEnv && (
      <img
        src={chainImageUrl}
        alt="chain"
        className="z-[2] absolute bottom-[-2px] right-[-2px] rounded-[4px]"
        width={12}
        height={12}
      />
    )} */}
  </div>
)

export default AssetChainGroupImage
