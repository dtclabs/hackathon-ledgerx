/* eslint-disable react/no-unescaped-entities */
import Button from '@/components-v2/atoms/Button'
import Pill from '@/components-v2/atoms/Pill'
import RadioButtonSwitch from '@/components-v2/atoms/RadioButtonSwitch'
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import Link from 'next/link'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import checkBlack from '@/public/svg/check-green.svg'
import xeroLogo from '@/public/svg/logos/xero-logo.svg'
import quickbooksLogo from '@/public/svg/logos/quickbooks-logo.svg'
import requestLongLogo from '@/public/svg/logos/request-full-logo.svg'
import dtcPayLogo from '@/public/svg/logos/dtcpay-logo.svg'
import fireblocksLogo from '@/public/svg/logos/fireblocks-logo.svg'
import { useAppSelector } from '@/state'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { PlanName, SubscriptionStatus } from '@/api-v2/subscription-api'
import { format, parseISO } from 'date-fns'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import SubmitRequestModal from './SubmitRequestModal'
import ReceivedContactDetailsModal from './ReceivedContactDetailsModal'
import CancelPlanModal from './CancelPlanModal'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import greenPlus from '@/public/svg/icons/green-plus.svg'
import StarIcon from '@/public/svg/icons/star-icon.svg'
import { PLANS_CONTENTS } from './card-content'
import SeeAllFeaturesButton from './SeeAllFeatureButton'
import AllFeatureModal from './AllFeatureModal/AllFeatureModal'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'

const PricingAndPlans = () => {
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const [selectedPlan, setSelectedPlan] = useState(
    (subscriptionPlan?.billingCycle !== 'not_applicable' && subscriptionPlan?.billingCycle) || 'annually'
  )
  const [chosenPlanDetails, setChosenPlanDetails] = useState(null)
  const [cancelPlanDetails, setCancelPlanDetails] = useState(null)
  const [isCancelModal, setIsCancelModal] = useState(false)
  const organizationId = useOrganizationId()
  const plansRef = useRef(null)
  const submitRequestModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const receivedContactDetailsModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const cancelPlanModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const allFeatureModalProvider = useModalHook({ defaultState: { isOpen: false } })

  useEffect(() => {
    if (subscriptionPlan) {
      setSelectedPlan(
        (subscriptionPlan?.billingCycle !== 'not_applicable' && subscriptionPlan?.billingCycle) || 'annually'
      )
    }
  }, [subscriptionPlan])

  useEffect(() => {
    if (chosenPlanDetails !== null) {
      submitRequestModalProvider.methods.setIsOpen(true)
    }
  }, [chosenPlanDetails])

  useEffect(() => {
    if (cancelPlanDetails !== null) {
      cancelPlanModalProvider.methods.setIsOpen(true)
    }
  }, [cancelPlanDetails])

  const handleSwitchModalOnSuccess = () => {
    submitRequestModalProvider.methods.setIsOpen(false)
    setIsCancelModal(false)
    receivedContactDetailsModalProvider.methods.setIsOpen(true)
  }

  const handleSwitchModalOnCancel = () => {
    cancelPlanModalProvider.methods.setIsOpen(false)
    setIsCancelModal(true)
    receivedContactDetailsModalProvider.methods.setIsOpen(true)
  }
  const handleShowAllFeature = () => {
    allFeatureModalProvider.methods.setIsOpen(true)
  }

  const handleBuyPlan = (planName) => (e) => {
    allFeatureModalProvider.methods.setIsOpen(false)
    triggerSendAnalysis({
      eventType: 'CLICK_BUY_PLAN',
      metadata: {
        organizationId,
        planToBuy: planName
      }
    })
    setChosenPlanDetails({ billingCycle: selectedPlan, planName })
  }

  const getSubscriptionName = () => {
    if (!subscriptionPlan?.planName) return '-'
    if (subscriptionPlan?.planName === PlanName.STARTER) {
      return 'Starter'
    }
    if (subscriptionPlan?.planName === PlanName.FREE_TRIAL) {
      return 'Free Trial'
    }

    return 'Business'
  }

  const getPillLabel = () => {
    if (subscriptionPlan?.status === SubscriptionStatus.ACTIVE) {
      return 'Active'
    }
    if (subscriptionPlan?.status === SubscriptionStatus.CANCELLED) {
      return 'Cancelled'
    }

    return 'Expired'
  }

  // eslint-disable-next-line consistent-return
  const expiryDate = useMemo(() => {
    if (subscriptionPlan?.expiredAt) {
      const parsedDateFromTimeStamp = parseISO(subscriptionPlan?.expiredAt)
      return format(parsedDateFromTimeStamp, 'dd MMM, yyyy')
    }
  }, [subscriptionPlan?.expiredAt])

  const parsedData = useMemo(() => {
    if (subscriptionPlan?.expiredAt && subscriptionPlan?.status !== SubscriptionStatus.EXPIRED) {
      const diff = new Date(subscriptionPlan?.expiredAt).getTime() - new Date().getTime()
      const daysLeft = Math.floor(diff / (1000 * 3600 * 24)) + 1

      return {
        daysLeft,
        percentage: (daysLeft / 30) * 100
      }
    }
    return {}
  }, [subscriptionPlan?.status, subscriptionPlan?.expiredAt])

  const PILL_BG_COLOR = {
    active: '#E7F8ED',
    expired: '#F9E8E8',
    cancelled: '#F9E8E8'
  }

  const PILL_FONT_COLOR = {
    active: '#0CB746',
    expired: '#C61616',
    cancelled: '#C61616'
  }

  return (
    <>
      <section>
        <Typography variant="heading3" color="primary" classNames="mt-6">
          Your Plan
        </Typography>
        {subscriptionPlan?.planName ? (
          <div className="mt-4 bg-secondary-gray py-8 px-6 rounded-lg">
            <div className="flex justify-between items-start gap-8">
              <div className="grow">
                <div className="flex items-center gap-3">
                  <Typography variant="body1" styleVariant="semibold">
                    {getSubscriptionName()}
                  </Typography>
                  {subscriptionPlan?.planName !== PlanName.FREE_TRIAL && (
                    <Pill
                      bgColor={PILL_BG_COLOR[subscriptionPlan?.status]}
                      label={getPillLabel()}
                      fontColor={PILL_FONT_COLOR[subscriptionPlan?.status]}
                    />
                  )}
                </div>
                {subscriptionPlan?.planName !== PlanName.FREE_TRIAL ? (
                  <div>
                    <div className="flex mt-2.5 items-center gap-[2px]">
                      <Typography variant="body2" classNames="mr-1">
                        {subscriptionPlan?.status !== SubscriptionStatus.EXPIRED
                          ? `Valid till ${expiryDate}. `
                          : 'Your plan has expired. Please buy a plan again to get the access. '}
                      </Typography>
                      <Link href={`/${organizationId}/orgsettings?activeTab=paymentAndBilling`} legacyBehavior>
                        <p className="text-[#000019] underline font-medium text-sm cursor-pointer">
                          View Billing History
                        </p>
                      </Link>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
              {subscriptionPlan?.planName !== PlanName.FREE_TRIAL &&
              subscriptionPlan?.status === SubscriptionStatus.ACTIVE ? (
                <div className="flex gap-3">
                  <Button
                    variant="black"
                    height={40}
                    label="Change Plan"
                    onClick={() => {
                      plansRef.current.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'start'
                      })
                      triggerSendAnalysis({
                        eventType: 'CHANGE_PLAN_ON_PRICING_PAGE',
                        metadata: {
                          requestType: 'cancel',
                          organizationId,
                          currentPlanName: subscriptionPlan?.planName,
                          currentBillingCycle: subscriptionPlan?.billingCycle
                        }
                      })
                    }}
                  />
                  <Button
                    variant="ghostRed"
                    height={40}
                    label="Cancel Plan"
                    onClick={() => {
                      setCancelPlanDetails({
                        planName: subscriptionPlan?.planName,
                        billingCycle: subscriptionPlan?.billingCycle,
                        expiryDate
                      })
                      triggerSendAnalysis({
                        eventType: 'CLICK_CANCEL_PLAN',
                        metadata: {
                          requestType: 'cancel',
                          organizationId,
                          currentPlanName: subscriptionPlan?.planName,
                          currentBillingCycle: subscriptionPlan?.billingCycle
                        }
                      })
                    }}
                  />
                </div>
              ) : (
                ''
              )}
              {subscriptionPlan?.planName !== PlanName.FREE_TRIAL &&
              subscriptionPlan?.status !== SubscriptionStatus.ACTIVE ? (
                <div className="flex gap-3">
                  <Button
                    variant="black"
                    height={40}
                    label="Buy Again"
                    onClick={() => {
                      plansRef.current.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'start'
                      })
                      triggerSendAnalysis({
                        eventType: 'CLICK_BUY_AGAIN',
                        metadata: {
                          organizationId,
                          currentPlanName: subscriptionPlan?.planName,
                          currentBillingCycle: subscriptionPlan?.billingCycle
                        }
                      })
                    }}
                  />
                </div>
              ) : (
                ''
              )}
              {subscriptionPlan?.planName === PlanName.FREE_TRIAL ? (
                <Button
                  classNames="!text-xs"
                  height={32}
                  label="See Plans"
                  variant="yellow"
                  onClick={() =>
                    plansRef.current.scrollIntoView({
                      behavior: 'smooth',
                      inline: 'start'
                    })
                  }
                />
              ) : (
                ''
              )}
            </div>
            {subscriptionPlan?.planName === PlanName.FREE_TRIAL &&
            subscriptionPlan?.status === SubscriptionStatus.ACTIVE ? (
              <div className="mt-4 w-full">
                <Typography variant="body2" classNames="mb-2">
                  {parsedData?.daysLeft} {parsedData?.daysLeft <= 1 ? 'day' : 'days'} left in free trial. Expires on{' '}
                  {expiryDate}.
                </Typography>
                <div className="w-full h-1.5 flex bg-[#CECECC] rounded">
                  <div
                    style={{
                      backgroundColor: `${parsedData?.daysLeft < 10 ? '#C61616' : '#000019'}`,
                      width: `${parsedData?.percentage}%`,
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ) : (
              ''
            )}
            {subscriptionPlan?.planName === PlanName.FREE_TRIAL && subscriptionPlan?.status === 'expired' ? (
              <div className="mt-4 w-full">
                <Typography variant="body2" classNames="mb-2">
                  0 days left in free trial. Expired on {expiryDate}
                </Typography>
                <div className="w-full h-1.5 flex bg-[#CECECC] rounded">
                  <div
                    style={{
                      backgroundColor: `${parsedData?.daysLeft < 10 ? '#C61616' : '#000019'}`,
                      width: `${parsedData?.percentage}%`,
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          <div className="mt-4 bg-secondary-gray py-8 px-6 rounded-lg h-[119px]">
            <Typography variant="body2">No plan received.</Typography>
          </div>
        )}
      </section>
      <hr className="mt-8" />
      <section ref={plansRef}>
        <div className="flex items-center justify-center my-8">
          <Typography variant="heading2" color="primary">
            Available Plans
          </Typography>
        </div>
        <div className="flex items-center justify-center my-8 mb-[80px]">
          <div className="border border-grey-300 p-1 rounded-md flex items-center height-[48px]">
            <RadioButtonSwitch
              label="6-month Plan"
              radioGroupName="plans"
              radioGroup="plans"
              checked={selectedPlan === 'semiannually'}
              id="semiannually"
              onChange={() => setSelectedPlan('semiannually')}
            />
            <RadioButtonSwitch
              label="Annual Plan"
              subtitle="Save up to 25%"
              radioGroupName="plans"
              radioGroup="plans"
              checked={selectedPlan === 'annually'}
              id="annually"
              onChange={() => setSelectedPlan('annually')}
            />
          </div>
        </div>
        <div className="flex items-stretch gap-2 justify-center">
          {/* Payouts Only */}
          <div className="bg-[#F1F1EF] rounded-lg p-6 w-[288px] flex flex-col justify-between items-center">
            <section id="payout-only-feature">
              <Typography variant="heading3" color="primary" classNames="mt-6">
                Payouts Only
              </Typography>
              <div className="flex mt-8 items-center gap-2">
                <Typography variant="heading2">$0</Typography>
                <Typography variant="body2" styleVariant="semibold">
                  USD / month
                </Typography>
              </div>
              <Typography
                variant="caption"
                color="black"
                styleVariant="semibold"
                classNames="mt-[158px] bg-[#E2E2E0] py-1 px-3 rounded text-center"
              >
                You will be downgraded to this plan on trial/paid plan expiry
              </Typography>
              <div className="py-1 px-2 bg-[#D0D5DD] w-auto inline-block rounded-sm mt-8">
                <Typography
                  variant="caption"
                  color="primary"
                  styleVariant="semibold"
                  classNames="uppercase tracking-wide"
                >
                  Key Features
                </Typography>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Crypto Payments
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Unlimited bulk payouts</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Address Book</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-8">
                Customer Service
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Email support</Typography>
                </div>
              </div>
            </section>
            <div className="mt-8">
              <SeeAllFeaturesButton title="See all features" onClick={handleShowAllFeature} />
            </div>
          </div>
          {/* ------------------------------------------ */}
          {/* Starter Plan */};
          <div className="relative bg-[#F1F1EF] rounded-lg p-6 w-[288px] flex flex-col justify-between items-center">
            <section id="starter-feature">
              {subscriptionPlan?.planName === PlanName.STARTER &&
                subscriptionPlan?.status === SubscriptionStatus.ACTIVE &&
                subscriptionPlan?.billingCycle === selectedPlan && (
                  <div className="absolute w-full bg-[#FCF22D] top-0 py-2 px-4 left-0 rounded-t-lg text-center">
                    <Typography variant="caption" styleVariant="semibold">
                      Current Plan
                    </Typography>
                  </div>
                )}
              <Typography variant="heading3" color="primary" classNames="mt-6">
                Starter
              </Typography>
              <div className="flex mt-8 items-center gap-2">
                <Typography variant="heading2">
                  {`$${formatNumberWithCommasBasedOnLocale(
                    PLANS_CONTENTS.starter[selectedPlan].amountPerMonth.toString(),
                    'US'
                  )}`}
                </Typography>
                <Typography variant="body2" styleVariant="semibold">
                  USD / month
                </Typography>
                {selectedPlan === 'annually' && <Pill bgColor="#E4E4FF" fontColor="#2F2CFF" label="Save 25%" />}
              </div>
              <Typography variant="caption" styleVariant="semibold" classNames="mt-2">
                {PLANS_CONTENTS.starter[selectedPlan]?.unreducedTotalAmount && (
                  <span className="line-through mr-1">
                    {`$${formatNumberWithCommasBasedOnLocale(
                      PLANS_CONTENTS.starter[selectedPlan]?.unreducedTotalAmount,
                      'US'
                    )}`}
                  </span>
                )}
                {`$${formatNumberWithCommasBasedOnLocale(
                  PLANS_CONTENTS.starter[selectedPlan].totalAmount.toString(),
                  'US'
                )}${PLANS_CONTENTS.starter[selectedPlan].priceDetail}`}
              </Typography>
              <div className="text-grey-700 text-xs mt-8 h-[70px]">
                <p>Ideal for:</p>
                <ul className="list-disc ml-4">
                  <li>Founders and Contributors</li>
                </ul>
              </div>
              <Button
                variant="black"
                label="Buy Plan"
                classNames="mt-8"
                height={40}
                width="w-full"
                onClick={() => {
                  setChosenPlanDetails({ billingCycle: selectedPlan, planName: 'starter' })
                  triggerSendAnalysis({
                    eventType: 'CLICK_BUY_PLAN',
                    metadata: {
                      organizationId,
                      planToBuy: 'starter'
                    }
                  })
                }}
              />
              <div className="py-1 px-2 bg-[#D0D5DD] w-auto inline-block rounded-sm mt-8">
                <Typography
                  variant="caption"
                  color="primary"
                  styleVariant="semibold"
                  classNames="uppercase tracking-wide"
                >
                  Key Features
                </Typography>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Accounting & Reconciliation
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Unlimited wallet imports</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Up to 10,000 transactions / month</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Cost-basis calculations</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Realised G&L tracking</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Financial Reports
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Portfolio balances, in/outflows</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Unrealised G&L tracking</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Unlimited ledger entries for CV export</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Crypto Payments
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Unlimited bulk payouts</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Address Book</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-8">
                Customer Service
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Dedicated Account Manager</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">2x onboarding sessions</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">1 hour free consultation</Typography>
                </div>
              </div>
            </section>
            <div className="mt-8">
              <SeeAllFeaturesButton title="See all features" onClick={handleShowAllFeature} />
            </div>
          </div>
          {/* ------------------------------------------ */}
          {/* Business Plan */};
          <div className="bg-[#F1F1EF] rounded-lg p-6 relative w-[288px] flex flex-col justify-between items-center">
            <section id="business-feature">
              {subscriptionPlan?.planName === PlanName.BUSINESS &&
              subscriptionPlan?.status === SubscriptionStatus.ACTIVE &&
              subscriptionPlan?.billingCycle === selectedPlan ? (
                <div className="absolute w-full bg-[#FCF22D] top-0 py-2 px-4 left-0 rounded-t-lg text-center">
                  <Typography variant="caption" styleVariant="semibold">
                    Current Plan
                  </Typography>
                </div>
              ) : (
                (subscriptionPlan?.planName === PlanName.FREE_TRIAL ||
                  subscriptionPlan?.status === SubscriptionStatus.EXPIRED) && (
                  <div className="absolute w-full bg-[#FCF22D] top-0 py-2 px-4 flex items-center gap-2 justify-center left-0 rounded-t-lg">
                    <Image src={StarIcon} width={16} height={16} alt="icon_recommended" />
                    <Typography variant="caption" styleVariant="semibold">
                      Recommended
                    </Typography>
                  </div>
                )
              )}
              <Typography variant="heading3" color="primary" classNames="mt-6">
                Business
              </Typography>
              <div className="flex mt-8 items-center gap-2">
                <Typography variant="heading2">{`$${formatNumberWithCommasBasedOnLocale(
                  PLANS_CONTENTS.business[selectedPlan].amountPerMonth.toString(),
                  'US'
                )}`}</Typography>
                <Typography variant="body2" styleVariant="semibold">
                  USD / month
                </Typography>
                {selectedPlan === 'annually' && <Pill bgColor="#E4E4FF" fontColor="#2F2CFF" label="Save 14%" />}
              </div>
              <Typography variant="caption" styleVariant="semibold" classNames="mt-2">
                {PLANS_CONTENTS.business[selectedPlan]?.unreducedTotalAmount && (
                  <span className="line-through mr-1">
                    {`$${formatNumberWithCommasBasedOnLocale(
                      PLANS_CONTENTS.business[selectedPlan]?.unreducedTotalAmount,
                      'US'
                    )}`}
                  </span>
                )}
                {`$${formatNumberWithCommasBasedOnLocale(
                  PLANS_CONTENTS.business[selectedPlan].totalAmount.toString(),
                  'US'
                )}${PLANS_CONTENTS.business[selectedPlan].priceDetail}`}
              </Typography>
              <div className="text-grey-700 text-xs mt-8 h-[70px]">
                <p>Ideal for:</p>
                <ul className="list-disc ml-4">
                  <li>Finance Managers</li>
                </ul>
              </div>
              <Button
                variant="black"
                label="Buy Plan"
                classNames="mt-8"
                height={40}
                width="w-full"
                onClick={() => {
                  setChosenPlanDetails({ billingCycle: selectedPlan, planName: 'business' })
                  triggerSendAnalysis({
                    eventType: 'CLICK_BUY_PLAN',
                    metadata: {
                      organizationId,
                      planToBuy: 'business'
                    }
                  })
                }}
              />
              <div className="py-1 px-2 w-auto inline-block rounded-sm mt-8 bg-[#FCF22D]">
                <Typography
                  variant="caption"
                  color="primary"
                  styleVariant="semibold"
                  classNames="uppercase tracking-wide"
                >
                  Everything in starter, and
                </Typography>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Financial Reports
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Monthly reconciliation and report generation</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Accounting ERP Integrations
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex">
                  <div className="flex h-[40px] p-1.5 items-center rounded border border-solid border-[#CECECC]">
                    <Image src={xeroLogo} width={28} height={28} />
                    <Typography styleVariant="semibold" color="black" classNames="ml-2">
                      Xero
                    </Typography>
                  </div>
                  <div className="flex h-[40px] p-1.5 items-center rounded border border-solid border-[#CECECC] ml-4">
                    <Image src={quickbooksLogo} width={103} height={28} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Import and sync Chart of Accounts</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Direct export of journal entries</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-8">
                Customer Service
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">5x onboarding sessions</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">
                    Monthly consultation, with manual generation of reports & database
                  </Typography>
                </div>
              </div>
              <div className="py-1 px-2 bg-[#D0D5DD] w-auto inline-block rounded-sm mt-8">
                <Typography
                  variant="caption"
                  color="primary"
                  styleVariant="semibold"
                  classNames="uppercase tracking-wide"
                >
                  Add-on
                </Typography>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Payments Integrations
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center">
                  <div className="flex h-[40px] p-1.5 items-center rounded border border-solid border-[#CECECC]">
                    <Image src={requestLongLogo} width={66} height={20} />
                  </div>
                  <div className="flex h-[40px] p-1.5 items-center rounded border border-solid border-[#CECECC] ml-3">
                    <Image src={dtcPayLogo} width={83} height={20} />
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="shrink-0 flex items-center">
                    <Image src={greenPlus} width={18} height={18} />
                  </div>
                  <Typography classNames="ml-3">$25 USD / month / integration</Typography>
                </div>
              </div>
            </section>
            <div className="mt-8">
              <SeeAllFeaturesButton title="See all features" onClick={handleShowAllFeature} />
            </div>
          </div>
          {/* ------------------------------------------ */}
          {/* Partners Program */}
          <div className="bg-[#F1F1EF] rounded-lg p-6 w-[288px] flex flex-col justify-between items-center">
            <section id="partners-program-feature">
              <Typography variant="heading3" color="primary" classNames="mt-6">
                Partners Program
              </Typography>
              <div className="flex mt-8 items-center gap-2">
                <Typography variant="heading2">Let's Chat!</Typography>
              </div>
              <Typography variant="caption" styleVariant="semibold" classNames="mt-2">
                Join our Partners Program to obtain volume discounts and referral perks.
              </Typography>
              <div className="text-grey-700 text-xs mt-[16px] h-[70px]">
                <p>Ideal for:</p>
                <ul className="list-disc ml-4">
                  <li>Serving multiple clients who manage digital assets</li>
                  <li>VCs or accelerators in Web3</li>
                </ul>
              </div>
              <Button
                variant="black"
                label="Contact Us"
                classNames="mt-8"
                height={40}
                width="w-full"
                onClick={() => {
                  setChosenPlanDetails({ billingCycle: selectedPlan, planName: 'partnersProgram' })
                  triggerSendAnalysis({
                    eventType: 'CLICK_BUY_PLAN',
                    metadata: {
                      organizationId,
                      planToBuy: 'partnersProgram'
                    }
                  })
                }}
              />
              <div className="py-1 px-2 bg-[#FCF22D] w-auto inline-block rounded-sm mt-8">
                <Typography
                  variant="caption"
                  color="primary"
                  styleVariant="semibold"
                  classNames="uppercase tracking-wide"
                >
                  Everything in business, and
                </Typography>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Accounting & Reconciliation
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Customer reconciliation</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Financial Reports
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Multi-entity view</Typography>
                </div>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Monthly reconciliation and report generation</Typography>
                </div>
              </div>
              <Typography variant="subtitle1" classNames="mt-6">
                Accounting ERP Integrations
              </Typography>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <Image src={checkBlack} width={18} height={18} />
                  </div>
                  <Typography variant="body2">Customised integration</Typography>
                </div>
              </div>
            </section>
            <div className="mt-8">
              <SeeAllFeaturesButton title="See all features" onClick={handleShowAllFeature} />
            </div>
          </div>
        </div>
      </section>
      <SubmitRequestModal
        provider={submitRequestModalProvider}
        chosenPlanDetails={chosenPlanDetails}
        handleSwitchModalOnSuccess={handleSwitchModalOnSuccess}
        isUpgrade={
          subscriptionPlan?.planName === 'starter' &&
          (chosenPlanDetails?.planName === 'business' || chosenPlanDetails?.planName === 'partnersProgram')
        }
      />
      <ReceivedContactDetailsModal provider={receivedContactDetailsModalProvider} isCancel={isCancelModal} />
      <CancelPlanModal
        provider={cancelPlanModalProvider}
        cancelPlanDetails={cancelPlanDetails}
        handleSwitchModalOnCancel={handleSwitchModalOnCancel}
      />
      <AllFeatureModal onBuyPlan={handleBuyPlan} provider={allFeatureModalProvider} />
    </>
  )
}

export default PricingAndPlans
