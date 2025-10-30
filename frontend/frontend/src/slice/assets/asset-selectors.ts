/* eslint-disable prefer-arrow-callback */
/* eslint-disable guard-for-in */
import { createSelector } from '@reduxjs/toolkit'

const selectSelf = (state: any) => state.assets

export const selectTopFiveAssets = createSelector(selectSelf, (state) => {
        const ASSET_MAP = {}
        const urlSearchParams = new URLSearchParams(window.location.search)
        const params: any = Object.fromEntries(urlSearchParams.entries())
        let filteredNetworks = null
        if (params.networks) {
            filteredNetworks = params.networks.split(',')
        }
    
        state?.assets?.forEach((asset) => {
            if (ASSET_MAP[asset?.cryptocurrency?.symbol]) {
                ASSET_MAP[asset?.cryptocurrency?.symbol].networks.push(asset)
                if (filteredNetworks && filteredNetworks.includes(asset.blockchainId)) {
                    ASSET_MAP[asset?.cryptocurrency?.symbol].totalFiatAmount += parseFloat(asset.totalCurrentFiatValue)
                    ASSET_MAP[asset?.cryptocurrency?.symbol].totalTokenAmount += parseFloat(asset.totalUnits)
                    ASSET_MAP[asset?.cryptocurrency?.symbol].totalCostBasis += parseFloat(asset.totalCostBasis)
                    ASSET_MAP[asset?.cryptocurrency?.symbol].image = asset?.cryptocurrency?.image
                    ASSET_MAP[asset?.cryptocurrency?.symbol].gainLoss += parseFloat(asset.totalCurrentFiatValue) - parseFloat(asset.totalCostBasis)
                } else if (filteredNetworks === null) {
                    ASSET_MAP[asset?.cryptocurrency?.symbol].totalFiatAmount += parseFloat(asset.totalCurrentFiatValue)
                    ASSET_MAP[asset?.cryptocurrency?.symbol].totalTokenAmount += parseFloat(asset.totalUnits)
                    ASSET_MAP[asset?.cryptocurrency?.symbol].totalCostBasis += parseFloat(asset.totalCostBasis)
                    ASSET_MAP[asset?.cryptocurrency?.symbol].image = asset?.cryptocurrency?.image
                    ASSET_MAP[asset?.cryptocurrency?.symbol].gainLoss += parseFloat(asset.totalCurrentFiatValue) - parseFloat(asset.totalCostBasis)
                }
    
            } else {
                ASSET_MAP[asset?.cryptocurrency?.symbol] = {
                    networks: [asset],
                    totalFiatAmount: parseFloat(asset.totalCurrentFiatValue),
                    totalTokenAmount: parseFloat(asset.totalUnits),
                    totalCostBasis: parseFloat(asset.totalCostBasis),
                    image: asset?.cryptocurrency?.image,
                    gainLoss: parseFloat(asset.totalCurrentFiatValue) - parseFloat(asset.totalCostBasis)
                }
            }
        })

        const sortedCurrencies = Object.entries(ASSET_MAP)
            .map(([currency, data]: any) => ({
                currency,
                totalFiatAmount: data.totalFiatAmount,
                totalTokenAmount: data.totalTokenAmount,
                networks: data.networks,
                totalCostBasis: data.totalCostBasis,
                image: data.image,
                gainLoss: data.gainLoss,
                // Temp Solution
                supportedChains: data?.networks?.map(network => (network?.blockchainId))
            }))
            .sort((a, b) => b.totalFiatAmount - a.totalFiatAmount)
            .splice(0, 5)
    
        return sortedCurrencies
    })

    // TODO: Extract asset selection from this and make the top 5 selection a separate one
export const selectTopFiveAssetsV2 = createSelector(selectSelf,
(_,filterChains) => filterChains, (state: any, filterChains:any): any => {
    const ASSET_MAP = {}
    const ASSET_CHAIN_MAP = {}

    state?.assets?.forEach((asset) => {
        if (ASSET_MAP[asset?.cryptocurrency?.symbol]) {
            if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || filterChains.length === 0) {
              ASSET_MAP[asset?.cryptocurrency?.symbol].networks.push(asset)
            ASSET_MAP[asset?.cryptocurrency?.symbol].totalFiatAmount += parseFloat(asset.totalCurrentFiatValue)
            ASSET_MAP[asset?.cryptocurrency?.symbol].totalTokenAmount += parseFloat(asset.totalUnits)
            ASSET_MAP[asset?.cryptocurrency?.symbol].totalCostBasis += parseFloat(asset.totalCostBasis)
            ASSET_MAP[asset?.cryptocurrency?.symbol].image = asset?.cryptocurrency?.image
            ASSET_MAP[asset?.cryptocurrency?.symbol].gainLoss += parseFloat(asset.totalCurrentFiatValue) - parseFloat(asset.totalCostBasis)
            }
          } else {
            if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || filterChains.length === 0) {
                ASSET_MAP[asset?.cryptocurrency?.symbol] = {
                    networks: [asset],
                    totalFiatAmount: parseFloat(asset.totalCurrentFiatValue),
                    totalTokenAmount: parseFloat(asset.totalUnits),
                    totalCostBasis: parseFloat(asset.totalCostBasis),
                    image: asset?.cryptocurrency?.image,
                    gainLoss: parseFloat(asset.totalCurrentFiatValue) - parseFloat(asset.totalCostBasis)
                }
            }
          }
    })

    state?.assets.forEach((asset) => {
        if (ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol]) {
          if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || filterChains.length === 0) {
            ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [
              ...ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol],
              { id: asset?.blockchainId, isGrayedOut: false }
            ]
          } else {
            ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [
              ...ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol],
              { id: asset?.blockchainId, isGrayedOut: true }
            ]
          }
        } else {
          if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || filterChains.length === 0) {
            ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [{ id: asset?.blockchainId, isGrayedOut: false }]
          } else {
            ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [{ id: asset?.blockchainId, isGrayedOut: true }]
          }
        }
      })
    
    const sortedCurrencies = Object.entries(ASSET_MAP)
        .map(([currency, data]: any) => ({
            currency,
            totalFiatAmount: data.totalFiatAmount,
            totalTokenAmount: data.totalTokenAmount,
            networks: data.networks,
            totalCostBasis: data.totalCostBasis,
            image: data.image,
            gainLoss: data.gainLoss,
            supportedChains: ASSET_CHAIN_MAP[currency]
        }))
        .sort((a, b) => b.totalFiatAmount - a.totalFiatAmount)
        .splice(0, 5)

    return sortedCurrencies
})

export const selectAssetSettings = createSelector(selectSelf, (state): any => state.settings)