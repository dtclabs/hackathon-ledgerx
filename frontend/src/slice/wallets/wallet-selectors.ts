/* eslint-disable no-param-reassign */
import { createSelector } from '@reduxjs/toolkit'
import { ISource } from './wallet-types'
// @ts-ignore
const selectSelf = (state: AppState) => state.wallets

interface IWalletBalanceStats {
  name: string
  total: number
  chainTotals: any
  distribution: number
  address: string
  type: string
  supportedBlockchains?: string[] // todo: feature flag for now and then remove it when multichain is final
}

interface ISelectWalletsBalance {
  wallets: IWalletBalanceStats[]
  totalBalance: number
}

const calculateChainBalance = (blockchains, networks) => {
  let walletTotal = 0
  const chainTotals = {}
  if (blockchains) {
    for (const [key, value] of Object.entries(blockchains)) {
      // @ts-ignore
      const totalBalance = value.reduce((acc, o) => acc + parseFloat(o.fiatAmount), 0)
      chainTotals[key] = totalBalance

      if (networks && networks.includes(key)) {
        walletTotal += totalBalance
      } else if (networks === null) {
        walletTotal += totalBalance
      }
    }
  }
  return {
    walletTotal,
    chainTotals
  }
}

export const selectWalletBalances = createSelector(selectSelf, (state): ISelectWalletsBalance => {
  let walletBalanceData: IWalletBalanceStats[] = []
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params: any = Object.fromEntries(urlSearchParams.entries())
  let filteredNetworks = null
  if (params.networks) {
    filteredNetworks = params.networks.split(',')
  }

  state.wallets.forEach((wallet) => {
    // Calculate balance for each wallet supported chain and provide total
    const walletBalance = calculateChainBalance(wallet?.balance?.blockchains, filteredNetworks)
    walletBalanceData.push({
      name: wallet.name,
      total: walletBalance.walletTotal,
      chainTotals: walletBalance.chainTotals,
      distribution: 0,
      address: wallet.address,
      type: wallet.sourceType,
      supportedBlockchains: wallet.supportedBlockchains // todo: feature flag
    })
  })
  // Sort wallets based on highest balance
  const totalBalance = walletBalanceData.reduce((sum, wallet) => sum + wallet.total, 0)

  walletBalanceData.forEach((wallet: IWalletBalanceStats) => {
    wallet.distribution = totalBalance > 0 ? Math.round((wallet.total / totalBalance) * 100) : null
  })

  walletBalanceData = walletBalanceData.sort((a, b) => b.total - a.total)
  return {
    wallets: walletBalanceData,
    totalBalance
  }
})

export const selectWalletByChainAndType = createSelector(
  [selectSelf, (_, walletType) => walletType, (_, __, chain) => chain],
  (wallets, walletType, chain) => {
    if (!chain) {
      return wallets?.wallets?.filter((wallet) => wallet.sourceType === walletType)
    }
    return wallets?.wallets?.filter(
      (wallet) => wallet.sourceType === walletType && wallet.supportedBlockchains.includes(chain)
    )
  }
)

export const selectWalletMapByChain = createSelector(selectSelf, (state): Record<string, ISource[]> => {
  const walletChainMap = {}

  if (state?.wallets.length > 0) {
    for (const wallet of state.wallets) {
      for (const chain of wallet.supportedBlockchains) {
        if (!walletChainMap[chain]) {
          walletChainMap[chain] = []
        }
        walletChainMap[chain].push(wallet)
      }
    }
  }

  return walletChainMap
})



export const selectWalletMapByAddress = createSelector(selectSelf, (state): Record<string, ISource> => {
  const walletMap = state.wallets.reduce((acc, wallet) => {
    acc[wallet?.address.toLowerCase()] = wallet

    return acc
  }, {} as Record<string, ISource>)

  return walletMap
})

export const selectWalletMapById = createSelector(selectSelf, (state): Record<string, ISource> => {
  const walletMap = state.wallets.reduce((acc, wallet) => {
    acc[wallet?.id] = wallet

    return acc
  }, {} as Record<string, ISource>)

  return walletMap
})

export const walletsSelector = createSelector(selectSelf, (state) => state.wallets)
