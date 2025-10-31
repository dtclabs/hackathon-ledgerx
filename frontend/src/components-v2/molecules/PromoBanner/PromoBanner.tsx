/* eslint-disable react/no-unescaped-entities */
import Close from '@/public/svg/close.svg'
import { Button } from '@/components-v2'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import { isMonetisationEnabled } from '@/config-v2/constants'
import { format } from 'date-fns'
import { getUTCDate } from '@/utils/getUTCDate'
import WarningIcon from '@/public/svg/icons/warning-icon-triangle.svg'
import { useMemo } from 'react'
import { SubscriptionStatus } from '@/api-v2/subscription-api'
import { useOrganizationId } from '@/utils/getOrganizationId'

const PromoBanner = ({ onClose, onClickCTA, expiryDate, plan }) => {
  const organizationId = useOrganizationId()
  const daysLeft = useMemo(() => {
    if (plan?.expiredAt && plan?.status !== SubscriptionStatus.EXPIRED) {
      const diff = new Date(plan?.expiredAt).getTime() - new Date().getTime()
      return Math.floor(diff / (1000 * 3600 * 24)) + 1
    }
    return 0
  }, [plan?.expiredAt, plan?.status])

  if (isMonetisationEnabled) {
    return (
      <div className="px-4 py-2">
        <div className="bg-[#FDF77D] h-[52px]  rounded-lg font-inter font-semibold flex items-center px-6">
          <Typography
            styleVariant="semibold"
            color="dark"
            classNames="flex items-center justify-center flex-1 ml-[110px]"
          >
            {plan?.status === SubscriptionStatus.EXPIRED ? (
              <div className="flex items-center gap-2">
                <Image src={WarningIcon} width={16} height={16} /> Your free trial has expired. Buy a plan to unlock
                access.
              </div>
            ) : (
              `${daysLeft} ${
                daysLeft <= 1 ? 'day' : 'days'
              } left in free trial. Buy a plan to continue enjoying full access.`
            )}
          </Typography>
          <div className="flex items-center gap-4">
            <Button
              variant="outlined"
              color="primary"
              onClick={onClickCTA}
              className="hover:!bg-[#EBE575] hover:!text-black-0"
            >
              See Plans
            </Button>
            <Image
              src={Close}
              width={12}
              height={12}
              className="cursor-pointer"
              onClick={() => {
                onClose()
                if (!window.sessionStorage.getItem('show_banner_monetisation')) {
                  window.sessionStorage.setItem('show_banner_monetisation', JSON.stringify([organizationId]))
                } else {
                  const currentBannerOrgs = JSON.parse(window.sessionStorage.getItem('show_banner_monetisation'))
                  window.sessionStorage.setItem(
                    'show_banner_monetisation',
                    JSON.stringify([...currentBannerOrgs, organizationId])
                  )
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      <div className="bg-[#FDF77D] h-[52px]  rounded-lg font-inter font-semibold flex items-center px-6">
        <p className="flex items-center justify-center flex-1">
          Welcome! Enjoy unlimited access to ledgerx.com until{' '}
          {expiryDate ? format(getUTCDate(expiryDate), 'do LLLL yyyy') : ''}!
        </p>
        <div className="flex items-center gap-4">
          <Button
            variant="outlined"
            color="primary"
            onClick={onClickCTA}
            className="hover:!bg-[#EBE575] hover:!text-black-0"
          >
            Learn More
          </Button>
          <Image
            src={Close}
            width={12}
            height={12}
            className="cursor-pointer"
            onClick={() => {
              onClose()
              window.sessionStorage.setItem('show_banner', 'false')
            }}
          />
        </div>
      </div>
    </div>
  )
}
export default PromoBanner
