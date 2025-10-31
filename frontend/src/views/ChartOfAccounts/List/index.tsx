import Image from 'next/legacy/image'
import { capitalize, debounce } from 'lodash'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useMergeLink } from '@mergeapi/react-merge-link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Badge2 } from '@/components-v2/molecules/Badge'
import LinkIcon from '@/public/svg/icons/link-icon.svg'
import { Input } from '@/components-v2'
import useStorage from '@/hooks-v2/utility/useStorage'
import useRootfiSDK from '@/hooks-v2/useRootfiSDK'
import { useOrganizationId } from '@/utils/getOrganizationId'
import ReactTooltip from 'react-tooltip'
import { OrgIntegrationStatus } from '@/slice/org-integration/org-integration-slice'

// Components
import {
  ReplaceAccountsModal,
  CreateAccountModal,
  ImportAccountsModal,
  IntegrationSyncModal,
  DisconnectModal,
  WhitelistRequestModal,
  WhitelistSubmitModal
} from './components'

import { ConfirmModal } from './components/ConfirmModal'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { EditAccountModal } from './components/EditAccountModal'
import { OnboardingSyncModal } from './components/OnboardingSyncModal'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import Pagination from '@/components-v2/Pagination-v2/Pagination'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import LoadingOverlay from '@/components/InProcessToast/InProcessToast'
import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import ImportCSVModal from './components/ImportCSVAccountModal/ImportCSVAccountModal'
import SyncChip from '@/components-v2/molecules/SyncChip'
import syncButton from '@/public/svg/SyncButton.svg'

import { ACTION_DROPDOWN, PAGE_CONTENT_MAP, COA_TABLE_HEADERS } from './page-copy'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'

// Images
import MoreAction from '@/public/svg/MoreAction.svg'
import SettingsIcon from '@/public/svg/icons/settings-icon-2.svg'

// Queries
import {
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useGetChartOfAccountsQuery,
  useUpdateAccountMutation,
  useImportCoaAccountMutation,
  useImportCSVMutation,
  useCountQuery
} from '@/api-v2/chart-of-accounts'

import {
  useWhitelistRequestMutation,
  useWhitelistRequestStatusQuery,
  useIntegrationCodeRequestMutation,
  useSwapIntegrationTokenMutation,
  useOnboardingImportAccountsMutation,
  useDisconnectIntegrationMutation
} from '@/api-v2/merge-rootfi-api'

import { useAppDispatch, useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import ChartOfAccountsLoading from './components/ChartOfAccountsLoading'
import Typography from '@/components-v2/atoms/Typography'
import { planPermisstionSelector, toggleUpgradeModal } from '@/slice/subscription/subscription-slice'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { IntegrationName, integrationNameMap } from '@/api-v2/organization-integrations'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'
import RootfiIntegrationBanner from '@/components-v2/molecules/XeroIntegrationBanner/XeroIntegrationBanner'
import { RootfiServiceIntegration } from '../../Integrations'
import useOrgIntegrationsPolling from '@/hooks-v2/useOrgIntegrationsPolling'

const ChartOfAccountsView = () => {
  const router = useRouter()
  const isRootfiMigration = useRef(false)

  const showBanner = useAppSelector(showBannerSelector)
  const isLocked = useAppSelector(planPermisstionSelector)
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const dispatch = useAppDispatch()

  const organizationId = useOrganizationId()

  const [tempToken, setTempToken] = useState('')
  const [isIntegrationSuccess, setIsIntegrationSuccess] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const whitelistRequestModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const whitellistSubmitModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const replaceAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const createAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const importAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const syncIntegrationModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const editAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const deleteAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const disconnectModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const importCSVModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const onboardingSyncModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const [onboardingAccounts, setOnboardingAccounts] = useState([])

  const provider = useTableHook({})
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(25)
  const [triggerWhitelistRequest, whitelistRequestApi] = useWhitelistRequestMutation()
  const [triggerCodeRequest, codeRequestApi] = useIntegrationCodeRequestMutation()
  const [triggerSwapToken, swapTokenApi] = useSwapIntegrationTokenMutation()
  const [triggerImportCoaOnboarding, importCoaOnboardingApi] = useOnboardingImportAccountsMutation()
  const [triggerImportCoa, importCoaApi] = useImportCoaAccountMutation()
  const [triggerDisconnect, disconnectApi] = useDisconnectIntegrationMutation()
  const [triggerCreateAccount, createAccountApi] = useCreateAccountMutation()
  const [triggerDeleteAccount, deleteAccountApi] = useDeleteAccountMutation()
  const [triggerUpdateAccount, updateAccountApi] = useUpdateAccountMutation()
  const [triggerImportCSV, importCSVApi] = useImportCSVMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const { setItem, getItem, removeItem } = useStorage('session')
  const { isReady, openLink, isSuccess, setInviteLinkId } = useRootfiSDK()
  const [upgradeRequired, setUpgradeRequired] = useState<boolean>(false)
  const rootfiService = useAppSelector((state) => state.featureFlag?.rootfiService)
  const [isUpgradeBannerOpen, setIsUpgradeBannerOpen] = useState(false)

  useEffect(() => {
    if (router.query.importCoa) {
      importAccountModalProvider.methods.setIsOpen(true)
      router.push(`/${organizationId}/chart-of-accounts`)
    }
  }, [router.query])

  const onSuccessCodeSwap = useCallback(
    (publicToken) => {
      triggerSwapToken({
        organizationId,
        integration: IntegrationName.XERO,
        body: {
          token: publicToken
        }
      })
    },
    [organizationId]
  )

  const { open } = useMergeLink({
    linkToken: tempToken,
    onSuccess: onSuccessCodeSwap,
    onExit: () => {
      if (isIntegrationSuccess) {
        importAccountModalProvider.methods.setIsOpen(true)
      }
    }
  })

  const { data: unresolvedMappings, isLoading: isCountLoading } = useCountQuery(
    { organizationId },
    { skip: !organizationId }
  )

  const { data: organizationIntegration } = useOrgIntegrationsPolling({
    organizationId
  })

  const {
    data: importedChartOfAccounts,
    isLoading: chartOfAccountsLoading,
    isUninitialized: chartOfAccountsUninitialized
  } = useGetChartOfAccountsQuery(
    {
      organizationId
    },
    { skip: !organizationId }
  )

  // Get whitelist request status
  const { data: xeroWhitelistRequest } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.XERO
    },
    { skip: !organizationId || accountingIntegration?.integrationName !== IntegrationName.XERO }
  )

  const { data: quickBooksWhitelistRequest } = useWhitelistRequestStatusQuery(
    {
      organizationId,
      integration: IntegrationName.QUICKBOOKS
    },
    { skip: !organizationId || accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS }
  )

  useEffect(() => {
    if (!accountingIntegration) {
      importAccountModalProvider.methods.setIsOpen(false)
      onboardingSyncModalProvider.methods.setIsOpen(false)
      syncIntegrationModalProvider.methods.setIsOpen(false)
    }
  }, [accountingIntegration])

  useEffect(() => {
    if (disconnectApi.isSuccess) {
      toast.success('Successfully disconnected integration', { position: 'top-right' })
      disconnectModalProvider.methods.setIsOpen(false)
    } else if (disconnectApi.isError) {
      toast.error(disconnectApi?.error?.data?.message ?? 'Integration disconnect error.', { position: 'top-right' })
      disconnectModalProvider.methods.setIsOpen(false)
    }
  }, [disconnectApi])

  useEffect(() => {
    const integration = accountingIntegration?.integrationName || getItem('integration-type')
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
    if (swapTokenApi.isSuccess) {
      const integration = accountingIntegration?.integrationName || getItem('integration-type')
      toast.success(`Successfully connected to ${integrationNameMap[integration]}`)
      setIsIntegrationSuccess(true)
    }
  }, [swapTokenApi])

  useEffect(() => {
    if (codeRequestApi.isSuccess) {
      if (rootfiService?.isEnabled) {
        const urlObj = new URL(codeRequestApi?.data?.linkToken)
        const inviteLinkID = urlObj.searchParams.get('invite_link_id')
        const integration = accountingIntegration?.integrationName || getItem('integration-type')
        setItem(`rootfi-linkId-${integration as RootfiServiceIntegration}`, inviteLinkID)
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
      const integration = accountingIntegration?.integrationName || getItem('integration-type')
      const currentLinkId = getItem(`rootfi-linkId-${integration as RootfiServiceIntegration}`)
      if (integration && currentLinkId) {
        setInviteLinkId(currentLinkId)
      }
    }
  }, [rootfiService])

  useEffect(() => {
    if (createAccountApi.isSuccess) {
      toast.success('Successfully created account', { position: 'top-right' })
      createAccountModalProvider.methods.setIsOpen(false)
    } else if (createAccountApi.isError) {
      toast.error(createAccountApi?.error?.data?.message ?? 'Account creation error.', { position: 'top-right' })
    }
  }, [createAccountApi])

  useEffect(() => {
    if (importCSVApi.isSuccess) {
      toast.success('Successfully imported account', { position: 'top-right' })
      importCSVModalProvider.methods.setIsOpen(false)
    } else if (importCSVApi.isError) {
      toast.error(importCSVApi?.error ?? 'Import accounts error.', { position: 'top-right' })
    }
  }, [importCSVApi])

  useEffect(() => {
    if (updateAccountApi.isSuccess) {
      toast.success('Successfully updated account', { position: 'top-right' })
      editAccountModalProvider.methods.setIsOpen(false)
    } else if (updateAccountApi.isError) {
      toast.error(updateAccountApi?.error?.data?.message ?? 'Account update error.', { position: 'top-right' })
    }
  }, [updateAccountApi])

  useEffect(() => {
    if (deleteAccountApi.isSuccess) {
      toast.success('Successfully deleted account', { position: 'top-right' })
      deleteAccountModalProvider.methods.setIsOpen(false)
    } else if (deleteAccountApi.isError) {
      toast.error(deleteAccountApi?.error?.data?.message ?? 'Account delete error.', { position: 'top-right' })
    }
  }, [deleteAccountApi])

  useEffect(() => {
    if (whitelistRequestApi.isSuccess) {
      whitelistRequestModalProvider.methods.setIsOpen(false)
      whitellistSubmitModalProvider.methods.setIsOpen(true)
    } else if (whitelistRequestApi.isError) {
      whitelistRequestModalProvider.methods.setIsOpen(false)
      toast.error(whitelistRequestApi?.error?.data?.message ?? 'Integration request error.', { position: 'top-right' })
    }
  }, [whitelistRequestApi])

  useEffect(() => {
    if (importCoaOnboardingApi.isSuccess || importCoaApi.isSuccess) {
      toast.success('Successfully imported chart of accounts', { position: 'top-right' })
      importAccountModalProvider.methods.setIsOpen(false)
    } else if (importCoaOnboardingApi.isError || importCoaApi.isError) {
      const errorMessage =
        importCoaOnboardingApi?.error?.data?.message ??
        importCoaApi?.error?.data?.message ??
        'Chart of accounts import error.'
      toast.error(errorMessage, {
        position: 'top-right'
      })
    }
  }, [importCoaOnboardingApi, importCoaApi])

  const rootfiIntegration = useMemo(
    () => organizationIntegration?.find((integration) => integration?.platform === 'rootfi'),
    [organizationIntegration]
  )

  useEffect(() => {
    if (
      rootfiService?.isEnabled &&
      accountingIntegration?.platform === 'merge' &&
      (!rootfiIntegration || rootfiIntegration?.status === OrgIntegrationStatus.INITIATED)
    ) {
      setUpgradeRequired(true)
      setIsUpgradeBannerOpen(true)
      isRootfiMigration.current = true
    } else if (rootfiIntegration) {
      switch (rootfiIntegration?.status) {
        case OrgIntegrationStatus.TOKEN_SWAPPED:
          setUpgradeRequired(false)
          setIsUpgradeBannerOpen(false)
          isRootfiMigration.current = false
          break
        case OrgIntegrationStatus.COMPLETED:
          setUpgradeRequired(false)
          if (isRootfiMigration.current) {
            setIsUpgradeBannerOpen(true)
          } else {
            setIsUpgradeBannerOpen(false)
          }
          break
        case OrgIntegrationStatus.FAILED:
          setIsUpgradeBannerOpen(true)
          setUpgradeRequired(true)
          isRootfiMigration.current = true
          break
        case OrgIntegrationStatus.MIGRATING:
          setUpgradeRequired(true)
          setIsUpgradeBannerOpen(true)
          isRootfiMigration.current = true
          break
        default:
          setUpgradeRequired(false)
          setIsUpgradeBannerOpen(false)
      }
    }
  }, [accountingIntegration, rootfiIntegration, rootfiService])

  const accountingIntegrationName = useMemo(
    () =>
      accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS
        ? integrationNameMap[IntegrationName.QUICKBOOKS]
        : integrationNameMap[IntegrationName.XERO],
    [accountingIntegration?.integrationName]
  )

  const handleOnClickSubmitRequest = (_requestData) => {
    triggerWhitelistRequest({
      organizationId,
      body: {
        integrationName: IntegrationName.XERO,
        contactEmail: _requestData.email
      }
    })
  }

  const handleDropdownClick = (_option) => {
    if (_option?.locked) {
      handleShowUpgradeModal()
    } else if (_option.value === 'sync-xero') {
      syncIntegrationModalProvider.methods.setIsOpen(true)
    } else if (_option.value === 'create-coa') {
      createAccountModalProvider.methods.setIsOpen(true)
    } else if (_option.value === 'import-new') {
      importAccountModalProvider.methods.setIsOpen(true)
    } else if (_option.value === 'disconnect') {
      disconnectModalProvider.methods.setIsOpen(true)
    } else if (_option.value === 'connect-xero') {
      if (activeImportedAccounts?.length > 0) {
        replaceAccountModalProvider.methods.setIsOpen(true)
      } else {
        handleConnectXero()
      }
    } else if (_option.value === 'request-xero') {
      if (integrationHandler?.status === 'disconnected') {
        triggerCodeRequest({ organizationId, integration: IntegrationName.XERO })
      } else {
        whitelistRequestModalProvider.methods.setIsOpen(true)
      }
    } else if (_option.value === 'import-csv') {
      importCSVModalProvider.methods.setIsOpen(true)
    }
  }

  const handleConnectXero = () => {
    triggerCodeRequest({ organizationId, integration: IntegrationName.XERO })
  }

  const handleShowUpgradeModal = () => {
    dispatch(toggleUpgradeModal(true))
  }

  const handleClickAction = (_option) => {
    if (_option.value === 'edit-coa') {
      editAccountModalProvider.methods.setIsOpen(true)
    } else if (_option.value === 'delete-coa') {
      deleteAccountModalProvider.methods.setIsOpen(true)
    }
  }

  const handleRedirectToDefaultMapping = () => {
    router.push(`/${organizationId}/chart-of-accounts/default-mapping`)
  }

  const handleImportCoa = (_data, selectedRows) => {
    if (integrationHandler.status === 'completed') {
      triggerImportCoa({
        organizationId,
        integrationName: accountingIntegration?.integrationName,
        body: {
          COAData: _data
        }
      })
    } else {
      if (unresolvedMappings.length > 0) {
        setOnboardingAccounts(selectedRows)
        importAccountModalProvider.methods.setIsOpen(false)
        onboardingSyncModalProvider.methods.setIsOpen(true)
      } else {
        const onboardingData = _data.map((item) => ({ remoteId: item?.mergeAccountid }))
        triggerImportCoaOnboarding({
          organizationId,
          integrationName: accountingIntegration?.integrationName,
          body: {
            COAData: onboardingData,
            migrationData: []
          }
        })
      }
    }
  }

  const handleImportCSV = (_data) => {
    triggerImportCSV({
      organizationId,
      data: _data.map((item) => ({
        code: item.code,
        name: item.name,
        type: item.type.toUpperCase(),
        description: item.description
      }))
    })
  }

  const integrationHandler = useMemo(() => {
    let data: any = PAGE_CONTENT_MAP.default

    if (isLocked) {
      data = PAGE_CONTENT_MAP.default
    } else if (accountingIntegration) {
      switch (accountingIntegration?.status) {
        case 'token_swapped':
          data = PAGE_CONTENT_MAP[accountingIntegration?.integrationName].token_swapped
          break
        case 'completed':
          data = PAGE_CONTENT_MAP[accountingIntegration?.integrationName].completed
          break
        case 'initiated':
          data = PAGE_CONTENT_MAP[accountingIntegration?.integrationName].approved
          break
        default:
          data = PAGE_CONTENT_MAP.default
      }
      data.status = accountingIntegration?.status ?? ''
    } else if (xeroWhitelistRequest) {
      switch (xeroWhitelistRequest?.status) {
        case 'approved':
          data = PAGE_CONTENT_MAP.xero.approved
          break
        case 'requested':
          data = PAGE_CONTENT_MAP.xero.requested
          break
        default:
          data = PAGE_CONTENT_MAP.default
      }
      data.status = xeroWhitelistRequest?.status ?? ''
    } else if (quickBooksWhitelistRequest) {
      switch (quickBooksWhitelistRequest?.status) {
        case 'approved':
          data = PAGE_CONTENT_MAP.quickbooks.approved
          break
        case 'requested':
          data = PAGE_CONTENT_MAP.quickbooks.requested
          break
        default:
          data = PAGE_CONTENT_MAP.default
      }
      data.status = quickBooksWhitelistRequest?.status ?? ''
    }
    return {
      ...data,
      dropdown: {
        ...data?.dropdown,
        options: data?.dropdown?.options?.map((option) => ({ ...option, locked: isLocked && option.type === 'xero' }))
      },
      locked: isLocked
    }
  }, [isLocked, accountingIntegration, xeroWhitelistRequest, quickBooksWhitelistRequest])

  const handleOnClickCta = () => {
    if (isLocked) {
      handleShowUpgradeModal()
      return
    }

    if (upgradeRequired) {
      const existingRootfiId = getItem(
        `rootfi-linkId-${accountingIntegration?.integrationName as RootfiServiceIntegration}`
      )
      if (rootfiService?.isEnabled && existingRootfiId) {
        openLink(existingRootfiId)
        return
      }
      triggerCodeRequest({ organizationId, integration: accountingIntegration?.integrationName })
      return
    }

    switch (integrationHandler.status) {
      case 'approved':
      case 'initiated':
        triggerCodeRequest({ organizationId, integration: accountingIntegration?.integrationName })
        break
      case 'token_swapped':
      case 'completed':
        importAccountModalProvider.methods.setIsOpen(true)
        break
      default:
        whitelistRequestModalProvider.methods.setIsOpen(true)
        break
    }
  }

  const handleDisconnect = () => {
    triggerDisconnect({ organizationId, integration: accountingIntegration?.integrationName })
  }

  const handleCreateAccount = (_data) => {
    triggerCreateAccount({
      organizationId,
      body: _data
    })
  }
  const handleEditAccount = (_data) => {
    triggerUpdateAccount({
      organizationId,
      id: selectedAccount.id,
      body: _data
    })
  }
  const handleDeleteAccount = () => {
    triggerDeleteAccount({ organizationId, id: selectedAccount?.id })
  }

  const handleClickCOA = (_row) => {
    router.push(`/${organizationId}/chart-of-accounts/${_row.original.id}`)
  }

  const handleOnClickPrimaryCta = () => {
    switch (integrationHandler.status) {
      case 'approved':
        triggerCodeRequest({ organizationId, integration: IntegrationName.XERO })
        break
      case 'initiated':
        createAccountModalProvider.methods.setIsOpen(true)
        break
      case 'token_swapped':
        importAccountModalProvider.methods.setIsOpen(true)
        break
      case 'completed':
        syncIntegrationModalProvider.methods.setIsOpen(true)
        break
      default:
        createAccountModalProvider.methods.setIsOpen(true)
        break
    }
  }

  const isLoading = chartOfAccountsLoading || chartOfAccountsUninitialized

  const WHITE_LIST_BUTTONS = ['requested', 'approved', 'disconnected', 'initiated']

  const activeImportedAccounts = useMemo(() => {
    if (importedChartOfAccounts) {
      return importedChartOfAccounts.filter(
        (item) =>
          item.status === 'ACTIVE' &&
          (item?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    return []
  }, [importedChartOfAccounts, searchTerm])

  const totalItems = activeImportedAccounts.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const pagedAccounts = useMemo(() => {
    const start = page * limit
    const end = start + limit
    return activeImportedAccounts.slice(start, end)
  }, [activeImportedAccounts, page, limit])

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(0)
    }
  }, [totalPages])

  useEffect(() => {
    provider?.methods?.setPageSize(limit)
  }, [limit])

  const handleChange = debounce((e) => {
    setSearchTerm(e.target.value)
  }, 250)

  const actionOptions = useMemo(
    () =>
      integrationHandler?.status === '' ? ACTION_DROPDOWN : ACTION_DROPDOWN.filter((item) => item.value !== 'edit-coa'),
    [integrationHandler?.status]
  )

  const handleBannerClose = () => {
    isRootfiMigration.current = false
    setIsUpgradeBannerOpen(false)
  }

  const totalLength = pagedAccounts.length === 0 ? 0 : pagedAccounts.length
  const emptyRows = (provider?.state?.pageSize ?? limit) - totalLength

  return (
    <div className="bg-white p-4 rounded-lg">
      {codeRequestApi?.isLoading && <LoadingOverlay title="Loading" />}
      <Header>
        <Header.Left>
          <div>
            <Header.Left.Title>
              <div className="flex gap-x-3 items-center">
                Chart of Accounts{' '}
                {rootfiIntegration?.status === OrgIntegrationStatus.MIGRATING && (
                  <Badge2 variant="rounded">
                    <Badge2.Icon className="animate-spin" icon={syncButton} />
                    <Badge2.Label>Migrating Data...</Badge2.Label>
                  </Badge2>
                )}
                {(integrationHandler.status === 'completed' || integrationHandler.status === 'token_swapped') && (
                  <Badge2 variant="rounded" color="success">
                    <Badge2.Icon icon={LinkIcon} />
                    <Badge2.Label>
                      Connected to{' '}
                      {accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}
                    </Badge2.Label>
                  </Badge2>
                )}
                <Typography
                  variant="subtitle2"
                  classNames="underline underline-offset-2 font-normal pointer-events-none hidden"
                >
                  Learn More
                </Typography>
              </div>
            </Header.Left.Title>

            <Typography classNames="mt-2 mb-4" variant="body1">
              A list of all your accounts that spends or generates income.
            </Typography>
          </div>
        </Header.Left>
        <Header.Right>
          <div className="min-w-[170px]" data-tip="upgrade-required-tooltip" data-for="upgrade-required-tooltip">
            <Header.Right.SecondaryCTA
              leadingIcon={<Image src={SettingsIcon} height={15} width={15} />}
              label="Account Rules"
              disabled={!importedChartOfAccounts || importedChartOfAccounts.length === 0 || upgradeRequired}
              onClick={handleRedirectToDefaultMapping}
            />
          </div>
          <div data-tip="upgrade-required-tooltip" data-for="upgrade-required-tooltip">
            <ButtonDropdown>
              <ButtonDropdown.CTA
                label={integrationHandler?.dropdown?.label}
                leadingIcon={<Image src={integrationHandler?.dropdown?.icon} alt="dropdown-icon" />}
                onClick={handleOnClickPrimaryCta}
                disabled={upgradeRequired}
                classNames="sm:!text-[10px]"
              />
              <ButtonDropdown.Options
                extendedClass="min-w-[153px]"
                options={integrationHandler?.dropdown?.options}
                onClick={handleDropdownClick}
              />
            </ButtonDropdown>
          </div>
        </Header.Right>
      </Header>

      <View.Content>
        {isUpgradeBannerOpen && (
          <RootfiIntegrationBanner
            integration={integrationNameMap[accountingIntegration?.integrationName]}
            onClickUpgrade={handleOnClickCta}
            migrationStatus={rootfiIntegration?.status}
            onHandleBannerClose={handleBannerClose}
          />
        )}
        <div className="w-[30%] sm:w-full sm:mt-4 mb-4">
          <Input placeholder="Search by Name/Code" onChange={handleChange} isSearch classNames="h-[32px]" />
        </div>
        <div className={isUpgradeBannerOpen ? 'h-[calc(100%-130px)]' : 'h-[calc(100%-200px)]'}>
          <SimpleTable
            provider={provider}
            noData={
              isLoading ? (
                <ChartOfAccountsLoading emptyRows={emptyRows} />
              ) : searchTerm.length > 0 ? (
                <EmptyData loading={isLoading}>
                  <EmptyData.Icon />
                  <EmptyData.Title>No Chart of Accounts found</EmptyData.Title>
                </EmptyData>
              ) : (
                <EmptyData loading={isLoading}>
                  <EmptyData.Icon icon={integrationHandler.icon} />
                  <EmptyData.Title>{integrationHandler.title}</EmptyData.Title>
                  <EmptyData.Subtitle>{integrationHandler.subTitle}</EmptyData.Subtitle>
                  <div className="w-full flex flex-row gap-x-2 justify-center">
                    <a href="/" target="_blank" rel="noopener noreferrer">
                      <EmptyData.CTA label="Learn More" />
                    </a>
                    <EmptyData.CTA
                      disabled={integrationHandler?.isCtaDisabled || codeRequestApi?.isLoading}
                      label={integrationHandler?.ctaLabel}
                      onClick={handleOnClickCta}
                      leadingIcon={integrationHandler?.ctaIcon}
                      loading={codeRequestApi?.isLoading}
                    />
                  </div>
                </EmptyData>
              )
            }
            isLoading={isLoading}
            tableHeight={showBanner ? 'h-[calc(100vh-352px)]' : 'h-[calc(100vh-284px)]'}
            defaultPageSize={limit}
            onClickRow={(_row) => handleClickCOA(_row)}
            renderRow={(row) => (
              <>
                <BaseTable.Body.Row.Cell>{row?.original?.code || '-'}</BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>{row?.original?.name}</BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>{capitalize(row?.original?.type)}</BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>{row?.original?.description || '-'}</BaseTable.Body.Row.Cell>
                <td className="flex justify-end items-center h-full font-sm">
                  <ButtonDropdown>
                    <ButtonDropdown.CTA
                      disabled={upgradeRequired}
                      trailingIcon={<Image src={MoreAction} alt="3 dot" width={14} height={14} />}
                      variant="ghost"
                      classNames="border-none"
                    />
                    <ButtonDropdown.Options
                      extendedClass="!top-7"
                      options={actionOptions}
                      onClick={(_option) => {
                        handleClickAction(_option)
                        setSelectedAccount(row.original)
                      }}
                    />
                  </ButtonDropdown>
                </td>
              </>
            )}
            columns={COA_TABLE_HEADERS}
            data={pagedAccounts || []}
            pagination={false}
          />
          {!isLoading && totalItems > 0 && (
            <div className="mt-4 flex justify-start">
              <Pagination
                totalPages={totalPages}
                currentPage={page + 1}
                onPageChange={(_current, direction) => {
                  if (direction === 'forward') {
                    setPage((p) => Math.min(p + 1, totalPages - 1))
                  } else {
                    setPage((p) => Math.max(p - 1, 0))
                  }
                }}
                rowsPerPage={limit}
                rowsPerPageOptions={[25, 50, 100]}
                onRowsPerPageChange={(row) => {
                  setLimit(row)
                  setPage(0)
                }}
                onSelectPage={(pageIndex) => setPage(pageIndex)}
              />
            </div>
          )}
        </div>
      </View.Content>
      <WhitelistRequestModal
        isLoading={whitelistRequestApi.isLoading}
        onClickSubmitRequest={handleOnClickSubmitRequest}
        provider={whitelistRequestModalProvider}
      />

      <WhitelistSubmitModal provider={whitellistSubmitModalProvider} />
      <ImportAccountsModal
        organizationId={organizationId}
        provider={importAccountModalProvider}
        onClickPrimary={handleImportCoa}
        isLoading={importCoaApi.isLoading || importCoaOnboardingApi.isLoading}
      />

      <ReplaceAccountsModal provider={replaceAccountModalProvider} onClickPrimaryCTA={handleConnectXero} />
      <CreateAccountModal
        provider={createAccountModalProvider}
        onClickPrimary={handleCreateAccount}
        isLoading={createAccountApi.isLoading}
      />
      <DisconnectModal
        isLoading={disconnectApi.isLoading}
        provider={disconnectModalProvider}
        onClickPrimary={handleDisconnect}
        title={`Disconnect from ${accountingIntegrationName}`}
        description={`Disconnecting from ${accountingIntegrationName} now will require logging into ${accountingIntegrationName} again for your next sync. Any edits on ${accountingIntegrationName} will not
        be reflected unless synced again.`}
      />

      <IntegrationSyncModal
        onClickPrimary={() => console.log('WEE')}
        organizationId={organizationId}
        provider={syncIntegrationModalProvider}
      />
      <EditAccountModal
        provider={editAccountModalProvider}
        onClickPrimary={handleEditAccount}
        isLoading={false}
        account={selectedAccount}
      />
      {/* Delete Modal */}
      <ConfirmModal
        provider={deleteAccountModalProvider}
        isLoading={false}
        title="Delete Account"
        decription={
          <p className="mr-12">
            You are about to delete the account, <b>“{selectedAccount?.name}”</b>.<br />
            <br />
            This account may be mapped to some transactions, and they will lose their account mapping. Do you wish to
            proceed?
          </p>
        }
        onClickConfirm={handleDeleteAccount}
        confirmBtnLabel="Delete"
      />
      <ImportCSVModal
        onSubmit={handleImportCSV}
        importedChartOfAcconts={importedChartOfAccounts}
        provider={importCSVModalProvider}
      />

      <OnboardingSyncModal
        onboardingAccounts={onboardingAccounts}
        provider={onboardingSyncModalProvider}
        organizationId={organizationId}
      />
      {upgradeRequired && (
        <ReactTooltip
          id="upgrade-required-tooltip"
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          place="left"
          className="w-[250px] !px-[10px]"
        >
          <Typography variant="caption" styleVariant="semibold" classNames="mb-1">
            {rootfiIntegration?.status === 'migrating'
              ? 'Upgrade in progress'
              : rootfiIntegration?.status === 'failed'
              ? 'Failed to migrate'
              : 'Upgrade Required'}
          </Typography>
          <Typography variant="caption">
            {rootfiIntegration?.status === 'migrating'
              ? 'This service is temporarily unavailable. Please wait a few minutes for process to be completed.'
              : 'This service is temporarily unavailable. Please upgrade to continue.'}
          </Typography>
        </ReactTooltip>
      )}
    </div>
  )
}

export default ChartOfAccountsView
