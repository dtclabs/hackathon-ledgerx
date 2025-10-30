import { createSelector } from '@reduxjs/toolkit'
import { BUILDBEAR_RPC_MAP } from '@/constants-v2/buildbear-rpc'

const selectSelf = (state: any) => state.supportedChains

export const selectChainIcons = createSelector(selectSelf, (items) => {
  const result = {}
  items?.supportedChains.forEach((chain) => {
    result[chain.id] = chain.imageUrl
  })
  return result
})

export const selectNetworkRPCMap = createSelector(selectSelf, (items) => {
  const result = {}

  const isBuildBear = window.localStorage.getItem('isBuildBearTesting')
  items?.supportedChains?.forEach((blockchain) => {
    // Use Build Bear RPC if enabled and available; otherwise, fall back to the blockchain's rpcUrl
    const rpcUrl =
      isBuildBear === 'true' && BUILDBEAR_RPC_MAP[blockchain.id] ? BUILDBEAR_RPC_MAP[blockchain.id] : blockchain.rpcUrl
    result[blockchain.id] = [rpcUrl]
  })
  return result
})

export const selectChainByNameMap = createSelector(selectSelf, (items) => {
  const result = {}

  items?.supportedChains?.forEach((blockchain) => {
    result[blockchain.id] = blockchain
  })
  return result
})


export const selectChainByIdMap = createSelector(selectSelf, (items) => {
  const result = {}

  items?.supportedChains?.forEach((blockchain) => {
    result[blockchain.chainId] = blockchain
  })
  return result
})


export const selectSafeUrlMap = createSelector(selectSelf, (items) => {
  const result = {}
  items?.supportedChains?.forEach((blockchain) => {
    result[blockchain.id] = [blockchain.safeUrl]
  })
  return result
})


export const selectChainByName = createSelector(
  [selectSelf, (_, blockchainName) => blockchainName],
  (blockchains, blockchainName) => blockchains?.supportedChains?.find((chain) => chain?.id === blockchainName)
)


export const selectChainIconByName = createSelector(
  [selectSelf, (_, blockchainName) => blockchainName],
  (blockchains, blockchainName) => {
    const imageUrl = blockchains?.supportedChains?.find((chain) => chain?.id === blockchainName)?.imageUrl
    return imageUrl
  }
)
