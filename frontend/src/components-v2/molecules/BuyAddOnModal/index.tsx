import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '../Modals/BaseModal'
import CloseIconHover from '@/public/svg/icons/close-icon-hover.svg'
import Image from 'next/legacy/image'
import AppIntroduction from '@/public/content/app-introduction.png'
import CheckIcon from '@/public/svg/icons/check-icon.svg'
import Button from '@/components-v2/atoms/Button'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toggleAddOnModal } from '@/slice/subscription/subscription-slice'
import { useAppDispatch } from '@/state'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'

const BuyAddOnModal = ({ provider }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const organisationId = useOrganizationId()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  const handleRedirectToUpgrade = () => {
    router.push(`/${organisationId}/orgsettings?activeTab=pricingAndPlans`)
    provider.methods.setIsOpen(false)
    dispatch(toggleAddOnModal(false))
    triggerSendAnalysis({
      eventType: 'CLICK_UPGRADE_ADDON_IN_MODAL',
      metadata: {
        organizationId: organisationId
      }
    })
  }

  return (
    <BaseModal provider={provider} width="720" classNames="rounded-3xl w-[720px]">
      <BaseModal.Body extendedClass="!p-0 !m-0 relative">
        <div className="absolute right-6 top-6">
          <Image
            onClick={(e) => {
              e.stopPropagation()
              provider.methods.setIsOpen(false)
              dispatch(toggleAddOnModal(false))
              triggerSendAnalysis({
                eventType: 'CLOSE_ADDON_MODAL',
                metadata: {
                  organizationId: organisationId
                }
              })
            }}
            className="cursor-pointer"
            src={CloseIconHover}
            height="40"
            width="40"
          />
        </div>
        <div className="flex">
          <div className="w-[320px] p-8 flex flex-col gap-8">
            <Typography color="primary" variant="heading2">
              Please upgrade to access this feature
            </Typography>
            <Typography color="secondary" classNames="flex-1">
              Become financially organised with our powerful features. Upgrade now to unlock full access.
            </Typography>
            <Button height={48} label="Upgrade" variant="yellow" onClick={handleRedirectToUpgrade} />
          </div>
          <div className="bg-grey-200 p-[10px] flex flex-col justify-center items-center flex-1 rounded-r-3xl">
            <Image src={AppIntroduction} width={300} height={316} unoptimized />
          </div>
        </div>
      </BaseModal.Body>
    </BaseModal>
  )
}

export default BuyAddOnModal
