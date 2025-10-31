/* eslint-disable react/no-unescaped-entities */
import { Button } from '@/components-v2'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import LargeClock from '@/public/svg/icons/large-clock.svg'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'

const NoWalletsView = () => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const showBanner = useAppSelector(showBannerSelector)

  const handleOnClick = () => {
    router.push(`/${organizationId}/wallets`)
  }
  return (
    <div
      className={`${
        showBanner ? 'h-[calc(100vh-302px)]' : 'h-[calc(100vh-234px)]'
      } flex justify-center items-center flex-col`}
      style={{ border: '1px solid #F1F1EF' }}
    >
      <Image src={LargeClock} />
      <p className="mt-6 text-sm" style={{ fontWeight: 600, color: '#535251', fontSize: 14 }}>
        Don't see any past transactions?
      </p>
      <p style={{ fontWeight: 400, color: '#777675', fontSize: 14 }} className="mb-8 mt-2 text-sm">
        Import your wallet to view transactions.
      </p>
      <Button size="lg" onClick={handleOnClick}>
        <p className="text-sm">Import Wallet</p>
      </Button>
    </div>
  )
}

export default NoWalletsView
