import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '../Modals/BaseModal'
import CloseIconHover from '@/public/svg/icons/close-icon-hover.svg'
import Image from 'next/legacy/image'
import AppIntroduction from '@/public/content/app-introduction.png'
import CheckIcon from '@/public/svg/icons/check-icon.svg'
import Button from '@/components-v2/atoms/Button'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import CheckboxCustom from '@/components-v2/atoms/CheckBoxCustom'
import { useState, ChangeEvent, useMemo, useEffect } from 'react'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'

const ExpiredModal = ({ provider, planName }) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false)
  const router = useRouter()
  const organisationId = useOrganizationId()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  useEffect(() => {
    setDontShowAgain(false)
  }, [organisationId])

  const handleRedirectToBuy = () => {
    router.push(`/${organisationId}/orgsettings?activeTab=pricingAndPlans`)
    provider.methods.setIsOpen(false)
    const currentLocalStorageItem = JSON.parse(window.localStorage.getItem('do-not-show-expired-modals-for-orgs'))
    if (dontShowAgain) {
      if (currentLocalStorageItem) {
        window.localStorage.setItem(
          'do-not-show-expired-modals-for-orgs',
          JSON.stringify([...currentLocalStorageItem, organisationId])
        )
      } else {
        window.localStorage.setItem('do-not-show-expired-modals-for-orgs', JSON.stringify([organisationId]))
      }
    }

    triggerSendAnalysis({
      eventType: 'SEE_PLANS_EXPIRATION_MODAL',
      metadata: {
        organizationId: organisationId,
        planName
      }
    })
  }

  const handleChangeTrial = (e: ChangeEvent<HTMLInputElement>) => {
    setDontShowAgain(e.target.checked)
  }

  const subscriptionPlanName = useMemo(() => {
    if (planName === 'free_trial') {
      return 'free trial'
    }
    if (planName === 'starter') {
      return 'Starter plan'
    }
    return 'Business plan'
  }, [planName])

  return (
    <BaseModal provider={provider} width="780" classNames="rounded-3xl w-[780px]">
      <BaseModal.Body extendedClass="!p-0 !m-0 relative">
        <div className="absolute right-6 top-6">
          <Image
            onClick={(e) => {
              e.stopPropagation()
              provider.methods.setIsOpen(false)
              const currentLocalStorageItem = JSON.parse(
                window.localStorage.getItem('do-not-show-expired-modals-for-orgs')
              )
              if (dontShowAgain) {
                if (currentLocalStorageItem) {
                  window.localStorage.setItem(
                    'do-not-show-expired-modals-for-orgs',
                    JSON.stringify([...currentLocalStorageItem, organisationId])
                  )
                } else {
                  window.localStorage.setItem('do-not-show-expired-modals-for-orgs', JSON.stringify([organisationId]))
                }
              }
              triggerSendAnalysis({
                eventType: 'CLOSE_EXPIRATION_MODAL',
                metadata: {
                  organizationId: organisationId,
                  planName
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
          <div className="w-[400px] p-8 flex flex-col gap-8">
            <Typography color="primary" variant="heading2">
              Your {subscriptionPlanName} has expired. Buy a plan to unlock access.
            </Typography>
            <Typography color="secondary" classNames="flex-1">
              Become financially organised with our powerful features.
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                  <Image src={CheckIcon} width={12} height={12} />
                </div>
                <Typography color="secondary" classNames="flex-1">
                  Import unlimited wallets
                </Typography>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                  <Image src={CheckIcon} width={12} height={12} />
                </div>
                <Typography color="secondary" classNames="flex-1">
                  Manage up to 10,000 transactions
                </Typography>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                  <Image src={CheckIcon} width={12} height={12} />
                </div>
                <Typography color="secondary" classNames="flex-1">
                  Monitor your assets
                </Typography>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-[#FDF455] flex items-center">
                  <Image src={CheckIcon} width={12} height={12} />
                </div>
                <Typography color="secondary" classNames="flex-1">
                  Integrate with your accounting softwares (Xero, QuickBooks)
                </Typography>
              </div>
              <Typography color="secondary" classNames="flex-1">
                and much more!
              </Typography>
              <CheckboxCustom
                label="Do not show this message again"
                checkboxGroupName="trial"
                id="trial"
                checked={dontShowAgain}
                onChange={handleChangeTrial}
                wrapperClassName="!bg-white !pl-0"
              />
            </div>
            <Button height={48} label="See Plans" variant="yellow" onClick={handleRedirectToBuy} />
          </div>
          <div className="bg-grey-200 p-[10px] flex flex-col justify-center items-center flex-1 rounded-r-3xl">
            <Image src={AppIntroduction} width={300} height={316} unoptimized />
          </div>
        </div>
      </BaseModal.Body>
    </BaseModal>
  )
}

export default ExpiredModal
