/* eslint-disable guard-for-in */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-else-return */
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import { useGetChartOfAccountsMappingQuery } from '@/api-v2/chart-of-accounts-mapping'
import { useUpdateModifiedAccountsMutation } from '@/api-v2/merge-rootfi-api'
import { IntegrationName } from '@/api-v2/organization-integrations'
import SelectDropdown from '@/components-v2/Select/Select'
import Typography from '@/components-v2/atoms/Typography'
import { Badge } from '@/components-v2/molecules/Badge'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import SuccessIcon from '@/public/svg/Success.svg'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { useAppSelector } from '@/state'
import {
  resolvedMappingCustomStyles,
  singleValueComponents
} from '@/views/ChartOfAccounts/List/components/IntegrationSyncModal/FormatResolveMappingOptionLabel'
import { capitalize, forEach } from 'lodash'
import Image from 'next/legacy/image'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
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

const IntegrationSyncModal = ({ provider, organizationId, modifiedCoaQueryApi }) => {
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const chartOfAccounts = useAppSelector(chartOfAccountsSelector)

  const [resolvedMap, setResolvedMap] = useState({})

  const { data: chartOfAccountsMapping } = useGetChartOfAccountsMappingQuery(
    { organizationId },
    { skip: !organizationId }
  )

  const [triggerSaveModified, saveModifiedApi] = useUpdateModifiedAccountsMutation()

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
      integration: accountingIntegration?.integrationName ?? IntegrationName.XERO,
      body: data
    })
  }

  useEffect(() => {
    if (!provider.state.isOpen) {
      setResolvedMap({})
    }
  }, [provider.state.isOpen, organizationId])

  useEffect(() => {
    if (saveModifiedApi.isSuccess) {
      provider.methods.setIsOpen(false)
      toast.success('Successfully synced modified accounts')
    } else if (saveModifiedApi.isError) {
      toast.error('Sorry, an error while syncing modified accounts')
    }
  }, [saveModifiedApi])

  const handleOnClickCancel = () => {
    provider.methods.setIsOpen(false)
  }

  const emptyTableContent = useMemo(() => {
    const modified = modifiedCoaQueryApi?.modifiedCOA?.length
    const archived = modifiedCoaQueryApi?.archivedCOA?.length
    const deleted = modifiedCoaQueryApi?.deletedCOA?.length
    const restored = modifiedCoaQueryApi?.restoredCOA?.length
    const total = modified + archived + deleted + restored
    if (total === 0) {
      return {
        title: `You are fully synced with ${
          accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
        }!`,
        description: `No new updates detected from your ${
          accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
        } Chart of Accounts.`,
        icon: SuccessIcon
      }
    }
    return {}
  }, [modifiedCoaQueryApi])

  const parseSyncedAccounts = useMemo(() => {
    const data = []
    const itemsToResolve = []
    if (modifiedCoaQueryApi?.modifiedCOA?.length > 0) {
      modifiedCoaQueryApi?.modifiedCOA.forEach((account) => {
        data.push({
          type: 'modified',
          chartOfAccount: {
            ...account
          }
        })
      })
    }
    if (modifiedCoaQueryApi?.archivedCOA?.length > 0) {
      modifiedCoaQueryApi?.archivedCOA.forEach((account) => {
        if (account.count > 0 && !resolvedMap[account?.chartOfAccount?.id]) {
          itemsToResolve.push(account?.chartOfAccount?.id)
        }
        data.push({
          type: 'archived',
          ...account
        })
      })
    }

    if (modifiedCoaQueryApi?.deletedCOA?.length > 0) {
      modifiedCoaQueryApi?.deletedCOA.forEach((account) => {
        if (account.count > 0 && !resolvedMap[account?.chartOfAccount?.id]) {
          itemsToResolve.push(account?.chartOfAccount?.id)
        }
        data.push({
          type: 'deleted',
          ...account
        })
      })
    }

    if (modifiedCoaQueryApi?.restoredCOA?.length > 0) {
      modifiedCoaQueryApi?.restoredCOA.forEach((account) => {
        data.push({
          type: 'restored',
          ...account
        })
      })
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
    chartOfAccounts
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
  }, [parseSyncedAccounts, chartOfAccounts])

  const handleChangeResolve = (data) => {
    setResolvedMap((prev) => ({ ...prev, [data.previousCOAId]: data }))
  }

  const isCtaDisabled = () =>
    parseSyncedAccounts?.data?.length === 0 ||
    parseSyncedAccounts?.itemsToResolve?.length > 0 ||
    (parseSyncedAccounts?.data?.length === 0 && Object.keys(resolvedMap).length === 0) ||
    saveModifiedApi.isLoading

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
        <div className="pr-24 pl-11">
          <Typography color="secondary" variant="body2">
            There are <span style={{ fontWeight: 600 }}>{parseSyncedAccounts?.data?.length}</span> updates detected.
          </Typography>
        </div>

        <div className="w-full min-w-[850px] pt-12">
          <SimpleTable
            defaultPageSize={5}
            tableHeight="h-[450px]"
            autoResetPage={false}
            noData={
              <div className="p-8 flex justify-center">
                <EmptyData>
                  <EmptyData.Title>{emptyTableContent?.title}</EmptyData.Title>
                  <EmptyData.Subtitle>{emptyTableContent?.description}</EmptyData.Subtitle>
                </EmptyData>
              </div>
            }
            renderRow={(row) => {
              const coaMappingIds = chartOfAccountsMapping?.map((item) => item?.chartOfAccount?.id)
              const resolvedAccount = chartOfAccounts?.find(
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
                              ? resolvedAccount
                                ? chartOfAccounts?.find((account) => account.value === resolvedAccount.id)
                                : { value: null, label: 'No Account' }
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
            data={parseSyncedAccounts?.data || []}
          />
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA
          onClick={handleOnClickCancel}
          label="Cancel"
          loadingWithLabel={saveModifiedApi.isLoading}
          disabled={saveModifiedApi.isLoading}
        />
        <BaseModal.Footer.PrimaryCTA
          loadingWithLabel={saveModifiedApi.isLoading}
          disabled={isCtaDisabled()}
          onClick={handleOnClickCta}
          label={`Update All (${parseSyncedAccounts?.data?.length > 0 ? parseSyncedAccounts?.data?.length : '-'})`}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default IntegrationSyncModal
