/* eslint-disable guard-for-in */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-else-return */
import React, { useEffect, useMemo, useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import Image from 'next/legacy/image'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { toast } from 'react-toastify'
import { Badge } from '@/components-v2/molecules/Badge'
import SuccessIcon from '@/public/svg/Success.svg'
import { useLazyModifiedIntegrationQuery, useUpdateModifiedAccountsMutation } from '@/api-v2/merge-rootfi-api'
import { isEmpty, capitalize, forEach } from 'lodash'
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import { useGetChartOfAccountsMappingQuery } from '@/api-v2/chart-of-accounts-mapping'
import SelectDropdown from '@/components-v2/Select/Select'
import { resolvedMappingCustomStyles, singleValueComponents } from './FormatResolveMappingOptionLabel'
import { useAppDispatch, useAppSelector } from '@/state'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { api } from '@/api-v2'
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

const IntegrationSyncModal = ({ provider, onClickPrimary, organizationId }) => {
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const importedChartOfAccounts = useAppSelector(chartOfAccountsSelector)
  const dispatch = useAppDispatch()

  const integrationName = accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
  const [resolvedMap, setResolvedMap] = useState({})
  const [modifiedCoaQuery, modifiedCoaQueryApi] = useLazyModifiedIntegrationQuery()
  const [triggerSaveModified, saveModifiedApi] = useUpdateModifiedAccountsMutation()
  const { data: chartOfAccountsMapping, isLoading: isLoadingChartOfAccountMapping } = useGetChartOfAccountsMappingQuery(
    { organizationId },
    { skip: !organizationId }
  )

  useEffect(() => {
    if (provider.state.isOpen && organizationId) {
      modifiedCoaQuery({ organizationId, integration: accountingIntegration?.integrationName ?? IntegrationName.XERO })
    } else if (!provider.state.isOpen) {
      setResolvedMap({})
    }
  }, [provider.state.isOpen, organizationId])

  const handleOnClickCta = () => {
    const data = {
      modifiedData: [],
      restoredData: [],
      archivedData: [],
      deletedData: []
    }

    forEach(parseSyncedAccounts?.data, (item) => {
      if (item.type === 'modified') {
        data.modifiedData.push({
          mergeAccountid: item?.chartOfAccount?.id
        })
      }

      if (item.type === 'restored') {
        data.restoredData.push({
          id: item?.chartOfAccount?.id
        })
      }

      if (item.type === 'deleted') {
        data.deletedData.push({
          previousCOAId: item?.chartOfAccount?.id,
          ...(resolvedMap[item?.chartOfAccount?.id] && { newCOAId: resolvedMap[item?.chartOfAccount?.id].newCOAId })
        })
      }

      if (item.type === 'archived') {
        data.archivedData.push({
          previousCOAId: item?.chartOfAccount?.id,
          ...(resolvedMap[item?.chartOfAccount?.id] && { newCOAId: resolvedMap[item?.chartOfAccount?.id].newCOAId })
        })
      }
    })
    triggerSaveModified({
      organizationId,
      integration: accountingIntegration?.integrationName,
      body: data
    })
  }

  useEffect(() => {
    if (saveModifiedApi.isSuccess) {
      provider.methods.setIsOpen(false)
      toast.success('Successfully synced modified accounts')
    } else if (saveModifiedApi.isError) {
      toast.error('Sorry, an error while syncing modified accounts')
    }
  }, [saveModifiedApi])

  const handleOnClickTryAgain = () =>
    modifiedCoaQuery({ organizationId, integration: accountingIntegration?.integrationName })

  const handleOnClickCancel = () => {
    provider.methods.setIsOpen(false)
  }

  const emptyTableContent = useMemo(() => {
    if (modifiedCoaQueryApi.isSuccess) {
      const modified = modifiedCoaQueryApi?.data?.modifiedCOA?.length
      const archived = modifiedCoaQueryApi?.data?.archivedCOA?.length
      const deleted = modifiedCoaQueryApi?.data?.deletedCOA?.length
      const restored = modifiedCoaQueryApi?.data?.restoredCOA?.length
      const total = modified + archived + deleted + restored
      if (total === 0) {
        return {
          title: `You are fully synced with ${integrationName}!`,
          description: `No new updates detected from your ${integrationName} Chart of Accounts.`,
          icon: SuccessIcon,
          primaryCTA: {
            label: 'OK',
            onClick: handleOnClickCancel
          }
        }
      }
    } else if (modifiedCoaQueryApi.isError) {
      dispatch(api.util.invalidateTags(['organization-integrations-list']))
      return {
        icon: ErrorIcon,
        title: 'Unable to load Chart of Accounts',
        description: `There was an error syncing your Chart of Accounts from ${integrationName}. Please ensure that your internet connection is stable and try again.`,
        cta: {
          label: 'Try Again',
          onClick: handleOnClickTryAgain
        }
      }
    }
    return {}
  }, [modifiedCoaQueryApi])

  useEffect(() => {
    if (modifiedCoaQueryApi?.isError) {
      toast.error(
        modifiedCoaQueryApi?.error?.data.statusCode === 500
          ? `Getting chart of accounts from ${integrationName} failed`
          : modifiedCoaQueryApi?.error?.data.message
      )
    }
  }, [modifiedCoaQueryApi?.isError])

  const parseSyncedAccounts = useMemo(() => {
    const data = []
    const itemsToResolve = []
    if (modifiedCoaQueryApi.isSuccess) {
      if (modifiedCoaQueryApi?.data?.modifiedCOA?.length > 0) {
        modifiedCoaQueryApi?.data?.modifiedCOA.forEach((account) => {
          data.push({
            type: 'modified',
            chartOfAccount: {
              ...account
            }
          })
        })
      }
      if (modifiedCoaQueryApi?.data?.archivedCOA?.length > 0) {
        modifiedCoaQueryApi?.data?.archivedCOA.forEach((account) => {
          if (account.count > 0 && !resolvedMap[account?.chartOfAccount?.id]) {
            itemsToResolve.push(account?.chartOfAccount?.id)
          }
          data.push({
            type: 'archived',
            ...account
          })
        })
      }

      if (modifiedCoaQueryApi?.data?.deletedCOA?.length > 0) {
        modifiedCoaQueryApi?.data?.deletedCOA.forEach((account) => {
          if (account.count > 0 && !resolvedMap[account?.chartOfAccount?.id]) {
            itemsToResolve.push(account?.chartOfAccount?.id)
          }
          data.push({
            type: 'deleted',
            ...account
          })
        })
      }

      if (modifiedCoaQueryApi?.data?.restoredCOA?.length > 0) {
        modifiedCoaQueryApi?.data?.restoredCOA.forEach((account) => {
          data.push({
            type: 'restored',
            ...account
          })
        })
      }
    }

    return {
      data,
      itemsToResolve
    }
  }, [modifiedCoaQueryApi, resolvedMap])

  const parsedChartOfAccounts: any = useMemo(() => {
    const removedCOAIds = []
    const groupedAccounts = {}
    if (parseSyncedAccounts?.data?.length) {
      parseSyncedAccounts?.data?.forEach((item) => {
        if (item.type === 'archived' || item.type === 'deleted') {
          removedCOAIds.push(item?.chartOfAccount.id)
        }
      })
    }
    importedChartOfAccounts
      ?.filter((coa) => !removedCOAIds.includes(coa.id))
      .forEach((item) => {
        if (!groupedAccounts[item.type.toUpperCase().trim()]) {
          groupedAccounts[item.type.toUpperCase().trim()] = [
            {
              value: item.id,
              label: item.label
            }
          ]
        } else {
          groupedAccounts[item.type.toUpperCase().trim()].push({
            value: item.id,
            label: item.label
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
  }, [parseSyncedAccounts, importedChartOfAccounts])

  const handleChangeResolve = (data) => {
    setResolvedMap((prev) => ({ ...prev, [data.previousCOAId]: data }))
  }

  const isCtaDisabled = () => {
    if (Object.keys(emptyTableContent).length) {
      return true
    }

    return (
      modifiedCoaQueryApi?.isLoading ||
      modifiedCoaQueryApi?.isFetching ||
      saveModifiedApi.isLoading ||
      (parseSyncedAccounts?.data?.length === 0 && Object.keys(resolvedMap).length === 0) ||
      parseSyncedAccounts?.data?.length === 0 ||
      parseSyncedAccounts?.itemsToResolve?.length > 0
    )
  }

  return (
    <BaseModal provider={provider} width="850">
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon
          icon={accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroLogoIcon}
        />
        <BaseModal.Header.Title>
          Updates from {accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}
        </BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>
      <BaseModal.Body>
        {!modifiedCoaQueryApi?.isFetching && (
          <Typography classNames="pl-14" color="secondary" variant="body2">
            There are <span style={{ fontWeight: 600 }}>{parseSyncedAccounts?.data?.length}</span> updates detected.
          </Typography>
        )}

        <div className="w-full min-w-[850px] pt-8">
          <SimpleTable
            defaultPageSize={5}
            tableHeight="h-[450px]"
            autoResetPage={false}
            noData={
              <div className="p-8 flex justify-center">
                <EmptyData loading={modifiedCoaQueryApi?.isLoading || modifiedCoaQueryApi?.isFetching}>
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
              const coaMappingIds = chartOfAccountsMapping?.map((item) => item?.chartOfAccount?.id)
              const resolvedAccount = importedChartOfAccounts?.find(
                (account) => resolvedMap?.[row?.original?.chartOfAccount?.id]?.newCOAId === account.id
              )

              if (
                row.original?.type === 'archived' ||
                row.original?.type === 'deleted' ||
                row.original?.type === 'restored'
              ) {
                return row.cells.map((cell) => (
                  <BaseTable.Body.Row.Cell {...cell.getCellProps()}>
                    {cell.render('Cell')}
                    {cell.column.id === 'code' && (
                      <Typography color="primary" variant="body2">
                        {row?.original?.chartOfAccount?.code || '-'}
                      </Typography>
                    )}
                    {cell.column.id === 'name' && (
                      <div className="flex flex-col">
                        <div className="flex flex-row items-center gap-2 ">
                          <Typography color="primary" variant="body2">
                            {row?.original?.chartOfAccount?.name}
                          </Typography>
                          <Badge variant="rounded-outline" text={capitalize(row?.original?.type)} color="red" />
                        </div>
                        <div className="mt-1.5" style={{ overflow: 'hidden', maxWidth: 550 }}>
                          <Typography color="secondary" variant="body2">
                            {row?.original?.chartOfAccount?.description}
                          </Typography>
                        </div>
                      </div>
                    )}
                    {cell.column.id === 'coa_type' && (
                      <Typography color="primary" variant="body2">
                        {capitalize(row?.original?.chartOfAccount?.type)}
                      </Typography>
                    )}
                    {cell.column.id === 'linked' && (
                      <Typography color="primary" variant="body2">
                        {row?.original?.count}
                      </Typography>
                    )}
                    {cell.column.id === 'action' &&
                      (coaMappingIds.includes(row?.original?.chartOfAccount?.id) || row?.original?.count > 0) && (
                        <SelectDropdown
                          disableIndicator
                          isSearchable
                          styles={resolvedMappingCustomStyles}
                          className="w-[170px] 3xl:w-[150px]"
                          onChange={(option) => {
                            handleChangeResolve({
                              newCOAId: option.value,
                              previousCOAId: row?.original?.chartOfAccount?.id
                            })
                          }}
                          name="chartOfAccount"
                          options={parsedChartOfAccounts}
                          value={
                            resolvedMap?.[row?.original?.chartOfAccount?.id]
                              ? resolvedAccount || { value: null, label: 'No Account' }
                              : { value: '', label: 'Select Account' }
                          }
                          customComponents={{ SingleValue: singleValueComponents }}
                          formatOptionLabel={SyncCoaOption}
                        />
                      )}
                  </BaseTable.Body.Row.Cell>
                ))
              }

              return row.cells.map((cell) => (
                <BaseTable.Body.Row.Cell {...cell.getCellProps()}>
                  {/* {cell.render('Cell')} */}
                  {cell.column.id === 'code' && (
                    <div
                      style={{
                        color: row?.original?.chartOfAccount?.keysChangedAtSource?.includes('code')
                          ? '#3DC56B'
                          : '#2D2D2C',
                        fontSize: 14,
                        fontWeight: 400
                      }}
                    >
                      {row?.original?.chartOfAccount?.account_number}
                    </div>
                  )}
                  {cell.column.id === 'coa_type' && (
                    <div
                      style={{
                        color: row?.original?.chartOfAccount?.keysChangedAtSource?.includes('type')
                          ? '#3DC56B'
                          : '#2D2D2C',
                        fontSize: 14,
                        fontWeight: 400
                      }}
                    >
                      {capitalize(row?.original?.chartOfAccount?.classification?.value)}
                    </div>
                  )}
                  {cell.column.id === 'name' && (
                    <div
                      style={{
                        overflow: 'hidden',
                        maxWidth: 550
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: row?.original?.chartOfAccount?.keysChangedAtSource?.includes('name')
                            ? '#3DC56B'
                            : '#777675'
                        }}
                      >
                        {row.original?.chartOfAccount?.name}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: row?.original?.chartOfAccount?.keysChangedAtSource?.includes('description')
                            ? '#3DC56B'
                            : '#777675'
                        }}
                      >
                        {row.original?.chartOfAccount?.description}
                      </div>
                    </div>
                  )}
                </BaseTable.Body.Row.Cell>
              ))
            }}
            pagination
            columns={columns}
            data={
              modifiedCoaQueryApi?.isLoading || modifiedCoaQueryApi?.isFetching || modifiedCoaQueryApi?.isError
                ? []
                : parseSyncedAccounts?.data || []
            }
          />
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA
          onClick={handleOnClickCancel}
          loadingWithLabel={saveModifiedApi.isLoading}
          label="Cancel"
          disabled={saveModifiedApi.isLoading}
        />
        <BaseModal.Footer.PrimaryCTA
          disabled={isCtaDisabled()}
          loadingWithLabel={modifiedCoaQueryApi?.isFetching || saveModifiedApi?.isLoading}
          onClick={emptyTableContent?.primaryCTA?.onClick ? emptyTableContent?.primaryCTA?.onClick : handleOnClickCta}
          label={
            emptyTableContent?.primaryCTA?.label
              ? emptyTableContent?.primaryCTA?.label
              : `Update All (${
                  parseSyncedAccounts?.data?.length > 0 && !modifiedCoaQueryApi?.isFetching
                    ? parseSyncedAccounts?.data?.length
                    : '-'
                })`
          }
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default IntegrationSyncModal
