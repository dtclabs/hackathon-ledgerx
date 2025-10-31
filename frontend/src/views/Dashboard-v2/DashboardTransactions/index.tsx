/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable react/no-array-index-key */
import { FC, useMemo, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '@/components-v2/atoms/Button'
import TimeIcon from '@/public/svg/icons/blue-icon-time.svg'
import Typography from '@/components-v2/atoms/Typography'
import { useRouter } from 'next/router'
import TransactionsLoading from './TransactionsLoading'
import TransactionRows from './TransactionRows'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useUpdateFinancialTransactionMutation } from '@/api-v2/financial-tx-api'
import DashboardCard from '../components/DashboardCard'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'

interface IPropsTransactions {
  transactions: any
  wallets: any
  loading?: boolean
}

const DashboardTransactions: FC<IPropsTransactions> = ({ transactions, wallets, loading = true }) => {
  const router = useRouter()
  const orgId = useOrganizationId()
  const importedChartOfAccounts = useAppSelector(chartOfAccountsSelector)
  const [fakeLoader, setFakeLoader] = useState(transactions?.length > 0 ? false : true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLoader(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  const handleOnClickImport = () => router.push(`/${orgId}/wallets/import`)
  const { timezone, country, fiatCurrency } = useAppSelector(orgSettingsSelector)
  const { data: availableAccounts } = useGetChartOfAccountsQuery(
    { organizationId: orgId, params: { status: ['ACTIVE'] } },
    { skip: !orgId, refetchOnMountOrArgChange: true }
  )

  const [updateFinnacialTx, updateFinnacialTxResult] = useUpdateFinancialTransactionMutation()
  const handleRedirectTransactionsPage = () => router.push(`/${orgId}/transactions`)

  useEffect(() => {
    if (updateFinnacialTxResult.isError) {
      toast.error('Category update failed')
    }
  }, [updateFinnacialTxResult.isError])

  const parseAvailableAccounts = useMemo(() => {
    const groupedAccounts = {}
    importedChartOfAccounts?.forEach((item) => {
      if (!groupedAccounts[item.type.toUpperCase().trim()]) {
        groupedAccounts[item.type.toUpperCase().trim()] = [
          {
            value: item.id,
            label: item.label,
            // disabled: !item.isSelectable,
            code: item.code,
            name: item.name
          }
        ]
      } else {
        groupedAccounts[item.type.toUpperCase().trim()].push({
          value: item.id,
          label: item.label,
          // disabled: !item.isSelectable,
          code: item.code,
          name: item.name
        })
      }
    })

    const accountOptions = Object.entries(groupedAccounts)
      .map(([key, options]) => ({
        label: key,
        options
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return accountOptions
  }, [importedChartOfAccounts])

  const handleOnChangeCategory = (_category, tx) => {
    toast.success('Chart of account updated')
    updateFinnacialTx({
      orgId,
      id: tx.id,
      payload: {
        correspondingChartOfAccountId: _category.value
      },
      optimisticAccount: {
        id: _category?.value || _category?.id,
        code: _category?.code ?? '',
        name: _category?.name ?? ''
      }
    })
  }
  return (
    <DashboardCard>
      <div className="flex flex-row justify-between">
        <Typography variant="heading3" classNames="sm:!text-base">
          Recent Transactions
        </Typography>
        {wallets?.length > 0 && transactions?.length > 0 ? (
          <Button
            onClick={handleRedirectTransactionsPage}
            height={40}
            variant="transparent"
            className="border-none text-sm text-[#2E2E2E]"
            label="View All"
          />
        ) : null}
      </div>
      {fakeLoader || loading ? (
        <TransactionsLoading />
      ) : wallets.length > 0 ? (
        transactions.length > 0 ? (
          transactions
            .slice(0, 5)
            .map((transaction, index) => (
              <TransactionRows
                accounts={parseAvailableAccounts}
                key={index}
                locale={{ timezone, country, fiatCurrency }}
                transaction={transaction}
                onChangeCategory={handleOnChangeCategory}
                importedChartOfAccounts={importedChartOfAccounts}
              />
            ))
        ) : (
          <div className="flex justify-center h-full">
            <EmptyData>
              <EmptyData.Icon icon={TimeIcon} />
              <EmptyData.Title>No transactions found</EmptyData.Title>
            </EmptyData>
          </div>
        )
      ) : (
        <div className="flex h-full justify-center">
          <EmptyData>
            <EmptyData.Icon icon={TimeIcon} />
            <EmptyData.Title>Import a wallet to view transactions</EmptyData.Title>
            <EmptyData.CTA label="Import Wallet" onClick={handleOnClickImport} />
          </EmptyData>
        </div>
      )}
    </DashboardCard>
  )
}

export default DashboardTransactions
