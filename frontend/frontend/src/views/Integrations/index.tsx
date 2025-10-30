import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { useOrganizationId } from '@/utils/getOrganizationId'
import useAuth0Service from '@/hooks-v2/useAuth0'
import { IntegrationName, useIntegrateThirdPartyAppMutation } from '@/api-v2/organization-integrations'
import { CardIntegration } from '@/components-v2/molecules/CardIntegration'
import Typography from '@/components-v2/atoms/Typography'
import XeroIcon from '@/public/svg/logos/xero-logo.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import RequestIcon from '@/public/svg/logos/request-logo.svg'
import TripleAIcon from '@/public/svg/logos/triple-a-logo.svg'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useMergeLink } from '@mergeapi/react-merge-link'
import DTCPaylogo from '@/public/svg/logos/dtcpay-circle.svg'
import { useRouter } from 'next/router'
import {
  useDisconnectIntegrationMutation,
  useIntegrationCodeRequestMutation,
  useSwapIntegrationTokenMutation,
  useSyncIntegrationSettingsMutation,
  useWhitelistRequestMutation,
  useWhitelistRequestStatusQuery
} from '@/api-v2/merge-rootfi-api'
import { toast } from 'react-toastify'
import { SyncCOAInfoModal } from './components/SyncCOAInfoModal'
import { DisconnectModal, WhitelistRequestModal, WhitelistSubmitModal } from '../ChartOfAccounts/List/components'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import Loading from '@/components/Loading'
import { useAppDispatch, useAppSelector } from '@/state'
import { subscriptionPlanSelector, toggleAddOnModal } from '@/slice/subscription/subscription-slice'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { DTCPayIntegrationModal } from './components'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import { setOrgSettings } from '@/slice/orgSettings/orgSettings-slice'
import SyncSettingsModal from './components/SyncSettingsModal'
import { useGetTimezonesQuery } from '@/api-v2/org-settings-api'
import { minutesTohhmm } from '@/utils-v2/formatTime'
import useRootfiSDK from '@/hooks-v2/useRootfiSDK'
import useStorage from '@/hooks-v2/utility/useStorage'
import Loader from '@/components/Loader/Loader'
import useOrgIntegrationsPolling from '@/hooks-v2/useOrgIntegrationsPolling'
import { OrgIntegrationStatus } from '@/slice/org-integration/org-integration-slice'

export type RootfiServiceIntegration = 'xero' | 'quickbooks'

const IntegrationsPage = () => {
  const rootfiService = useAppSelector((state) => state.featureFlag?.rootfiService)
  const organizationId = useOrganizationId()
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))

  const dispatch = useAppDispatch()

  const dtcPayIntegrationModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const whitelistRequestModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const whitelistSubmitModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const disconnectModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const syncCOAInfoModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const syncIntegrationSettingsModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const { checkWalletSync } = useWalletSync({
    organisationId: organizationId
  })

  const { setItem, getItem, removeItem } = useStorage('session')
  const [tempToken, setTempToken] = useState('')
  const [integrationType, setIntegrationType] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const { loginWithRedirect } = useAuth0Service({
    path: '/',
    authO: {
      domain: 'https://auth.request.finance',
      audience: 'accounts',
      clientID: process.env.NEXT_PUBLIC_REQUEST_FINANCE_CLIENTID ?? '',
      redirectUri: `${window.location.origin}/integrations/callback`
    }
  })
  const [triggerIntegrateApp, integrateAppApi] = useIntegrateThirdPartyAppMutation()
  const [syncIntegrationSettings, syncIntegrationSettingsResponse] = useSyncIntegrationSettingsMutation()

  const { data: organizationIntegrations, rootfiIntegration } = useOrgIntegrationsPolling({
    organizationId
  })
  const { data: timezones } = useGetTimezonesQuery({})
  const { data: xeroWhitelistRequestStatus, isLoading: whitelistRequestLoading } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.XERO
    },
    {
      skip: !organizationId || !subscriptionPlan?.organizationIntegrationAddOns?.xero
    }
  )

  const { data: quickBooksWhitelistRequestStatus, isLoading: QBWhitelistLoading } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.QUICKBOOKS
    },
    {
      skip: !organizationId || !subscriptionPlan?.organizationIntegrationAddOns?.quickbooks
    }
  )
  const { data: requestFinanceWhitelistRequestStatus, isLoading: RFwhitelistLoading } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.REQUEST_FINANCE
    },
    {
      skip: !organizationId || !subscriptionPlan?.organizationIntegrationAddOns?.quickbooks
    }
  )
  const { data: dtcPayWhitelistRequestStatus, isLoading: dtcPaywhitelistLoading } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.DTC_PAY
    },
    {
      skip: !organizationId || !subscriptionPlan?.organizationIntegrationAddOns?.dtcpay
    }
  )
  const { data: tripleAWhitelistRequestStatus, isLoading: tripleAWhitelistRequestLoading } =
    useWhitelistRequestStatusQuery(
      {
        organizationId,
        integration: IntegrationName.TRIPLE_A
      },
      {
        skip: !organizationId || !subscriptionPlan?.organizationIntegrationAddOns?.triple_a
      }
    )

  const { isReady, openLink, isSuccess, setInviteLinkId } = useRootfiSDK()
  const [triggerSwapToken, swapTokenApi] = useSwapIntegrationTokenMutation()
  const [triggerCodeRequest, codeRequestApi] = useIntegrationCodeRequestMutation()
  const [triggerDisconnect, disconnectApi] = useDisconnectIntegrationMutation()
  const [triggerWhitelistRequest, whitelistRequestApi] = useWhitelistRequestMutation()

  const onSuccessCodeSwap = useCallback(
    (publicToken) => {
      triggerSwapToken({
        organizationId,
        integration: integrationType,
        body: {
          token: publicToken
        }
      })
    },
    [organizationId, integrationType]
  )

  const { open } = useMergeLink({
    linkToken: tempToken,
    onSuccess: onSuccessCodeSwap
  })

  const handleSyncSettings = () => {
    syncIntegrationSettings({ organizationId, integration: integrationType })
  }

  useEffect(() => {
    if (syncIntegrationSettingsResponse.isSuccess) {
      toast.success('Organisation Settings updated')
      checkWalletSync()
      syncIntegrationSettingsModalProvider.methods.setIsOpen(false)
      dispatch(setOrgSettings(syncIntegrationSettingsResponse.data))
    } else if (syncIntegrationSettingsResponse.isError) {
      syncIntegrationSettingsModalProvider.methods.setIsOpen(false)
      if (syncIntegrationSettingsResponse?.error?.data?.message) {
        toast.error(syncIntegrationSettingsResponse?.error?.data?.message)
      } else {
        toast.error('Sorry, an unexpected error occurred')
      }
    }
  }, [syncIntegrationSettingsResponse])

  useEffect(() => {
    if (tempToken) {
      open()
    }
  }, [tempToken])

  useEffect(() => {
    if (
      !whitelistRequestLoading &&
      !QBWhitelistLoading &&
      !RFwhitelistLoading &&
      !dtcPaywhitelistLoading &&
      !tripleAWhitelistRequestLoading
    ) {
      setIsLoading(false)
    }
  }, [
    whitelistRequestLoading,
    QBWhitelistLoading,
    RFwhitelistLoading,
    dtcPaywhitelistLoading,
    tripleAWhitelistRequestLoading
  ])

  //  RootFi SDK check for successful connection
  useEffect(() => {
    const integration = getItem('integration-type')
    if (isSuccess) {
      triggerSwapToken({
        organizationId,
        integration,
        body: {
          token: getItem(`rootfi-linkId-${integration as RootfiServiceIntegration}`)
        }
      })
      removeItem('rootfi-linkId-xero')
      removeItem('rootfi-linkId-quickbooks')
    }
  }, [isSuccess])

  useEffect(() => {
    if (integrateAppApi.isError) {
      toast.error(integrateAppApi?.error?.data?.message ?? 'Integration request error.')
    } else if (integrateAppApi.isSuccess) {
      toast.success('Successfully connected to dtcpay')
      dtcPayIntegrationModalProvider.methods.setIsOpen(false)
    }
  }, [integrateAppApi])

  useEffect(() => {
    if (codeRequestApi.isSuccess) {
      if (rootfiService?.isEnabled) {
        const urlObj = new URL(codeRequestApi?.data?.linkToken)
        const inviteLinkID = urlObj.searchParams.get('invite_link_id')
        setItem(`rootfi-linkId-${integrationType as RootfiServiceIntegration}`, inviteLinkID)
        setInviteLinkId(inviteLinkID)
        if (isReady) openLink(inviteLinkID)
        return
      }
      setTempToken(codeRequestApi?.data?.linkToken)
      return
    }
    if (codeRequestApi.isError) {
      toast.error(codeRequestApi?.error?.data?.message ?? 'Integration connect error.')
    }
  }, [codeRequestApi, isReady])

  useEffect(() => {
    if (rootfiService?.isEnabled) {
      const integration = getItem('integration-type')
      const currentLinkId = getItem(`rootfi-linkId-${integration as RootfiServiceIntegration}`)
      if (integration && currentLinkId) {
        setInviteLinkId(currentLinkId)
      }
    }
  }, [rootfiService])

  useEffect(() => {
    if (whitelistRequestApi.isSuccess) {
      whitelistRequestModalProvider.methods.setIsOpen(false)
      whitelistSubmitModalProvider.methods.setIsOpen(true)
    } else if (whitelistRequestApi.isError) {
      whitelistRequestModalProvider.methods.setIsOpen(false)
      toast.error(whitelistRequestApi?.error?.data?.message ?? 'Integration request error.')
    }
  }, [whitelistRequestApi])

  useEffect(() => {
    if (disconnectApi.isSuccess) {
      toast.success('Successfully disconnected integration')
      disconnectModalProvider.methods.setIsOpen(false)
      setIntegrationType(null)
    } else if (disconnectApi.isError) {
      toast.error(disconnectApi?.error?.data?.message ?? 'Integration disconnect error.')
      disconnectModalProvider.methods.setIsOpen(false)
      setIntegrationType(null)
    }
  }, [disconnectApi])

  useEffect(() => {
    if (swapTokenApi.isSuccess) {
      toast.success(
        `Successfully connected to ${integrationType === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}`
      )
      syncCOAInfoModalProvider.methods.setIsOpen(true)
    }
  }, [swapTokenApi])

  // Request Finance Integration
  const handleConnectRequestFinance = async () => {
    setItem('integration-type', IntegrationName.REQUEST_FINANCE)
    setIntegrationType(IntegrationName.REQUEST_FINANCE)
    loginWithRedirect({ organizationId })
  }

  const handleDisconnectRequestFinance = () => {
    setItem('integration-type', IntegrationName.REQUEST_FINANCE)
    setIntegrationType(IntegrationName.REQUEST_FINANCE)
    disconnectModalProvider.methods.setIsOpen(true)
  }

  const handleConfirmDisconnectRequestFinance = () => {
    triggerDisconnect({ organizationId, integration: IntegrationName.REQUEST_FINANCE })
  }

  // Quickbooks Integration
  const handleConnectQuickbooks = () => {
    setItem('integration-type', IntegrationName.QUICKBOOKS)
    setIntegrationType(IntegrationName.QUICKBOOKS)
    const existingRootfiId = getItem('rootfi-linkId-quickbooks')
    if (rootfiService?.isEnabled && existingRootfiId) {
      openLink(existingRootfiId)
      return
    }
    triggerCodeRequest({ organizationId, integration: IntegrationName.QUICKBOOKS })
  }
  const handleDisconnectQuickbooks = () => {
    setItem('integration-type', IntegrationName.QUICKBOOKS)
    setIntegrationType(IntegrationName.QUICKBOOKS)
    disconnectModalProvider.methods.setIsOpen(true)
  }
  const handleConfirmDisconnectQuickbooks = () => {
    triggerDisconnect({ organizationId, integration: IntegrationName.QUICKBOOKS })
  }

  // Xero Integration
  const handleConnectXero = () => {
    setItem('integration-type', IntegrationName.XERO)
    setIntegrationType(IntegrationName.XERO)
    const existingRootfiId = getItem('rootfi-linkId-xero')
    if (rootfiService?.isEnabled && existingRootfiId) {
      openLink(existingRootfiId)
      return
    }
    triggerCodeRequest({ organizationId, integration: IntegrationName.XERO })
  }

  const handleDisconnectXero = () => {
    setItem('integration-type', IntegrationName.XERO)
    setIntegrationType(IntegrationName.XERO)
    disconnectModalProvider.methods.setIsOpen(true)
  }

  const handleConfirmDisconnectXero = () => {
    triggerDisconnect({ organizationId, integration: IntegrationName.XERO })
  }

  const handleConnectTripleA = () => {
    setItem('integration-type', IntegrationName.TRIPLE_A)
    setIntegrationType(IntegrationName.TRIPLE_A)
    triggerCodeRequest({ organizationId, integration: IntegrationName.TRIPLE_A })
  }

  const handleDisconnectTripleA = () => {
    setItem('integration-type', IntegrationName.TRIPLE_A)
    setIntegrationType(IntegrationName.TRIPLE_A)
    disconnectModalProvider.methods.setIsOpen(true)
  }

  const handleConfirmDisconnectTripleA = () => {
    triggerDisconnect({ organizationId, integration: IntegrationName.TRIPLE_A })
  }

  const handleConnectDtcPay = async () => {
    setItem('integration-type', IntegrationName.DTC_PAY)
    setIntegrationType(IntegrationName.DTC_PAY)
    dtcPayIntegrationModalProvider.methods.setIsOpen(true)
  }

  const handleDisconnectDtcpay = () => {
    setItem('integration-type', IntegrationName.DTC_PAY)
    setIntegrationType(IntegrationName.DTC_PAY)
    disconnectModalProvider.methods.setIsOpen(true)
  }

  const handleConfirmDisconnectDtcpay = () => {
    triggerDisconnect({ organizationId, integration: IntegrationName.DTC_PAY })
  }
  const handleRequestXero = () => {
    setIntegrationType(IntegrationName.XERO)
    whitelistRequestModalProvider.methods.setIsOpen(true)
  }
  const handleRequestTripleA = () => {
    setIntegrationType(IntegrationName.TRIPLE_A)
    whitelistRequestModalProvider.methods.setIsOpen(true)
  }

  const handleRequestRequestFinance = () => {
    setIntegrationType(IntegrationName.REQUEST_FINANCE)
    whitelistRequestModalProvider.methods.setIsOpen(true)
  }

  const handleRequestDtcpay = () => {
    setIntegrationType(IntegrationName.DTC_PAY)
    whitelistRequestModalProvider.methods.setIsOpen(true)
  }

  const handleRequestQuickbooks = () => {
    setIntegrationType(IntegrationName.QUICKBOOKS)
    whitelistRequestModalProvider.methods.setIsOpen(true)
  }

  const handleSubmitRequest = (_requestData) => {
    triggerWhitelistRequest({
      organizationId,
      body: {
        integrationName: integrationType,
        contactEmail: _requestData.email
      }
    })
  }

  const integrationSettings = useMemo(() => {
    const xeroIntegration =
      rootfiIntegration ||
      organizationIntegrations?.find((integration) => integration.integrationName === IntegrationName.XERO)
    // Enable for Xero
    if (xeroIntegration?.integrationName === IntegrationName.XERO && xeroIntegration?.metadata && timezones?.data) {
      const integrationTimezone = timezones?.data.find((item) => item.name === xeroIntegration.metadata?.timezone)
      if (integrationTimezone) {
        const timezoneString = `(UTC${parseInt(integrationTimezone.utcOffset) < 0 ? '-' : '+'}${minutesTohhmm(
          parseInt(integrationTimezone?.utcOffset)
        )}) ${integrationTimezone.name}`
        return {
          currency: xeroIntegration.metadata?.currency,
          timezone: timezoneString
        }
      }
      return {
        currency: null,
        timezone: null
      }
    }
    return {
      currency: null,
      timezone: null
    }
  }, [rootfiIntegration, organizationIntegrations, timezones])

  const handleShowAddOnModal = () => {
    dispatch(toggleAddOnModal(true))
  }

  const requestFinanceHandler = useMemo(() => {
    const requestIntegrations = organizationIntegrations?.find(
      (integration) => integration.integrationName === IntegrationName.REQUEST_FINANCE
    )

    if (!subscriptionPlan?.organizationIntegrationAddOns?.request_finance) {
      return {
        label: 'Request',
        locked: true,
        onclick: handleShowAddOnModal
      }
    }
    if (requestIntegrations) {
      return {
        label: 'Disconnect',
        isIntegrated: true,
        onclick: handleDisconnectRequestFinance
      }
    }
    switch (requestFinanceWhitelistRequestStatus?.status) {
      case 'approved':
        return {
          label: 'Connect',
          onclick: handleConnectRequestFinance
        }
      case 'requested':
        return {
          label: 'Requested',
          disabled: true
        }
      default:
        return {
          label: 'Request',
          onclick: handleRequestRequestFinance
        }
    }
  }, [organizationIntegrations, requestFinanceWhitelistRequestStatus, subscriptionPlan])

  const xeroIntegrationHandler = useMemo(() => {
    if (!subscriptionPlan?.organizationIntegrationAddOns?.xero) {
      return {
        label: 'Request',
        locked: true,
        onclick: handleShowAddOnModal
      }
    }

    let xeroIntegrations
    let mergeIntegration

    if (rootfiService?.isEnabled) {
      xeroIntegrations = organizationIntegrations?.find(
        (integration) => integration.integrationName === IntegrationName.XERO && integration.platform === 'rootfi'
      )
    } else {
      xeroIntegrations = organizationIntegrations?.find(
        (integration) => integration.integrationName === IntegrationName.XERO && integration.platform !== 'rootfi'
      )
    }

    if (
      rootfiService?.isEnabled &&
      (xeroIntegrations?.status === OrgIntegrationStatus.INITIATED || !xeroIntegrations)
    ) {
      mergeIntegration = organizationIntegrations?.find(
        (integration) =>
          integration.integrationName === IntegrationName.XERO &&
          integration.platform === 'merge' &&
          [OrgIntegrationStatus.COMPLETED, OrgIntegrationStatus.TOKEN_SWAPPED].includes(integration?.status)
      )

      if (mergeIntegration) {
        return {
          onclick: handleConnectXero,
          connectedAccount: mergeIntegration?.metadata?.companyName ?? 'Xero Account',
          isConnectedAnother: accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO,
          upgradeRequired: true
        }
      }
    }

    if (xeroIntegrations) {
      switch (xeroIntegrations?.status) {
        case OrgIntegrationStatus.TOKEN_SWAPPED:
          return {
            label: 'Disconnect',
            isIntegrated: true,
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO,
            connectedAccount: xeroIntegrations?.metadata?.companyName ?? 'Xero Account',
            onclick: handleDisconnectXero
          }
        case OrgIntegrationStatus.COMPLETED:
          return {
            label: 'Disconnect',
            isIntegrated: true,
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO,
            connectedAccount: xeroIntegrations?.metadata?.companyName ?? 'Xero Account',
            onclick: handleDisconnectXero
          }
        case OrgIntegrationStatus.MIGRATING:
          return {
            label: (
              <div className="flex flex-row items-center bg-transparent">
                <Loader />
                <Typography variant="caption" color="black" classNames="ml-2">
                  Upgrading...
                </Typography>
              </div>
            ),
            isIntegrated: true,
            disabled: true,
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO,
            connectedAccount: xeroIntegrations?.metadata?.companyName ?? 'Xero Account'
          }
        case OrgIntegrationStatus.FAILED:
          return {
            label: (
              <div className="flex flex-row items-center bg-transparent">
                <Typography variant="caption" color="black">
                  Upgrade
                </Typography>
              </div>
            ),
            disabled: true,
            failedMigration: true,
            connectedAccount: xeroIntegrations?.metadata?.companyName ?? 'Xero Account',
            isConnectedAnother: accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO
          }
        case OrgIntegrationStatus.INITIATED:
          return {
            label: 'Connect',
            onclick: handleConnectXero,
            // upgradeRequired: rootfiService?.isEnabled && mergeIntegration && xeroIntegrations?.status === 'initiated',
            isConnectedAnother: accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO
          }
        default:
          return {
            label: 'Connect',
            onclick: handleConnectXero,
            isConnectedAnother: accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO
          }
      }
    }
    switch (xeroWhitelistRequestStatus?.status) {
      case 'approved':
        return {
          label: 'Connect',
          onclick: handleConnectXero,
          isConnectedAnother: accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.XERO
        }
      case 'requested':
        return {
          label: 'Requested',
          disabled: true
        }
      default:
        return {
          label: 'Request',
          onclick: handleRequestXero
        }
    }
  }, [
    xeroWhitelistRequestStatus,
    codeRequestApi,
    organizationIntegrations,
    rootfiService,
    subscriptionPlan,
    accountingIntegration
  ])

  const tripleAHandler = useMemo(() => {
    const tripleAIntegrations = organizationIntegrations?.find(
      (integration) => integration.integrationName === IntegrationName.TRIPLE_A
    )

    if (!subscriptionPlan?.organizationIntegrationAddOns?.triple_a) {
      return {
        label: 'Request',
        locked: true,
        onclick: handleShowAddOnModal
      }
    }

    if (tripleAIntegrations && tripleAIntegrations?.status === 'completed') {
      return {
        label: 'Integrated',
        isIntegrated: true,
        connectedAccount: tripleAIntegrations?.metadata?.companyName ?? 'Triple_A Account',
        onclick: handleDisconnectTripleA
      }
    }
    if (tripleAWhitelistRequestStatus && tripleAWhitelistRequestStatus?.status === 'requested') {
      return {
        label: 'Requested',
        disabled: true
      }
    }

    return {
      label: 'Request',
      onclick: handleRequestTripleA
    }
  }, [tripleAWhitelistRequestStatus, organizationIntegrations, subscriptionPlan])

  const quickBooksIntegrationHandler = useMemo(() => {
    if (!subscriptionPlan?.organizationIntegrationAddOns?.quickbooks) {
      return {
        label: 'Request',
        locked: true,
        onclick: handleShowAddOnModal
      }
    }

    let quickbooksIntegrations
    let mergeIntegration

    if (rootfiService?.isEnabled) {
      quickbooksIntegrations = organizationIntegrations?.find(
        (integration) => integration.integrationName === IntegrationName.QUICKBOOKS && integration.platform === 'rootfi'
      )
    } else {
      quickbooksIntegrations = organizationIntegrations?.find(
        (integration) => integration.integrationName === IntegrationName.QUICKBOOKS && integration.platform !== 'rootfi'
      )
    }

    if (
      rootfiService?.isEnabled &&
      (quickbooksIntegrations?.status === OrgIntegrationStatus.INITIATED || !quickbooksIntegrations)
    ) {
      mergeIntegration = organizationIntegrations?.find(
        (integration) =>
          integration.integrationName === IntegrationName.QUICKBOOKS &&
          integration.platform === 'merge' &&
          [OrgIntegrationStatus.COMPLETED, OrgIntegrationStatus.TOKEN_SWAPPED].includes(integration?.status)
      )

      if (mergeIntegration) {
        return {
          onclick: handleConnectQuickbooks,
          connectedAccount: mergeIntegration?.metadata?.companyName ?? 'QuickBooks Account',
          isConnectedAnother:
            accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS,
          upgradeRequired: true
        }
      }
    }

    if (quickbooksIntegrations) {
      switch (quickbooksIntegrations?.status) {
        case OrgIntegrationStatus.TOKEN_SWAPPED:
          return {
            label: 'Disconnect',
            isIntegrated: true,
            connectedAccount: quickbooksIntegrations?.metadata?.companyName ?? 'QuickBooks Account',
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS,
            onclick: handleDisconnectQuickbooks
          }
        case OrgIntegrationStatus.COMPLETED:
          return {
            label: 'Disconnect',
            isIntegrated: true,
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS,
            connectedAccount: quickbooksIntegrations?.metadata?.companyName ?? 'QuickBooks Account',
            onclick: handleDisconnectQuickbooks
          }
        case OrgIntegrationStatus.MIGRATING:
          return {
            label: (
              <div className="flex flex-row items-center bg-transparent">
                <Loader />
                <Typography variant="caption" color="black" classNames="ml-2">
                  Upgrading...
                </Typography>
              </div>
            ),
            isIntegrated: true,
            disabled: true,
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS,
            connectedAccount: quickbooksIntegrations?.metadata?.companyName ?? 'QuickBooks Account'
          }
        case OrgIntegrationStatus.FAILED:
          return {
            label: (
              <div className="flex flex-row items-center bg-transparent">
                <Loader />
                <Typography variant="caption" color="black" classNames="ml-2">
                  Upgrading...
                </Typography>
              </div>
            ),
            disabled: true,
            failedMigration: true,
            connectedAccount: quickbooksIntegrations?.metadata?.companyName ?? 'Xero Account',
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS
          }
        case OrgIntegrationStatus.INITIATED:
          return {
            label: 'Connect',
            onclick: handleConnectQuickbooks,
            // upgradeRequired: rootfiService?.isEnabled && mergeIntegration && quickbooksIntegrations?.status === 'initiated',
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS
          }
        default:
          return {
            label: 'Connect',
            onclick: handleConnectQuickbooks,
            isConnectedAnother:
              accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS
          }
      }
    }

    switch (quickBooksWhitelistRequestStatus?.status) {
      case 'approved':
        return {
          label: 'Connect',
          onclick: handleConnectQuickbooks,
          isConnectedAnother:
            accountingIntegration && accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS
        }
      case 'requested':
        return {
          label: 'Requested',
          disabled: true
        }
      default:
        return {
          label: 'Request',
          onclick: handleRequestQuickbooks
        }
    }
  }, [
    codeRequestApi,
    organizationIntegrations,
    subscriptionPlan,
    rootfiService,
    accountingIntegration,
    quickBooksWhitelistRequestStatus
  ])

  const dtcPayIntegrationHandler = useMemo(() => {
    const dtcpayIntegration = organizationIntegrations?.find(
      (integration) => integration.integrationName === IntegrationName.DTC_PAY
    )

    if (!subscriptionPlan?.organizationIntegrationAddOns?.dtcpay) {
      return {
        label: 'Request',
        locked: true,
        onclick: handleShowAddOnModal
      }
    }
    if (dtcpayIntegration && dtcpayIntegration?.status === 'completed') {
      return {
        label: 'Disconnect',
        isIntegrated: true,
        connectedAccount: dtcpayIntegration?.metadata?.companyName ?? 'dtcpay Account',
        onclick: handleDisconnectDtcpay
      }
    }
    switch (dtcPayWhitelistRequestStatus?.status) {
      case 'approved':
        return {
          label: 'Connect',
          onclick: handleConnectDtcPay
        }
      case 'requested':
        return {
          label: 'Requested',
          disabled: true
        }
      default:
        return {
          label: 'Request',
          onclick: handleRequestDtcpay
        }
    }
  }, [organizationIntegrations, dtcPayWhitelistRequestStatus, subscriptionPlan])

  const disconnectModalHandler = useMemo(() => {
    switch (integrationType) {
      case IntegrationName.REQUEST_FINANCE:
        return {
          title: 'Disconnect from Request Finance?',
          description:
            'Disconnecting your Request Finance account from HQ will remove all of your synced invoices from the transactions.',
          onclick: handleConfirmDisconnectRequestFinance
        }
      case IntegrationName.XERO:
        return {
          title: 'Disconnect from Xero?',
          description:
            'Disconnecting from Xero now will require logging into Xero again for your next sync. Any edits on Xero will not be reflected unless synced again.',
          onclick: handleConfirmDisconnectXero
        }
      case IntegrationName.QUICKBOOKS:
        return {
          title: 'Disconnect from QuickBooks?',
          description:
            'Disconnecting from QuickBooks now will require logging into QuickBooks again for your next sync. Any edits on QuickBooks will not be reflected unless synced again.',
          onclick: handleConfirmDisconnectQuickbooks
        }
      case IntegrationName.DTC_PAY:
        return {
          title: 'Disconnect from dtcpay?',
          description:
            'You may have some pending invoices, disconnecting from dtcpay will automatically deactivate all invoice links. Do you wish to proceed?',
          onclick: handleConfirmDisconnectDtcpay
        }
      case IntegrationName.TRIPLE_A:
        return {
          title: 'Disconnect from Triple-A?',
          description: 'Do you wish to proceed?',
          onclick: handleConfirmDisconnectTripleA
        }
      default:
        return {}
    }
  }, [integrationType])

  const clickToRedirectToCOA = () => {
    router.push(`/${organizationId}/chart-of-accounts`)
  }

  const handleDtcIntegrationRequest = (_data) => {
    triggerIntegrateApp({
      organizationId,
      body: {
        integrationName: 'dtcpay',
        metadata: {
          ..._data
        }
      }
    })
  }

  return (
    <>
      <Header>
        <Header.Left>
          <div className="flex flex-row items-center gap-2">
            <Header.Left.Title>Integrations</Header.Left.Title>
          </div>
        </Header.Left>
      </Header>
      <View.Content>
        {isLoading ? (
          <Loading dark title="Fetching Data" />
        ) : (
          <section className="mt-6">
            <div className="flex flex-col gap-8">
              <section id="financial-integration">
                <Typography variant="body1" color="black" classNames="mb-4" styleVariant="semibold">
                  Payments
                </Typography>
                <div className="flex flex-row gap-8 flex-wrap">
                  {isOffRampEnabled && (
                    <CardIntegration
                      id="triple-a"
                      title="Triple-A"
                      isIntegrated={tripleAHandler?.isIntegrated ?? false}
                      description="Pay recipients in fiat using stables from your wallet. Request to start your verification."
                      type="Crypto-to-Fiat Payouts"
                      image={TripleAIcon}
                      onClick={tripleAHandler?.onclick ?? null}
                      CTALabel={tripleAHandler?.label}
                      locked={tripleAHandler?.locked}
                      disabled={tripleAHandler?.disabled}
                      connectedAccount={tripleAHandler?.connectedAccount ?? 'Triple-A Account'}
                      settings={integrationSettings}
                      onOpenSyncModal={() => {
                        syncIntegrationSettingsModalProvider.methods.setIsOpen(true)
                      }}
                    />
                  )}
                  <CardIntegration
                    id="request-finance"
                    title="Request Finance"
                    isIntegrated={requestFinanceHandler?.isIntegrated}
                    description="Connect with Request Finance and account for all invoices and related transactions."
                    type="Financial Transactions"
                    disabled={requestFinanceHandler?.disabled}
                    locked={requestFinanceHandler?.locked}
                    image={RequestIcon}
                    onClick={requestFinanceHandler?.onclick ?? null}
                    CTALabel={requestFinanceHandler?.label}
                  />
                  <CardIntegration
                    id="dtc-pay"
                    title="dtcpay"
                    isIntegrated={dtcPayIntegrationHandler?.isIntegrated ?? false}
                    description="Connect your dtcpay account to sync all transactions and track settlement statuses."
                    type="Invoices"
                    disabled={dtcPayIntegrationHandler?.disabled}
                    locked={dtcPayIntegrationHandler?.locked}
                    image={DTCPaylogo}
                    onClick={dtcPayIntegrationHandler?.onclick ?? null}
                    connectedAccount={dtcPayIntegrationHandler?.connectedAccount ?? 'DTC Account'}
                    CTALabel={dtcPayIntegrationHandler?.label}
                  />
                </div>
              </section>
              <section id="accounting-integration">
                <Typography variant="body1" color="black" classNames="mb-4" styleVariant="semibold">
                  Accounting
                </Typography>
                <div className="flex gap-8">
                  <CardIntegration
                    id="xero"
                    title="Xero"
                    isIntegrated={xeroIntegrationHandler?.isIntegrated}
                    description="Connect with Xero and sync your Chart of Accounts for reconciliation."
                    image={XeroIcon}
                    type="Accounting"
                    onClick={xeroIntegrationHandler?.onclick ?? null}
                    CTALabel={xeroIntegrationHandler?.label}
                    CTAButtonLoading={codeRequestApi.isLoading}
                    disabled={xeroIntegrationHandler?.disabled}
                    connectedAccount={xeroIntegrationHandler?.connectedAccount}
                    onClickUpgrade={handleConnectXero}
                    upgradeButtonLoading={codeRequestApi.isLoading}
                    settings={integrationSettings}
                    upgradeRequired={xeroIntegrationHandler?.upgradeRequired}
                    isConnectedAnother={xeroIntegrationHandler?.isConnectedAnother}
                    onOpenSyncModal={() => {
                      setIntegrationType(IntegrationName.XERO)
                      syncIntegrationSettingsModalProvider.methods.setIsOpen(true)
                    }}
                    failedMigration={xeroIntegrationHandler?.failedMigration}
                    onDisconnect={handleDisconnectXero}
                    locked={xeroIntegrationHandler?.locked}
                  />
                  <CardIntegration
                    id="quickbooks"
                    title="QuickBooks"
                    isIntegrated={quickBooksIntegrationHandler?.isIntegrated}
                    description="Connect with Quickbooks to sync your Chart of Accounts for reconciliation."
                    type="Accounting"
                    image={QuickBooksIcon}
                    onClick={quickBooksIntegrationHandler?.onclick ?? null}
                    CTALabel={quickBooksIntegrationHandler?.label}
                    CTAButtonLoading={codeRequestApi.isLoading}
                    disabled={quickBooksIntegrationHandler?.disabled}
                    connectedAccount={quickBooksIntegrationHandler?.connectedAccount}
                    onClickUpgrade={handleConnectQuickbooks}
                    upgradeButtonLoading={codeRequestApi.isLoading}
                    upgradeRequired={quickBooksIntegrationHandler?.upgradeRequired}
                    isConnectedAnother={quickBooksIntegrationHandler?.isConnectedAnother}
                    failedMigration={quickBooksIntegrationHandler?.failedMigration}
                    onDisconnect={handleDisconnectQuickbooks}
                    locked={quickBooksIntegrationHandler?.locked}
                  />
                </div>
              </section>
            </div>
          </section>
        )}
      </View.Content>
      <WhitelistRequestModal
        isLoading={whitelistRequestApi.isLoading}
        onClickSubmitRequest={handleSubmitRequest}
        provider={whitelistRequestModalProvider}
        integrationType={integrationType}
      />
      <WhitelistSubmitModal provider={whitelistSubmitModalProvider} integrationName={integrationType} />
      <DisconnectModal
        isLoading={disconnectApi.isLoading}
        provider={disconnectModalProvider}
        onClickPrimary={disconnectModalHandler.onclick}
        title={disconnectModalHandler.title}
        description={disconnectModalHandler.description}
      />
      <SyncCOAInfoModal
        isLoading={false}
        provider={syncCOAInfoModalProvider}
        onClickRedirect={clickToRedirectToCOA}
        integrationName={integrationType}
      />
      <SyncSettingsModal
        isLoading={syncIntegrationSettingsResponse.isLoading}
        provider={syncIntegrationSettingsModalProvider}
        onClickCTA={handleSyncSettings}
        integrationName={integrationType}
        settings={integrationSettings}
      />
      <DTCPayIntegrationModal
        isLoading={integrateAppApi.isLoading}
        onClickSubmitRequest={handleDtcIntegrationRequest}
        provider={dtcPayIntegrationModalProvider}
      />
    </>
  )
}

export default IntegrationsPage
