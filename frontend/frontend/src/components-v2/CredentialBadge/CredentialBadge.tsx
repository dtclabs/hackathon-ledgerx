import { FC } from 'react'
import { ethers } from 'ethers'
import Image from 'next/legacy/image'
import parseAddress from '@/utils/parseWalletAddress'
import { SkeletonLoader } from '../molecules/SkeletonLoader'

interface ICredentialBadge {
  credential: string
  isLoading: boolean
}

const CredentialBadge: FC<ICredentialBadge> = ({ credential, isLoading = true }) => {
  const isAddress = ethers.utils.isAddress(credential)
  return (
    <div
      className="flex flex-row items-center px-3 py-2 rounded"
      style={{ backgroundColor: '#FBFAFA', border: '1px solid #F1F1EF' }}
    >
      <div className="flex justify-center" style={{ marginRight: 8 }}>
        <Image src="/svg/icons/avatar-1-icon.svg" width={30} height={30} alt="avatar-image" />
      </div>
      <div style={{ color: '#344054' }}>
        <div style={{ fontSize: 10 }}>Logged in via</div>
        {isLoading ? (
          <SkeletonLoader variant="label" />
        ) : (
          <div className="text-sm">{isAddress ? parseAddress(credential) : credential}</div>
        )}
      </div>
    </div>
  )
}

export default CredentialBadge
