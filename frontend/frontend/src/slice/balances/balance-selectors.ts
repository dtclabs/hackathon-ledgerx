import { createSelector } from '@reduxjs/toolkit'
import { isEmpty } from 'lodash'

const selectBalancePerChainForOrgAPIResponse = (state: any) => state.balancePerChainForOrg
const selectWallets = (state:any) => state.wallets

export const selectWalletBalances = (state:any) => state.balanceForWalletsGroupedByChain

export const selectTotalBalanceForOrg = createSelector(selectBalancePerChainForOrgAPIResponse, (state:any): any =>  state?.balancePerChainForOrg.value)

export const selectTotalBalanceForOrgFilteredByChain = createSelector(selectBalancePerChainForOrgAPIResponse, (_,filterChains) => filterChains, (state: any, filterChains:any): any => {
  let totalBalance = 0

  if (!isEmpty(state?.balancePerChainForOrg)) {
      Object.keys(state.balancePerChainForOrg.groups).filter(chain => filterChains?.length > 0 ? filterChains?.includes(chain) : true).forEach(chain => {totalBalance += parseFloat(state.balancePerChainForOrg.groups[chain].value)})
  }

  return totalBalance
})

export const selectBalancePerChainForOrg = createSelector(selectBalancePerChainForOrgAPIResponse, (state:any): any => {
  const result = {}
  const balanceChainGroups = state?.balancePerChainForOrg.groups

  if (balanceChainGroups) {
    Object.keys(balanceChainGroups).forEach(chain => {
      result[chain] = parseFloat(balanceChainGroups[chain].value)
    })
  }

  return result
})

export const selectWalletsWithDescendingBalance = createSelector(selectWalletBalances, selectTotalBalanceForOrg, selectWallets, (state:any, totalBalance:any, walletState: any): any => {
  if (!isEmpty(state?.balanceForWalletsGroupedByChain) && totalBalance && walletState && walletState?.wallets.length > 0) {
    const walletBalanceData = []
    const walletBalances = state?.balanceForWalletsGroupedByChain

      walletState.wallets?.forEach(wallet => {
      const walletTotal = walletBalances && parseFloat(walletBalances?.groups[wallet.id]?.value)
      const chainBalancesForWallet = walletBalances && walletBalances?.groups[wallet.id]?.groups
      const perChainBalance = []
      if (chainBalancesForWallet) {
        Object.keys(chainBalancesForWallet).forEach(chain => perChainBalance.push({ blockchainId: chain, total: chainBalancesForWallet[chain]?.value}))
      }
      
      walletBalanceData.push({
          name: wallet.name,
          total: walletTotal || 0,
          distribution: totalBalance > 0 && walletTotal > 0 ? Math.round((walletTotal / totalBalance) * 100) : 0,
          address: wallet.address,
          type: wallet.sourceType,
          supportedBlockchains: wallet.supportedBlockchains,
          perChainBalance
      })
    })
      return walletBalanceData.sort((a, b) => b.total - a.total)
    }
    return []
})