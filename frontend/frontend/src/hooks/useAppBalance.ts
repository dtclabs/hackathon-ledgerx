import { useAppSelector } from '@/state'
import { getTokenImageBySymbol } from '@/utils/getTokenImageBySymbol'
import { useEffect, useState } from 'react'
import { WHITELIST_ENV } from '@/pages/[organizationId]/wallets'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useGetOrganisationCryptocurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetChainsQuery } from '@/api-v2/chain-api'

export interface IAsset {
  balance: string
  usdBalance: number
  decimals: number
  logoUrl: string
}

export const useAppBalance = ({ sourceOfFund }) => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const organisationId = useOrganizationId()
  const chains = useGetChainsQuery({})
  const { data } = useGetOrganisationCryptocurrenciesQuery(
    {
      organisationId,
      params: {
        walletIds: sourceOfFund?.items.map((item) => item.id),
        blockchainIds: chains?.data?.data?.map((item) => item.id)
      }
    },
    { skip: !chains?.data?.data || !organisationId || !sourceOfFund?.items?.length }
  )
  const tokens = data?.data
  const [totalSourcesUsdBalance, setTotalSourceUsdBalance] = useState(0) // TODO: Need to change names for variables as they are restricted to USD for now
  const [loadingAsset, setLoadingAsset] = useState(false)
  const [sourcesBalance, setSourcesBalance] = useState<{ id: string; totalUsd: number; fiatCurrency: string }[]>([])
  const [assets, setAssets] = useState<{
    [name: string]: IAsset
  }>()

  /**
   * TODO:
   *  - Discussion with BE about adding the currency symbol in the response
   *  - Possibility of extracting the fiatCurrency and fiatCurrencySymbol outside the balance object so for the cases where the balance
   *    is zero we can still add the data from API response instead of getting it from global redux state
   */

  useEffect(() => {
    if (sourceOfFund && sourceOfFund.items.length > 0 && selectedChain && tokens?.length > 0) {
      setLoadingAsset(true)
      let assetList: {
        [name: string]: IAsset
      } = {}
      const totalSource: { id: string; totalUsd: number; fiatCurrency: string }[] = [] // TODO: Change variable name from totalUsd to finalSum
      const { length } = tokens
      const { length: sourceLength } = sourceOfFund.items

      for (let i = 0; i < sourceLength; i++) {
        const source = sourceOfFund.items[i]
        if (
          source.balance &&
          ((WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT) && source.balance?.blockchains) ||
            source.balance[selectedChain.chainId])
        ) {
          let balanceList = []
          if (source && source.balance && source.balance.blockchains) {
            for (const [key, balance] of Object.entries(source.balance.blockchains)) {
              balanceList = [...balanceList, ...(balance as any)]
            }
          }
          const sum = WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
            ? balanceList.reduce((a, b) => a + +b.fiatAmount, 0)
            : source.balance[selectedChain.chainId].reduce((a, b) => a + +b.usd, 0)

          totalSource.push({
            id: source.id,
            totalUsd: sum,
            fiatCurrency: balanceList[0]?.fiatCurrency
          })
        } else totalSource.push({ id: source.id, totalUsd: 0, fiatCurrency: 'USD' })
      }

      for (let i = 0; i < length; i++) {
        const tokenItem = tokens[i]
        const { symbol } = tokenItem
        const logoUrl = getTokenImageBySymbol(symbol)
        const token = sourceOfFund.items.reduce(
          (acc, cur) => {
            if (cur.balance) {
              const balance = WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
                ? cur.balance?.blockchains[selectedChain?.id]
                : cur.balance[selectedChain.chainId]
              const tokenBalance =
                balance &&
                (WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
                  ? balance.find((item) => item.cryptocurrency.symbol.toLowerCase() === symbol.toLowerCase())
                  : balance.find((item) => item.name === symbol))
              if (tokenBalance) {
                const decimal = WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
                  ? tokenBalance.cryptocurrency?.address?.[0]?.decimal || tokenItem.decimal
                  : tokenBalance.decimals
                const fiatAmount = WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
                  ? tokenBalance.fiatAmount
                  : tokenBalance.fiatAmount

                return {
                  ...acc,
                  balance: String(
                    +acc.balance + +WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
                      ? tokenBalance.cryptocurrencyAmount
                      : tokenBalance.balance
                  ),
                  usdBalance: acc.usdBalance + +fiatAmount
                }
              }
              return acc
            }

            return acc
          },
          {
            balance: '0',
            usdBalance: 0,
            decimals: tokenItem.decimal,
            logoUrl
          }
        )
        if (token.balance !== '0') assetList = { ...assetList, [symbol]: token }
      }

      const total = totalSource.reduce((a, b) => +a + +b.totalUsd, 0)
      setTotalSourceUsdBalance(total)
      setSourcesBalance(totalSource)
      setAssets(assetList)
      setLoadingAsset(false)
    }
  }, [sourceOfFund, selectedChain, tokens])

  return { assets, sourcesBalance, loadingAsset, totalSourcesUsdBalance }
}
