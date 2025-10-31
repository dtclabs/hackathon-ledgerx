import TabItem from '@/components/TabsComponent/TabItem'
import { useAppSelector } from '@/state'
import React, { useEffect, useMemo, useState } from 'react'
import ReportingSetting from './components/ReportingSetting'
// import TokenManage from './components/TokenManage'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { BasicSetting } from './components/BasicSetting'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import { useGetAuthenticatedProfileQuery } from '@/api-v2/members-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { userOrganizationsSelector } from '@/slice/account/account-slice'
import { useRouter } from 'next/router'
import PaymentAndBilling from './components/PaymentAndBilling'
import { isMonetisationEnabled } from '@/config-v2/constants'
import { useGetBillingHistoriesQuery, useLazyDownloadBillingInvoiceQuery } from '@/api-v2/billing-api'
import PricingAndPlans from './components/PricingAndPlans'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { SubscriptionStatus } from '@/api-v2/subscription-api'

const OrganisationSettings = () => {
  const organizationId = useOrganizationId()
  const showBanner = useAppSelector(showBannerSelector)
  const listOrganization = useAppSelector(userOrganizationsSelector)
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const currentOrganization = listOrganization?.find((item) => item.id === organizationId)
  const router = useRouter()

  const SETTING_TABS = useMemo(
    () => [
      {
        key: 'organisationInformation',
        name: 'Organisation Information',
        disabled: isMonetisationEnabled && subscriptionPlan?.status === SubscriptionStatus.EXPIRED,
        disabledTooltip: 'Your plan has expired. Buy a plan to unlock access.'
      },
      {
        key: 'reportingPreferences',
        name: 'Reporting Preferences',
        disabled: isMonetisationEnabled && subscriptionPlan?.status === SubscriptionStatus.EXPIRED,
        disabledTooltip: 'Your plan has expired. Buy a plan to unlock access.'
      },
      {
        key: 'pricingAndPlans',
        name: 'Pricing and Plans',
        hidden: !isMonetisationEnabled
      },
      {
        key: 'paymentAndBilling',
        name: 'Payment and Billing',
        hidden: !isMonetisationEnabled
      }
    ],
    [subscriptionPlan?.status]
  )

  const { data: userData } = useGetAuthenticatedProfileQuery(
    { orgId: String(organizationId) },
    { skip: !organizationId }
  )
  const { data: wallets } = useGetWalletsQuery({
    orgId: organizationId,
    params: { size: 999 }
  })
  const { data: billingData } = useGetBillingHistoriesQuery({ organizationId }, { skip: !organizationId })
  const [triggerDownload, { isLoading: isDownloading, isFetching }] = useLazyDownloadBillingInvoiceQuery()

  const [activeTab, setActiveTab] = useState(SETTING_TABS[0].key)

  useEffect(() => {
    if (router?.query?.activeTab && subscriptionPlan?.status !== SubscriptionStatus.EXPIRED) {
      const settingFromUrl = SETTING_TABS.find((setting) => setting.key === router.query.activeTab)
      if (settingFromUrl) {
        setActiveTab(settingFromUrl.key)
      }
    } else if (isMonetisationEnabled && router?.query?.activeTab === 'paymentAndBilling') {
      setActiveTab('paymentAndBilling')
    } else if (isMonetisationEnabled && subscriptionPlan?.status === SubscriptionStatus.EXPIRED) {
      setActiveTab('pricingAndPlans')
    } else {
      setActiveTab('organisationInformation')
    }
  }, [router.query.activeTab, organizationId])

  const handleSave = (data: any) => {
    // console.log(1)
  }

  const handleDownLoadInvoice = (id: string, fileName: string) => (e) => {
    triggerDownload({ organizationId, id, fileName })
  }

  const handleRedirectToPlan = () => {
    setActiveTab(SETTING_TABS[2].key)
  }

  const pushToActiveTab = (key) => {
    router.push(`/${organizationId}/orgsettings?activeTab=${key}`)
  }

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>Organisation Settings</Header.Left.Title>
        </Header.Left>
      </Header>
      <View.Content>
        <UnderlineTabs
          tabs={SETTING_TABS}
          active={activeTab}
          setActive={pushToActiveTab}
          classNameBtn="font-semibold text-sm px-6 py-[10px]"
          wrapperClassName=" border-b-[1px] border-grey-200"
        >
          <TabItem key={SETTING_TABS[0].key}>
            <BasicSetting
              organization={currentOrganization}
              userData={userData}
              showBanner={showBanner}
              activeTab={activeTab}
            />
          </TabItem>
          <TabItem key={SETTING_TABS[1].key}>
            <ReportingSetting onSave={handleSave} showBanner={showBanner} walletTotalItems={wallets?.totalItems} />
          </TabItem>
          {isMonetisationEnabled && (
            <TabItem key={SETTING_TABS[2].key}>
              <PricingAndPlans />
            </TabItem>
          )}
          <TabItem key={SETTING_TABS[3].key}>
            {isMonetisationEnabled && (
              <PaymentAndBilling
                data={billingData?.items || []}
                showBanner={showBanner}
                onDownloadInvoice={handleDownLoadInvoice}
                onRedirectToPlan={handleRedirectToPlan}
              />
            )}
          </TabItem>
        </UnderlineTabs>
      </View.Content>
    </>
  )
}

export default OrganisationSettings
