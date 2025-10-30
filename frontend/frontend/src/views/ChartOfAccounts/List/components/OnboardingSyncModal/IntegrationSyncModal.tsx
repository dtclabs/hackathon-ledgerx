/* eslint-disable no-unneeded-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-else-return */
import React, { useEffect, useMemo, useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import Image from 'next/legacy/image'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { toast } from 'react-toastify'
import { Badge } from '@/components-v2/molecules/Badge'
import { useCountQuery } from '@/api-v2/chart-of-accounts'

import { useOnboardingImportAccountsMutation } from '@/api-v2/merge-rootfi-api'
import { isEmpty, capitalize } from 'lodash'
import SelectDropdown from '@/components-v2/Select/Select'
import { customCategoryStyles } from '@/views/Transactions-v2/TxGridTable/TxGridTableRow'
import {
  resolvedMappingCustomStyles,
  singleValueComponents
} from '../IntegrationSyncModal/FormatResolveMappingOptionLabel'
import { useAppSelector } from '@/state'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { IntegrationName } from '@/api-v2/organization-integrations'
import SyncCoaOption from '@/views/ChartOfAccounts/DefaultMapping/components/FormatCoAOptionLabel/SyncCoaOption'

const columns = [
  {
    Header: 'Code',
    accessor: 'code'
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Type',
    accessor: 'coa_type'
  },
  {
    Header: 'Txns Linked',
    accessor: 'linked'
  },
  {
    Header: 'Account',
    accessor: 'action'
  }
]

const OnboardingSyncModal = ({ provider, organizationId, onboardingAccounts }) => {
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)

  const [resolvedMap, setResolvedMap] = useState({})
  const [triggerImportOboarding, importOboardingApi] = useOnboardingImportAccountsMutation()
  const { data: unresolvedMappings, isLoading } = useCountQuery(
    { organizationId },
    { skip: onboardingAccounts.length === 0 }
  )

  useEffect(() => {
    if (provider.state.isOpen && organizationId) {
      // modifiedCoaQuery({ organizationId, integration: 'xero' })
    } else if (!provider.state.isOpen) {
      setResolvedMap({})
    }
  }, [provider.state.isOpen, organizationId])

  const handleOnClickCta = () => {
    const migrationData = []
    const parseHelper = []

    if (!isEmpty(resolvedMap)) {
      // setSelectedItemToMap(null)
      for (const [key, value] of Object.entries(resolvedMap)) {
        // @ts-ignore
        parseHelper.push(value?.remoteId)
        migrationData.push({
          // @ts-ignore
          remoteId: value?.remoteId,
          // @ts-ignore
          previousCOAId: value?.previousCOAId
        })
      }
    }

    const remoteIds = onboardingAccounts.map((row) => ({ remoteId: row.id }))

    triggerImportOboarding({
      organizationId,
      integrationName: accountingIntegration?.integrationName ?? IntegrationName.XERO,
      body: { COAData: remoteIds, migrationData }
    })
  }
  const integrationName = useMemo(
    () => (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'),
    [accountingIntegration?.integrationName]
  )

  useEffect(() => {
    if (importOboardingApi.isSuccess) {
      provider.methods.setIsOpen(false)
      toast.success(`Successfully synced with ${integrationName}`)
    } else if (importOboardingApi.isError) {
      toast.error(`Sorry, an error while syncing with ${integrationName}`)
    }
  }, [importOboardingApi])

  // const handleOnClickTryAgain = () => modifiedCoaQuery({ organizationId, integration: 'xero' })

  const handleOnClickCancel = () => {
    provider.methods.setIsOpen(false)
  }

  const emptyTableContent = useMemo(() => {
    return {
      icon: ErrorIcon,
      title: 'Unable to load Chart of Accounts',
      description: `There was an error syncing your Chart of Accounts from ${integrationName}. Please ensure that your internet connection is stable and try again.`,
      cta: {
        label: 'Try Again',
        onClick: () => console.log('')
      }
    }
  }, [accountingIntegration?.integrationName])

  const parsedChartOfAccounts: any = useMemo(() => {
    const groupedAccounts = {}

    onboardingAccounts.forEach((item) => {
      if (!groupedAccounts[item.type.toUpperCase().trim()]) {
        groupedAccounts[item.type.toUpperCase().trim()] = [
          {
            value: item.id,
            label: item.account_number ? `${item.account_number} - ${item.name}` : item.name
          }
        ]
      } else {
        groupedAccounts[item.type.toUpperCase().trim()].push({
          value: item.id,
          label: item.account_number ? `${item.account_number} - ${item.name}` : item.name
        })
      }
    })
    const accountOptions = Object.entries(groupedAccounts)
      .map(([key, options]) => ({
        label: key,
        options
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return [
      {
        value: null,
        label: 'No Account'
      },
      ...accountOptions
    ]
  }, [onboardingAccounts])

  const handleChangeResolve = (_data) => {
    setResolvedMap((prev) => ({ ...prev, [_data.previousCOAId]: _data }))
  }

  const handleDisabledCta = () => {
    return unresolvedMappings?.length !== Object.keys(resolvedMap).length || importOboardingApi.isLoading
  }

  return (
    <BaseModal provider={provider} width="850">
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon
          icon={accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroLogoIcon}
        />
        <BaseModal.Header.Title>Updates from {integrationName}</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>
      <BaseModal.Body>
        <div className="pr-24 pl-11">
          {unresolvedMappings?.length && (
            <Typography color="secondary" variant="body2">
              There are <span style={{ fontWeight: 600 }}>{unresolvedMappings.length}</span> updates detected.
            </Typography>
          )}
        </div>

        <div className="w-full min-w-[850px] pt-12">
          <SimpleTable
            defaultPageSize={5}
            tableHeight="h-[450px]"
            autoResetPage={false}
            noData={
              <div className="p-8 flex justify-center">
                <EmptyData loading={isLoading}>
                  <EmptyData.Icon icon={emptyTableContent?.icon} />
                  <EmptyData.Title>{emptyTableContent?.title}</EmptyData.Title>
                  <EmptyData.Subtitle>{emptyTableContent?.description}</EmptyData.Subtitle>
                  {emptyTableContent?.cta && (
                    <EmptyData.CTA label={emptyTableContent?.cta?.label} onClick={emptyTableContent?.cta?.onClick} />
                  )}
                </EmptyData>
              </div>
            }
            renderRow={(row) => {
              const resolvedAccount = onboardingAccounts?.find(
                (account) => resolvedMap?.[row?.original?.COA?.id]?.remoteId === account.id
              )
              return row.cells.map((cell) => {
                return (
                  <BaseTable.Body.Row.Cell {...cell.getCellProps()}>
                    {cell.render('Cell')}
                    {cell.column.id === 'code' && (
                      <Typography color="primary" variant="body2">
                        {row?.original?.COA?.code || '-'}
                      </Typography>
                    )}
                    {cell.column.id === 'name' && (
                      <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-2 ">
                          <Typography color="primary" variant="body2">
                            {row?.original?.COA?.name}
                          </Typography>
                          <Badge variant="rounded-outline" text="Removed" color="red" />
                        </div>
                        <div className="mt-1.5" style={{ overflow: 'hidden', maxWidth: 550 }}>
                          <Typography color="secondary" variant="body2">
                            {row?.original?.COA?.description}
                          </Typography>
                        </div>
                      </div>
                    )}
                    {cell.column.id === 'coa_type' && (
                      <Typography color="primary" variant="body2">
                        {capitalize(row?.original?.COA?.type)}
                      </Typography>
                    )}
                    {cell.column.id === 'linked' && (
                      <Typography color="primary" variant="body2">
                        {row?.original?.count}
                      </Typography>
                    )}
                    {cell.column.id === 'action' && (
                      <SelectDropdown
                        disableIndicator
                        isSearchable
                        styles={resolvedMappingCustomStyles}
                        className="w-[170px] 3xl:w-[150px]"
                        onChange={(option) => {
                          handleChangeResolve({
                            remoteId: option.value,
                            previousCOAId: row?.original?.COA?.id
                          })
                        }}
                        name="chartOfAccount"
                        options={parsedChartOfAccounts}
                        value={
                          resolvedMap?.[row?.original?.COA?.id]
                            ? resolvedAccount
                              ? {
                                  value: resolvedAccount.id,
                                  label: resolvedAccount.account_number
                                    ? `${resolvedAccount.account_number} - ${resolvedAccount.name}`
                                    : resolvedAccount.name
                                }
                              : { value: null, label: 'No Account' }
                            : { value: '', label: 'Select Account' }
                        }
                        customComponents={{ SingleValue: singleValueComponents }}
                        formatOptionLabel={SyncCoaOption}
                      />
                    )}
                  </BaseTable.Body.Row.Cell>
                )
              })
            }}
            pagination
            columns={columns}
            data={unresolvedMappings || []}
          />
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA
          disabled={importOboardingApi.isLoading}
          onClick={handleOnClickCancel}
          label="Cancel"
        />
        <BaseModal.Footer.PrimaryCTA
          onClick={handleOnClickCta}
          disabled={handleDisabledCta()}
          label={`Sync with ${integrationName}`}
          loadingWithLabel={importOboardingApi.isLoading}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default OnboardingSyncModal
