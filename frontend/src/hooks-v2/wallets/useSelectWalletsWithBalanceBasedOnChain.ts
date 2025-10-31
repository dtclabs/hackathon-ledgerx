import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useMemo } from 'react'
import { ISource } from '@/slice/wallets/wallet-types'
import { isEmpty } from 'lodash'
import { useGetBalanceForWalletsGroupedByChainQuery } from '@/api-v2/balances-api'
import { selectWalletBalances } from '@/slice/balances/balance-selectors'

import { selectWalletMapByChain } from '@/slice/wallets/wallet-selectors'

export const useSelectWalletsWithBalanceBasedOnChain = (_chain: string) => {
  const organizationId = useOrganizationId()
  useGetBalanceForWalletsGroupedByChainQuery(
    { orgId: organizationId, params: { groupBy: 'walletId', secondGroupBy: 'blockchainId' } },
    { skip: !organizationId }
  )

  const walletChainMap = useAppSelector(selectWalletMapByChain)
  const { balanceForWalletsGroupedByChain: walletBalances } = useAppSelector(selectWalletBalances)

  const wallets: ISource[] = useMemo(() => {
    const parsedWallets = []
    if (walletBalances?.groups && !isEmpty(walletChainMap) && walletChainMap[_chain]) {
      const walletsBasedOnChain = walletChainMap[_chain]

      for (const wallet of walletsBasedOnChain) {
        const walletBalance = walletBalances?.groups[wallet?.id]?.groups[_chain]?.value ?? '0.00'

        const parsedWallet = {
          ...wallet,
          isAvailable: true,
          totalPiceSource: walletBalance
        }
        parsedWallets.push(parsedWallet)
      }
    }
    return parsedWallets
  }, [walletBalances, _chain, walletChainMap])

  return { availableSources: wallets, loadingSource: false }
}
