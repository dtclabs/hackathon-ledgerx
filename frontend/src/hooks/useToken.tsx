import { useGetChainsQuery } from '@/api-v2/chain-api'
import { useGetCryptoCurrenciesQuery, useGetOrganisationCryptocurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { TOKEN_IMG } from '@/views/ReceivePayment/ReceivePayment'
import { useMemo } from 'react'

export const useToken = (chainId = 'ethereum', walletIds = []) => {
  const organisationId = useOrganizationId()
  const { data: tokensData } = useGetCryptoCurrenciesQuery({})

  const { data: orgCrypto } = useGetOrganisationCryptocurrenciesQuery(
    {
      organisationId,
      params: {
        blockchainIds: [chainId],
        walletIds
      }
    },
    { skip: !walletIds.length || !organisationId }
  )
  const { data: networks } = useGetChainsQuery({})

  const allOrgSupportToken2 = useMemo(() => {
    const orgTokensByChain = {}
    const orgToken = orgCrypto?.data ?? []
    for (const token of orgToken) {
      for (const supportedChain of token.addresses) {
        orgTokensByChain[supportedChain.blockchainId]?.push(token)
      }
    }
    return orgTokensByChain
  }, [orgCrypto])

  const networkData = () => {
    const tokensByChain: any = {}
    const orgTokensByChain = {}
    const supportedNetworks = networks?.data?.map((network) => {
      tokensByChain[network.id] = []
      orgTokensByChain[network.id] = []
      return { value: network.id, label: network.name, id: network.id }
    })

    const tokensToCheck = tokensData?.data ?? []
    for (const token of tokensToCheck) {
      for (const supportedChain of token.addresses) {
        tokensByChain[supportedChain.blockchainId]?.push(token)
      }
    }

    const orgToken = orgCrypto?.data ?? []
    for (const token of orgToken) {
      for (const supportedChain of token.addresses) {
        orgTokensByChain[supportedChain.blockchainId]?.push(token)
      }
    }

    return {
      networks: supportedNetworks,
      tokens: tokensByChain,
      orgTokens: orgTokensByChain
    }
  }

  const suportedTokenData = useMemo(() => networkData(), [tokensData, networks, orgCrypto])

  // selected chain
  const suportedToken = useMemo(
    () =>
      suportedTokenData?.tokens[chainId]?.map((item) => {
        const tokenAddress = item.addresses.find((chain) => chain.blockchainId === chainId)
        return {
          id: item.publicId,
          value: item.publicId,
          name: item.symbol,
          symbol: item.symbol,
          tokenAddress: tokenAddress?.address || '',
          decimal: tokenAddress?.decimal,
          logoUrl: TOKEN_IMG.find((token) => token.symbol === item.symbol)?.img,
          image: item.image
        }
      }),
    [chainId, suportedTokenData.tokens]
  )

  const orgSuportedToken = useMemo(
    () =>
      orgCrypto?.data?.map((item) => {
        const tokenAddress = item.addresses.find((chain) => chain.blockchainId === chainId)
        return {
          id: item.publicId,
          value: item.publicId,
          name: item.symbol,
          symbol: item.symbol,
          tokenAddress: tokenAddress?.address || '',
          decimal: tokenAddress?.decimal,
          logoUrl: TOKEN_IMG.find((token) => token.symbol === item.symbol)?.img,
          image: item.image,
          isVerified: item.isVerified
        }
      }),
    [chainId, orgCrypto]
  )

  const allOrgSupportToken = useMemo(() => suportedTokenData.orgTokens, [suportedTokenData.orgTokens, orgCrypto])

  // all chain
  const allSupportedToken = useMemo(() => suportedTokenData?.tokens, [suportedTokenData.tokens])

  const verifiedToken = useMemo(() => {
    const verifiedTokenList = {}
    for (const key of Object.keys(suportedTokenData.tokens)) {
      verifiedTokenList[key] = []
    }
    for (const [key, value] of Object.entries(suportedTokenData.tokens)) {
      for (const token of value as any[]) {
        if (token.isVerified) {
          verifiedTokenList[key].push(token)
        }
      }
    }
    return verifiedTokenList
  }, [suportedTokenData.tokens, orgCrypto])

  const supportedChain = useMemo(() => suportedTokenData?.networks, [suportedTokenData.networks])

  return {
    suportedToken,
    allSupportedToken,
    supportedChain,
    orgSuportedToken,
    allOrgSupportToken,
    verifiedToken,
    allOrgSupportToken2
  }
}
