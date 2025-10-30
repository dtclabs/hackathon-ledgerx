/* eslint-disable no-case-declarations */
// Libraries
import { useAppDispatch, useAppSelector } from '@/state'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// Assets
import Disperse from '@/public/svg/Disperse.svg'
import Gnosis from '@/public/svg/Gnosis.svg'

// Selectors
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { resetTransferSlice } from '@/slice/transfer/transfer.slice'

// Components
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import View, { Header } from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { CreatePayment, ReviewPayment } from '../sections'

const TransferView = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isBannerVisible = useAppSelector(showBannerSelector)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))
  const paymentStep = router.query?.step ?? 'create'
  const organizationId = useOrganizationId()

  const breadcrumbItems = [
    { to: `/${organizationId}/transfer`, label: 'Make Payment' },
    { to: `/${organizationId}/transfer/crypto`, label: 'Crypto to Crypto' }
  ]

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!url.includes('transfer')) {
        dispatch(resetTransferSlice())
      }
    }

    router.events.on('routeChangeStart', handleRouteChange)

    return () => router.events.off('routeChangeStart', handleRouteChange)
  }, [dispatch, router])

  return (
    <>
      <Header>
        {isOffRampEnabled ? (
          <div className="flex items-center">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] p-[0.5rem]"
              leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
              onClick={() => router.back()}
            />
            <Breadcrumb>
              {breadcrumbItems.map(({ to, label }) => (
                <Link key={to} href={to} legacyBehavior>
                  {label}
                </Link>
              ))}
            </Breadcrumb>
          </div>
        ) : (
          <Header.Left>
            <Header.Left.Title>Make Payment</Header.Left.Title>
            <DividerVertical height="h-6" space="mx-4" />
            <Typography variant="caption" styleVariant="semibold" classNames="text-gray-700">
              Powered by
            </Typography>
            <div className="px-1">
              <Image src={Disperse} width={14} height={14} />
            </div>
            <Typography variant="caption" styleVariant="underline" href="https://disperse.app/">
              Disperse
            </Typography>
            <Typography variant="caption" classNames="text-gray-700 text-sm px-2">
              &amp;
            </Typography>
            <div className="pr-1">
              <Image src={Gnosis} width={14} height={14} />
            </div>
            <Typography variant="caption" styleVariant="underline" href="https://app.safe.global/welcome">
              Safe
            </Typography>
          </Header.Left>
        )}
      </Header>
      <View.Content className={isBannerVisible ? '!h-[calc(100vh-328px)] mr-0' : '!h-[calc(100vh-260px)] mr-0'}>
        {paymentStep === 'create' ? <CreatePayment /> : <ReviewPayment />}
      </View.Content>
    </>
  )
}

export default TransferView
