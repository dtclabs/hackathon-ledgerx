import { PlanName } from '@/api-v2/subscription-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import CheckIcon from '@/public/svg/icons/check-icon.svg'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { MAX_REPORT_MONTHS } from './interface'

const UpgradePlanModal = ({ provider, reportInterval, subscriptionPlan }) => {
  const router = useRouter()
  const organizationId = useOrganizationId()

  const handleRedirectToSeePlan = () => {
    router.push(`/${organizationId}/orgsettings?activeTab=pricingAndPlans`)
  }

  return (
    <BaseModal provider={provider} width="600">
      <BaseModal.Header>
        <BaseModal.Header.Title wraperClassName="w-[90%] mx-auto pt-6" className="text-center text-[32px]">
          Upgrade to see more than just {MAX_REPORT_MONTHS[subscriptionPlan?.planName || PlanName.FREE_TRIAL]}-month
          balances!
        </BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>
      <BaseModal.Body>
        <div className="flex flex-col gap-8 mb-6 mt-8">
          <Typography color="primary" variant="body1">
            Enjoy our powerful features for 30 days, completely free.
          </Typography>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                <Image src={CheckIcon} width={12} height={12} />
              </div>
              <Typography color="primary" classNames="flex-1">
                Import unlimited wallets
              </Typography>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                <Image src={CheckIcon} width={12} height={12} />
              </div>
              <Typography color="primary" classNames="flex-1">
                Manage up to 10,000 transactions
              </Typography>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                <Image src={CheckIcon} width={12} height={12} />
              </div>
              <Typography color="primary" classNames="flex-1">
                Monitor your assets
              </Typography>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                <Image src={CheckIcon} width={12} height={12} />
              </div>
              <Typography color="primary" classNames="flex-1">
                Integrate with your accounting softwares (Xero, QuickBooks)
              </Typography>
            </div>
            <Typography color="primary" classNames="flex-1">
              and much more!
            </Typography>
          </div>
          <Typography color="primary" variant="body1" classNames="text-center" styleVariant="semibold">
            Want to buy a plan? Choose a plan that works best for your business.
          </Typography>
          <Button height={48} label="See Plans" variant="yellow" onClick={handleRedirectToSeePlan} />
        </div>
      </BaseModal.Body>
    </BaseModal>
  )
}

export default UpgradePlanModal
