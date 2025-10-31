/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-else-return */
import React, { useEffect, useMemo, useRef, useState, FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import Image from 'next/legacy/image'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ErrorIcon from '@/public/svg/icons/error-icon.svg'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { getRemoteChartOfAccounts } from '@/api-v2/axios-config'
import { Input } from '@/components-v2'
import { api } from '@/api-v2'
import { capitalize, debounce } from 'lodash'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '@/state'
import Button from '@/components-v2/atoms/Button'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'

const columns = [
  {
    Header: 'Code',
    accessor: 'account_number'
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Type',
    accessor: 'type'
  }
]

interface IImportAccountsModal {
  provider: any
  onClickPrimary: (coaIds: any, selectedRows: any) => void
  organizationId: string
  isLoading: boolean
}

const ImportAccountsModal: FC<IImportAccountsModal> = ({ provider, onClickPrimary, organizationId, isLoading }) => {
  const ref = useRef(null)
  const tableProvider = useTableHook({})
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const dispatch = useAppDispatch()

  const integrationName = useMemo(
    () => (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'),
    [accountingIntegration]
  )
  const [selectedRows, setSelectedRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>({})
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (provider.state.isOpen) {
      remoteChartOfAccountApi()
    } else if (!provider.state.isOpen) {
      setSearch('')
      setSelectedRows([])
      setError({})
    }
  }, [provider.state.isOpen])

  const remoteChartOfAccountApi = async () => {
    setLoading(true)
    const response = await getRemoteChartOfAccounts({
      organizationId,
      integration: accountingIntegration?.integrationName ?? IntegrationName.XERO
    })
    if (response.isError) {
      setData([])
      setError(response)
      dispatch(api.util.invalidateTags(['organization-integrations-list']))
    } else {
      setData(response?.data)
    }
    setLoading(false)
  }

  const parsedData = useMemo(() => {
    if (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS) {
      return data.sort((a, b) => a.name.localeCompare(b.name))
    }

    return data.sort((a, b) => a.account_number.localeCompare(b.account_number) || a.name.localeCompare(b.name))
  }, [data])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleOnClickCta = () => {
    const coaIds = selectedRows.map((row) => ({ mergeAccountid: row.id }))
    onClickPrimary(coaIds, selectedRows)
  }

  const handleOnClickTryAgain = () => remoteChartOfAccountApi()

  const handleOnClickCancel = () => provider.methods.setIsOpen(false)

  const handleToggleSelectAll = () => {
    if (selectedRows.length < data.length) {
      ref.current.toggleAllRowsSelected(true)
    } else {
      ref.current.toggleAllRowsSelected(false)
    }
  }

  useEffect(() => {
    if (error) {
      if (error?.message) {
        toast.error(
          error?.statusCode === 500 ? `Getting chart of accounts from ${integrationName} failed` : error?.message
        )
      }
    }
  }, [error])

  const emptyTableContent = useMemo(() => {
    if (Object.keys(error)?.length) {
      return {
        icon: ErrorIcon,
        title: 'Unable to load Chart of Accounts',
        description: `There was an error syncing your Chart of Accounts from ${integrationName}. Please ensure that your internet connection is stable and try again.`,
        cta: {
          label: 'Try Again',
          onClick: handleOnClickTryAgain
        }
      }
    } else if (data.length === 0) {
      return {
        title: `No existing ${integrationName} accounts`,
        description: `You do not have any Accounts on ${integrationName}. To learn more on how to add Accounts onto ${integrationName}, please read this`,
        primaryCTA: {
          label: 'Keep Existing Accounts',
          onClick: handleOnClickCancel
        },
        isEmpty: true
      }
    } else {
      return {
        title: 'No accounts found'
      }
    }
  }, [loading, error, data, accountingIntegration?.integrationName])

  return (
    <BaseModal provider={provider}>
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon
          icon={accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroLogoIcon}
        />
        <BaseModal.Header.Title>Importing from {integrationName}</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>
      <BaseModal.Body>
        <div className="pr-24">
          <Typography color="secondary" variant="body2">
            Chart of Accounts imported from {integrationName} will not be editable on ledgerx.com. To edit, please log
            into your {integrationName} account{' '}
            <a
              href={
                accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS
                  ? 'https://accounts.intuit.com/app/login'
                  : 'https://login.xero.com/identity/user/login'
              }
              target="_blank"
              rel="noreferrer"
              className="hover:pointer underline underline-offset-2 decoration-current"
            >
              here
            </a>
            .
          </Typography>
        </div>
        <div className="flex gap-2 items-center justify-between flex-1 mt-8">
          <div className="basis-1/3">
            <Input
              placeholder="Search by code, name..."
              id="txhash"
              onChange={handleSearch}
              isSearch
              value={search}
              classNames="h-[32px]"
            />
          </div>
          <div className="flex items-center gap-3">
            {!loading && data.length > 0 && (
              <Button
                variant="ghost"
                label={selectedRows.length === data.length ? 'Deselect all' : `Select all (${data?.length})`}
                height={24}
                onClick={handleToggleSelectAll}
              />
            )}
          </div>
        </div>
        <div className="w-full mt-4">
          <SimpleTable
            defaultPageSize={20}
            multiSelect
            provider={tableProvider}
            onRowSelected={(rows) => setSelectedRows(rows)}
            tableHeight="max-h-[calc(85vh-290px)]"
            keepSelectedRows
            noData={
              <div className="p-8 flex justify-center">
                <EmptyData loading={loading}>
                  <EmptyData.Icon icon={emptyTableContent?.icon} />
                  <EmptyData.Title>{emptyTableContent?.title}</EmptyData.Title>
                  <EmptyData.Subtitle>
                    {emptyTableContent?.description}{' '}
                    {emptyTableContent?.isEmpty ? (
                      <a
                        href={
                          accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS
                            ? 'https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-chart-accounts-quickbooks-online/L9Res1eb1_US_en_US'
                            : 'https://central.xero.com/s/article/Import-a-chart-of-accounts-GL'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="hover:pointer underline underline-offset-2 decoration-current"
                      >
                        guide
                      </a>
                    ) : null}
                  </EmptyData.Subtitle>
                  {emptyTableContent?.cta && (
                    <EmptyData.CTA label={emptyTableContent?.cta?.label} onClick={emptyTableContent?.cta?.onClick} />
                  )}
                </EmptyData>
              </div>
            }
            renderRow={(row) =>
              row.cells.map((cell) => (
                <BaseTable.Body.Row.Cell {...cell.getCellProps()}>
                  {cell.render('Cell')}
                  {cell.column.id === 'account_number' && !row.original.account_number && '-'}
                  {cell.column.id === 'name' && (
                    <div style={{ color: '#777675', overflow: 'hidden', maxWidth: 550 }}>
                      {row.original.description}
                    </div>
                  )}
                  {cell.column.id === 'type' && (
                    <div style={{ color: '#777675', overflow: 'hidden', maxWidth: 550 }}>
                      {capitalize(row.original.classification?.value)}
                    </div>
                  )}
                </BaseTable.Body.Row.Cell>
              ))
            }
            pagination
            columns={columns}
            data={loading ? [] : parsedData}
            clientSideSearch={search}
            ref={ref}
          />
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA onClick={handleOnClickCancel} label="Cancel" />
        <BaseModal.Footer.PrimaryCTA
          loadingWithLabel={loading || isLoading}
          disabled={data?.length === 0 || loading || isLoading || !selectedRows?.length}
          onClick={emptyTableContent?.primaryCTA?.onClick ? emptyTableContent?.primaryCTA?.onClick : handleOnClickCta}
          label={
            emptyTableContent?.primaryCTA?.label
              ? emptyTableContent?.primaryCTA?.label
              : selectedRows.length > 0
              ? `Confirm Import Selection (${selectedRows.length})`
              : 'Confirm Import Selection (-)'
          }
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default ImportAccountsModal
