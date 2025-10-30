import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { FC, useMemo } from 'react'
import Image from 'next/legacy/image'
import WarningIcon from '@/public/svg/icons/warning-icon-triangle.svg'
import { SubscriptionStatus } from '@/api-v2/subscription-api'
import { EXPIRE_SOON_DAY } from '@/config-v2/constants'

interface IPlanStatusBox {
  expiredAt: string
  status: SubscriptionStatus
}

const PlanStatusBox: FC<IPlanStatusBox> = ({ expiredAt, status }) => {
  const router = useRouter()
  const organisationId = useOrganizationId()

  const parsedData = useMemo(() => {
    if (expiredAt && status !== SubscriptionStatus.EXPIRED) {
      const diff = new Date(expiredAt).getTime() - new Date().getTime()
      const daysLeft = Math.floor(diff / (1000 * 3600 * 24)) + 1
      return {
        daysLeft,
        percentage: (daysLeft / 30) * 100
      }
    }
    return {}
  }, [status, expiredAt])

  const handleRedirectToBuy = () => {
    router.push(`/${organisationId}/orgsettings?activeTab=pricingAndPlans`)
  }

  return (
    <div className="p-4 bg-[#FFFDE2] border border-[#FCF22D] flex flex-col items-center justify-center gap-4">
      {status === SubscriptionStatus.EXPIRED ? (
        <div className="flex items-start gap-2">
          <Image src={WarningIcon} width={16} height={16} className="pt-1" />
          <Typography variant="caption" color="black" styleVariant="semibold">
            Your free trial has expired.
          </Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full text-center">
          <Typography variant="caption" color="black" styleVariant="semibold">
            {parsedData?.daysLeft} {parsedData?.daysLeft === 1 ? 'day' : 'days'} left in free trial
          </Typography>
          <div className="w-full h-1.5 flex bg-[#CECECC] rounded">
            <div
              style={{
                backgroundColor: `${parsedData?.daysLeft < EXPIRE_SOON_DAY ? '#C61616' : '#000019'}`,
                width: `${parsedData?.percentage}%`,
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      )}
      <Button
        classNames="w-full !text-xs"
        height={32}
        label="See Plans"
        variant="yellow"
        onClick={handleRedirectToBuy}
      />
    </div>
  )
}

export default PlanStatusBox
