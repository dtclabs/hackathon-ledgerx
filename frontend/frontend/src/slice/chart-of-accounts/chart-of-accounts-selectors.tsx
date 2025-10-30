/* eslint-disable prefer-arrow-callback */
/* eslint-disable guard-for-in */
import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'

const selectSelf = (state: any) => state

export const selectChartOfAccountMap = createSelector(selectSelf, (state: AppState) => {
  const chartOfAccounts = state.chartOfAccounts.accounts
  const accountsMap = {}
  chartOfAccounts.forEach((account) => {
    const dynamicMapKey = account.code
      ? `${account.code.toLowerCase()}-${account.name.toLowerCase()}`
      : `${account.name.toLowerCase()}`
    accountsMap[dynamicMapKey.replace(/\s/g, '')] = account
  })
  return accountsMap
})

export const selectAvailableAccounts = createSelector(selectSelf, (state: AppState) => {
  // Chart of accounts selections which are already mapped
  const MAPPED_CHART_OF_ACCOUNTS = {}
  const chartOfAccounts = state.chartOfAccounts.accounts
  const chartOfAccountsMappings = state.chartOfAccountsMappings.accountMappings

  if (chartOfAccountsMappings.length > 0) {
    chartOfAccountsMappings.forEach((accountMapping) => {
      const { chartOfAccount: account, ...rest } = accountMapping
      if (accountMapping?.chartOfAccount) {
        MAPPED_CHART_OF_ACCOUNTS[accountMapping?.chartOfAccount.id] = {
          account,
          mapping: { ...rest }
        }
      }
    })
  }

  const parsedAccounts = chartOfAccounts.map((account) => {
    const mappedAccount = MAPPED_CHART_OF_ACCOUNTS[account.id]
    if (mappedAccount) {
      return {
        ...account,
        label: account.code ? `${account.code} - ${account.name}` : account.name,
        value: account.id,
        disabled: true,
        relatedMapping: {
          id: mappedAccount?.mapping?.id,
          type: mappedAccount?.mapping?.type
        }
      }
    }
    return {
      ...account,
      label: account.code ? `${account.code} - ${account.name}` : account.name,
      value: account.id,
      disabled: false
    }
  })

  return parsedAccounts?.length ? [...parsedAccounts] : []
})

export const chartOfAccountsSelector = createSelector(selectSelf, (state: AppState) => {
  const chartOfAccounts = state.chartOfAccounts.accounts

  const parsedAccounts = chartOfAccounts.map((account) => ({
    ...account,
    label: account.code ? `${account.code} - ${account.name}` : account.name,
    value: account.id,
    disabled: false,
    type: account.type
  }))

  return parsedAccounts?.length ? [...parsedAccounts] : []
})

export const groupedChartOfAccounts = createSelector(selectSelf, (state: AppState) => {
  const chartOfAccounts = state.chartOfAccounts.accounts
  const groupedAccounts = {}
  chartOfAccounts?.forEach((item) => {
    if (!groupedAccounts[item.type.toUpperCase().trim()]) {
      groupedAccounts[item.type.toUpperCase().trim()] = [
        {
          value: item.id,
          label: item.code ? `${item.code} - ${item.name}` : item.name,
          code: item.code,
          name: item.name,
          type: item.type
        }
      ]
    } else {
      groupedAccounts[item.type.toUpperCase().trim()].push({
        value: item.id,
        label: item.code ? `${item.code} - ${item.name}` : item.name,
        code: item.code,
        name: item.name,
        type: item.type
      })
    }
  })

  const accountOptions = Object.entries(groupedAccounts)
    .map(([key, options]) => ({
      label: key,
      options
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return accountOptions?.length ? accountOptions : []
})

export const selectChartOfAccountsMap = createSelector(selectSelf, (state: AppState) => {
  const chartOfAccounts = state.chartOfAccounts.accounts
  const accountsMap = chartOfAccounts.reduce((acc: any, account: any) => {
    acc[account.id] = account
    return acc
  }, {})

  return accountsMap || {}
})
