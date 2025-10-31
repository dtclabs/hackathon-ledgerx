import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useGetBalanceForWalletsGroupedByChainQuery } from '@/api-v2/balances-api'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { ISource, SourceType } from '@/slice/wallets/wallet-types'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import FormatOptionLabel, { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { formatNumber } from '@/utils/formatNumber'

export const useSelectAvailableSource = () => {
  const { account } = useWeb3React()
  const organizationId = useOrganizationId()
  const selectedChain = useAppSelector(selectedChainSelector)
  const isMultiChainSafeEnabled = useAppSelector((state) => selectFeatureState(state, 'isMultiChainSafeEnabled'))
  const { data: walletBalances, isLoading: isWalletBalanceLoading } = useGetBalanceForWalletsGroupedByChainQuery(
    { orgId: organizationId, params: { groupBy: 'walletId', secondGroupBy: 'blockchainId' } },
    { skip: !organizationId }
  )
  const { data: wallets, isLoading: isWalletsLoading } = useGetWalletsQuery(
    { orgId: organizationId, params: { size: 9999 } },
    { skip: !organizationId }
  )

  const parsedSources = useMemo(() => {
    // TODO - Add Error Handling Sentry
    const sourceWalletData: ISource[] = []

    wallets?.items?.forEach((item) => {
      const isSelectedChainSupported = item?.supportedBlockchains.includes(selectedChain?.id)
      let isConnectedAccountOwner = null
      let chainBalance = null
      let isDisabled = null
      // Handle Safe Logic
      if (item.sourceType === SourceType.GNOSIS) {
        // TODO - REmove feature flag when can
        // Handling Multichain Safe
        if (isMultiChainSafeEnabled) {
          const currentChainOwners = item?.metadata?.find((chain) => chain.blockchainId === selectedChain?.id) ?? {
            ownerAddresses: []
          }

          const safeOwnerAddresses = currentChainOwners?.ownerAddresses
          isConnectedAccountOwner = safeOwnerAddresses.some(
            (owner) => owner.address.toLowerCase() === account?.toLowerCase()
          )
        } else {
          const safeOwnerAddresses = item?.metadata?.ownerAddresses
          isConnectedAccountOwner = safeOwnerAddresses?.some(
            (owner) => owner.address.toLowerCase() === account?.toLowerCase()
          )
        }
      } else {
        isConnectedAccountOwner = item.address.toLowerCase() === account?.toLowerCase()
      }
      isDisabled = !isSelectedChainSupported || !isConnectedAccountOwner
      chainBalance = walletBalances?.groups?.[item?.id]?.groups?.[selectedChain?.id]?.value ?? 0
      sourceWalletData.push({
        ...item,
        isConnectedAccountOwner,
        isSelectedChainSupported,
        chainBalance,
        isDisabled
      })
    })

    return sourceWalletData
  }, [wallets, selectedChain, account, walletBalances])

  const options: IFormatOptionLabel[] = useMemo(() => {
    const list: IFormatOptionLabel[] = []
    if (parsedSources?.length > 0) {
      parsedSources?.forEach((item) => {
        list.push({
          value: item.address,
          label: item.name,
          address: item.address,
          totalPrice: formatNumber(item.chainBalance, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }),
          typeAddress: item.sourceType,
          sourceId: item.id,
          type: item.sourceType,
          supportedBlockchains: item?.supportedBlockchains,
          ...item
        })
      })
    }
    return list
  }, [parsedSources, selectedChain?.id])

  return {
    sources: parsedSources,
    isLoading: isWalletsLoading || isWalletBalanceLoading,
    sourcesTotalBasedOnChain: options
  }
}
