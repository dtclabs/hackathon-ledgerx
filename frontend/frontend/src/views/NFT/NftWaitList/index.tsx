import Image from 'next/image'
import { FC, useState } from 'react'
import NftImage from '@/public/image/nft-whitelist.png'
import Bell from '@/public/image/bell.png'
import Loader from '@/components/Loader/Loader'
import Button from '@/components-v2/atoms/Button'
import NFTWaitlistModal from '../components/NFTWaitlistModal'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetNftWaitlistQuery } from '@/api-v2/nft/nfts-api'

const NftWaitList: FC = () => {
  const organizationId = useOrganizationId()
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const { data, isLoading } = useGetNftWaitlistQuery(
    { organizationId: organizationId as string },
    { skip: !organizationId }
  )
  const isWhitelisted = data?.find((item) => item.featureName === 'nft')

  const handleOnOpenWaitlistModal = (e) => {
    setIsWaitlistModalOpen(true)
  }
  const handleSuccessSubmitWaitlist = () => {
    setIsWaitlistModalOpen(false)
  }
  return (
    <div className="flex flex-col items-center">
      <div className="text-[24px] leading-[32px] font-bold font-epilogue pt-[126px]">
        View all your NFTs in one place
      </div>
      <div className="text-[14px] leading-[18px] text-[#777675] font-[400] mb-[32px] font-inter w-[560px] text-center">
        Import your wallet and get insights into all your NFTs such as current value, cost basis, unrealised gains and
        losses, and top traits.
      </div>
      <div className="mb-[2rem]">
        <Image src={NftImage} alt="nft banner" width={624} height={384} />
      </div>
      {isLoading ? (
        <div className="animate-spin m-auto">
          <div className=" rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
        </div>
      ) : isWhitelisted ? (
        <div className="font-[600] text-[#777675] text-[14px] w-[410px] leading-[18px] text-center font-inter">
          Thank you for registering your interest!
          <br />
          Our team will reach out to you once the NFT feature is ready.
        </div>
      ) : (
        <>
          <Button
            variant="black"
            classNames="text-[14px] text-white w-[243] text-center"
            onClick={handleOnOpenWaitlistModal}
            leadingIcon={<Image src={Bell} alt="external-link" height={16} width={16} />}
            height={48}
            label="Notify Me When Available"
          />
          <NFTWaitlistModal
            showModal={isWaitlistModalOpen}
            setShowModal={setIsWaitlistModalOpen}
            onSuccessSubmitWaitlist={handleSuccessSubmitWaitlist}
          />
        </>
      )}
    </div>
  )
}

export default NftWaitList
