import BaseTemplate from '../Base/BaseTemplate'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { useState, useEffect, useRef } from 'react'
import useAuth from '@/hooks/useAuth'
import { useWeb3React } from '@web3-react/core'
import { useAppSelector, useAppDispatch } from '@/state'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetUserAccountQuery, useGetUserOrgAccountQuery } from '@/api-v2/account-api'
import { useGetAuthenticatedProfileQuery } from '@/api-v2/members-api'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import { setShowBanner, showBannerSelector, setChain } from '@/slice/platform/platform-slice'
import { userOrganizationsSelector } from '@/slice/account/account-slice'
import { useGetFiatCurrenciesQuery, useGetOrgSettingsQuery } from '@/api-v2/org-settings-api'
// import { getFullRecipients, getRecipientContactProvider } from '@/state/recipient/action'
import { PromoBanner } from '@/components-v2/molecules/PromoBanner'
import { FreeProvider } from '@/contexts/FreeContext'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useGetOrganizationTrialQuery } from '@/api-v2/organization-subscription'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import PromptModal from '@/components-v2/molecules/PromptModal'
import PromoUpgradePlanModal from '@/components-v2/molecules/PromoUpgradePlanModal'
import { PlanName, SubscriptionStatus, useGetSubscriptionQuery } from '@/api-v2/subscription-api'
import WelcomeFreeTrialModal from '@/components-v2/molecules/WelcomeModal'
import ExpiredModal from '@/components-v2/molecules/ExpiredModal'
import { isMonetisationEnabled } from '@/config-v2/constants'
import { showUpgradeModalSelector, showAddOnModalSelector } from '@/slice/subscription/subscription-slice'
import BuyAddOnModal from '@/components-v2/molecules/BuyAddOnModal'
import OnboardingModal from '@/components/OnboardingModal'
import { LoaderLX } from '@/components-v2/LoaderLX'
import useAutoConnectAccount from '@/hooks-v2/web3Hooks/useAutoConnectAccount'
import { useGetPendingTransactionsNewQuery } from '@/slice/pending-transactions/pending-transactions.api'
import { useGetAllOrganizationIntegrationsQuery } from '@/api-v2/organization-integrations'
import { useOrganizationIntegrationsQuery } from '@/api-v2/merge-rootfi-api'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import { useGetOrganisationCryptocurrenciesQuery, useGetVerifiedCryptoCurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { useGetWalletsQuery, useSyncPendingTransactionsMutation } from '@/slice/wallets/wallet-api'
import { api } from '@/api-v2'
import {
  useGetBanksQuery,
  useGetContactProviderQuery,
  useGetContactsQuery,
  useLazyGetBanksQuery
} from '@/slice/contacts/contacts-api'
import { setBankList, setBankLoading } from '@/slice/contacts/contacts-slice'
import { useGetCardOnboardingStepQuery } from '@/slice/cards/cards-api'

interface ChildProps {
  children: React.ReactNode
}
interface MainViewWithChildren extends React.FC<ChildProps> {
  Header: HeaderWithChildren
  Content: any
  Footer: any
}

interface HeaderWithChildren extends React.FC<ChildProps> {
  Left: HeaderLeftProps
  Right: HeaderRightProps
}

interface HeaderRightProps extends React.FC<ChildProps> {
  PrimaryCTA: React.FC<{
    label: string
    onClick?: any
    disabled?: boolean
    loading?: boolean
    classNames?: string
    leadingIcon?: any
    locked?: boolean
  }>
  SecondaryCTA: React.FC<{ label: string; onClick?: any; leadingIcon?: any; disabled?: boolean }>
  children?: React.ReactNode
}

interface HeaderLeftProps extends React.FC<ChildProps> {
  Title?: React.FC<ChildProps>
  children?: React.ReactNode
  className?: string
}

const MainView: MainViewWithChildren = ({ children }) => {
  const { isInitated } = useAutoConnectAccount()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu()
  const { logoutRedirect } = useAuth()
  const { chainId, active } = useWeb3React()
  const dispatch = useAppDispatch()
  const initialMount = useRef(false)
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const organizationId = useOrganizationId()
  const [isPreloading, setIsPreloading] = useState(false)
  const promptModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const upgradePlanModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const expiredModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const freeTrialModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const addOnModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const [syncPendingTrigger, syncPendingResult] = useSyncPendingTransactionsMutation()
  const { isLoading: isLoadingPendingTransaction, refetch: refetchPendingTransactions } =
    useGetPendingTransactionsNewQuery(
      {
        organizationId,
        params: {
          blockchainIds: [],
          walletIds: []
        }
      },
      { skip: !organizationId }
    )

  const [showOnboardingModal, setShowOnboardingModal] = useState(false)

  const router = useRouter()
  const { data: chainsData } = useGetChainsQuery({})

  const { data: walletData, refetch: refetchWallet } = useGetWalletsQuery(
    { orgId: organizationId, params: { size: 999 } },
    { skip: !organizationId }
  )
  useGetFiatCurrenciesQuery({})
  const { refetch: cardOnboardingRefetch } = useGetCardOnboardingStepQuery(
    {
      organizationId
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  useGetOrganisationCryptocurrenciesQuery(
    {
      organisationId: organizationId,
      params: {
        blockchainIds: chainsData?.data?.map((chain) => chain.id),
        walletIds: walletData?.items?.map((wallet) => wallet.id)
      }
    },
    { skip: !organizationId && !chainsData?.data?.length && !walletData?.items?.length }
  )

  useGetVerifiedCryptoCurrenciesQuery({})

  useGetChartOfAccountsQuery({ organizationId, params: { status: ['ACTIVE'] } }, { skip: !organizationId })
  const { isFetching: organizationIntegrationsLoading, refetch } = useGetAllOrganizationIntegrationsQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  const { isError: organizationIntegrationsError } = useOrganizationIntegrationsQuery(
    {
      organizationId,
      integration: accountingIntegration?.integrationName
    },
    { skip: !organizationId || !accountingIntegration?.integrationName, refetchOnMountOrArgChange: true }
  )
  const { refetch: orgAccountRefetch } = useGetUserOrgAccountQuery({})
  const {
    data: subscription,
    isFetching: isSubscriptionFetching,
    refetch: subscriptionRefetch
  } = useGetSubscriptionQuery({ organizationId }, { skip: !organizationId })
  const {
    isLoading: isOrgSettingLoading,
    refetch: orgSettingsRefetch,
    isUninitialized: isOrgSettingsUninitialized
  } = useGetOrgSettingsQuery({ orgId: organizationId }, { skip: !organizationId })
  const {
    data: organizationTrialData,
    isSuccess,
    isLoading: isOrganizationTrialLoading,
    isUninitialized: isOrganizationTrialUninitialized
  } = useGetOrganizationTrialQuery({ organizationId: String(organizationId) }, { skip: !organizationId })
  const { data: contactProviders, refetch: contactProvidersRefetch } = useGetContactProviderQuery(
    {
      orgId: organizationId
    },
    { skip: !organizationId }
  )
  const { refetch: contactsRefetch } = useGetContactsQuery(
    { orgId: organizationId, params: { size: 9999 } },
    { skip: !organizationId }
  )
  const [triggerGetBank, getBankRes] = useLazyGetBanksQuery()
  const showBanner = useAppSelector(showBannerSelector)
  const listOrganization = useAppSelector(userOrganizationsSelector)
  const showUpgradeModal = useAppSelector(showUpgradeModalSelector)
  const showAddOnModal = useAppSelector(showAddOnModalSelector)
  const currentOrganization = listOrganization?.find((item) => item.id === organizationId)

  const { data: account } = useGetUserAccountQuery({})
  const { data: orgProfile } = useGetAuthenticatedProfileQuery(
    { orgId: String(organizationId) },
    { skip: !organizationId }
  )

  useEffect(() => {
    if (
      organizationId &&
      listOrganization?.length > 0 &&
      listOrganization?.findIndex((_org) => _org.id === organizationId) < 0
    ) {
      logoutRedirect()
    }
  }, [organizationId, listOrganization])

  // TODO: Remove these legacy hooks when we have completely moved over to the new API
  useEffect(() => {
    if (organizationId) {
      contactsRefetch()
      contactProvidersRefetch()
      refetchWallet()
      orgSettingsRefetch()
      subscriptionRefetch()
      orgAccountRefetch()
      syncPendingTrigger({ organisationId: organizationId })
      refetchPendingTransactions()
    }
  }, [dispatch, organizationId])

  // old banner
  useEffect(() => {
    if (!isMonetisationEnabled) {
      if (organizationTrialData?.data?.length > 0) {
        if (organizationTrialData?.data?.[0]?.status === 'free_trial') {
          dispatch(setShowBanner(true))
        } else {
          dispatch(setShowBanner(false))
        }
      } else {
        dispatch(setShowBanner(true))
      }
    }
  }, [isSuccess, organizationTrialData])

  useEffect(() => {
    if (organizationIntegrationsError) {
      dispatch(api.util.invalidateTags(['organization-integrations-list']))
    }
  }, [organizationIntegrationsError])
  // new banner
  useEffect(() => {
    if (isMonetisationEnabled) {
      if (
        subscription &&
        subscription?.planName === PlanName.FREE_TRIAL &&
        (!window.sessionStorage.getItem('show_banner_monetisation') ||
          (window.sessionStorage.getItem('show_banner_monetisation') &&
            !JSON.parse(window.sessionStorage.getItem('show_banner_monetisation')).includes(organizationId)))
      ) {
        dispatch(setShowBanner(true))
      } else {
        dispatch(setShowBanner(false))
      }
    }
  }, [subscription, organizationId])

  useEffect(() => {
    if (account?.data?.agreementSignedAt === null) {
      promptModalProvider.methods.setIsOpen(true)
    }
  }, [account])

  useEffect(() => {
    const getBankList = async () => {
      let list = []
      let page = 1
      let check = true

      dispatch(setBankLoading(true))

      try {
        do {
          const res = await triggerGetBank({
            orgId: organizationId,
            params: {
              size: 500,
              page
            }
          }).unwrap()

          if (!res?.length) {
            check = false
          } else {
            list = [...list, ...res]
            page += 1
          }
        } while (check)

        dispatch(setBankList(list))
      } catch (error) {
        console.error('Error when getting banks')
      } finally {
        dispatch(setBankLoading(false))
      }
    }

    if (organizationId) {
      getBankList()
    }
  }, [organizationId])

  useEffect(() => {
    if (subscription?.status === SubscriptionStatus.EXPIRED && !isSubscriptionFetching) {
      if (
        (window.localStorage.getItem('do-not-show-expired-modals-for-orgs') &&
          !JSON.parse(window.localStorage.getItem('do-not-show-expired-modals-for-orgs')).includes(organizationId)) ||
        !window.localStorage.getItem('do-not-show-expired-modals-for-orgs')
      ) {
        expiredModalProvider.methods.setIsOpen(true)
      }
    }
  }, [subscription?.status, organizationId, isSubscriptionFetching])

  useEffect(() => {
    if (router.query.welcome && currentOrganization) {
      freeTrialModalProvider.methods.setIsOpen(true)
    }
  }, [router.query.welcome, organizationId, currentOrganization])

  useEffect(() => {
    upgradePlanModalProvider.methods.setIsOpen(showUpgradeModal)
  }, [showUpgradeModal])

  useEffect(() => {
    addOnModalProvider.methods.setIsOpen(showAddOnModal)
  }, [showAddOnModal])

  const handleOnClickCloseBanner = () => {
    triggerSendAnalysis({
      eventType: 'CLICK',
      metadata: {
        action: 'tos_accepted'
      }
    })
    dispatch(setShowBanner(false))
  }
  const handleOnClickBanner = () => {
    triggerSendAnalysis({
      eventType: 'CLICK',
      metadata: {
        action: 'promo_banner_cta'
      }
    })
    if (isMonetisationEnabled) {
      router.push(`/${organizationId}/orgsettings?activeTab=pricingAndPlans`)
    } else {
      setShowOnboardingModal(true)
    }
  }

  const handleNavigateToProfile = () => {
    router.push(`/${organizationId}/account`)
  }

  if (
    !isInitated ||
    isPreloading ||
    isOrganizationTrialLoading ||
    isOrgSettingLoading ||
    isOrganizationTrialUninitialized ||
    isOrgSettingsUninitialized ||
    isLoadingPendingTransaction
  ) {
    return (
      <div className="h-screen flex justify-center">
        <LoaderLX />
      </div>
    )
  }

  return (
    <FreeProvider>
      <BaseTemplate>
        {/* {showBanner && (
          <PromoBanner
            onClose={handleOnClickCloseBanner}
            onClickCTA={handleOnClickBanner}
            expiryDate={organizationTrialData?.data?.[0]?.expiredAt}
            plan={subscription}
          />
        )} */}
        <BaseTemplate.Header
          user={{
            firstName: account?.data?.firstName ?? '-',
            lastName: account?.data?.lastName ?? '-',
            loginCredentials: account?.data?.name ?? '-',
            role: orgProfile?.data?.role ?? '-'
          }}
          onClickLogout={logoutRedirect}
          onClickNavigateToProfile={handleNavigateToProfile}
          isLoading={organizationIntegrationsLoading}
          refetch={refetch}
          onToggleMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <BaseTemplate.Body bannerDisplayed={showBanner}>
          <BaseTemplate.Body.Sidebar
            bannerDisplayed={showBanner}
            orgList={listOrganization}
            currentOrg={currentOrganization}
            user={{
              role: orgProfile?.data?.role ?? '-'
            }}
            plan={subscription}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={closeMobileMenu}
          />
          <BaseTemplate.Body.Content bannerDisplayed={showBanner}>{children}</BaseTemplate.Body.Content>
        </BaseTemplate.Body>
        <OnboardingModal
          expiryDate={organizationTrialData?.data?.[0]?.expiredAt}
          showModal={showOnboardingModal}
          setShowModal={setShowOnboardingModal}
        />
        <PromptModal provider={promptModalProvider} />
        {/* {isMonetisationEnabled && (
          <WelcomeFreeTrialModal provider={freeTrialModalProvider} orgName={currentOrganization?.name} />
        )} */}
        {isMonetisationEnabled && !isSubscriptionFetching && (
          <ExpiredModal provider={expiredModalProvider} planName={subscription?.planName} />
        )}
        {isMonetisationEnabled && <PromoUpgradePlanModal provider={upgradePlanModalProvider} />}
        {isMonetisationEnabled && <BuyAddOnModal provider={addOnModalProvider} />}
      </BaseTemplate>
    </FreeProvider>
  )
}

export const Header: HeaderWithChildren = ({ children }) => (
  <div className="flex w-100 flex-row items-center justify-between sm:flex-col sm:gap-2">{children}</div>
)

export const Content: any = ({ children, className }) => (
  <div className={` no-scrollbar w-100 h-full pb-[12px] flex-col overflow-y-auto grow font-inter ${className}`}>
    {children}
  </div>
)

export const Footer = ({ children }) => <div className="p-[24px] border-t border-grey-200">{children}</div>

const ContentLeft: HeaderLeftProps = ({ children }) => (
  <div className="flex flex-row items-center sm:w-full sm:flex-start">{children}</div>
)
const ContentRight: HeaderRightProps = ({ children }) => (
  <div className="flex flex-row gap-3 items-center sm:w-full sm:flex-end">{children}</div>
)

const Title: React.FC<ChildProps> = ({ children }) => (
  <Typography classNames="font-bold" variant="heading2" color="primary">
    {children}
  </Typography>
)

const PrimaryCTA: React.FC<{ label: string }> = ({ label, ...rest }) => (
  <Button loading={false} {...rest} label={label} variant="black" height={40} />
)
const SecondaryCTA: React.FC<{ label: string; leadingIcon?: any; disabled?: boolean }> = ({ label, ...rest }) => (
  <Button {...rest} loading={false} label={label} variant="ghost" height={40} />
)

const MainViewFooter = ({ children, extraClassName }) => (
  <div className={`bg-white pl-4 pt-4 ${extraClassName}`}>{children}</div>
)

MainView.Header = Header
MainView.Content = Content
MainView.Footer = MainViewFooter

Header.Left = ContentLeft
Header.Right = ContentRight

ContentLeft.Title = Title

ContentRight.PrimaryCTA = PrimaryCTA
ContentRight.SecondaryCTA = SecondaryCTA

export default MainView
