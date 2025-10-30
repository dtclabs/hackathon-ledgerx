import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useRouter } from 'next/router'
import { BaseModal } from '../Modals/BaseModal'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import CheckIcon from '@/public/svg/icons/check-icon.svg'
import Image from 'next/legacy/image'

const WelcomeFreeTrialModal = ({ provider, orgName }) => {
  const router = useRouter()
  const organisationId = useOrganizationId()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  const handleRedirectToSeePlan = () => {
    router.push(`/${organisationId}/orgsettings?activeTab=pricingAndPlans`)
    provider.methods.setIsOpen(false)
    triggerSendAnalysis({
      eventType: 'SEE_PLANS_FREE_TRIAL_MODAL',
      metadata: {
        organizationId: organisationId
      }
    })
  }

  return (
    <BaseModal provider={provider} classNames="rounded-3xl w-[600px]">
      <BaseModal.Header>
        <BaseModal.Header.CloseButton
          onClose={() => {
            window.history.replaceState(null, '', `/${router.query.organizationId}/dashboard`)
            triggerSendAnalysis({
              eventType: 'CLOSE_FREE_TRIAL_MODAL',
              metadata: {
                organizationId: organisationId
              }
            })
          }}
        />
      </BaseModal.Header>
      <BaseModal.Body>
        <div className="flex flex-col gap-8 mb-6 mt-8">
          <Typography color="primary" variant="heading1" classNames="text-center px-6">
            Your 30-day free trial has started for {orgName}!
          </Typography>
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

export default WelcomeFreeTrialModal
