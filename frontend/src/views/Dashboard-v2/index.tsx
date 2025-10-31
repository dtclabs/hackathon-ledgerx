import { AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import QuickActions from './components/QuickActions'
import DashboardBalance from './DashboardBalance'
import DashboardAssets from './DashboardAssets'
import DashboardTransactions from './DashboardTransactions'
import DashboardWallets from './DashboardWallets'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { useGetFinancialTransactionsQuery } from '@/api-v2/financial-tx-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useAppSelector } from '@/state'
import { useGetAssetsQuery } from '@/api-v2/assets-api'
import { selectWalletBalances } from '@/slice/wallets/wallet-selectors'
import { selectTopFiveAssets, selectTopFiveAssetsV2 } from '@/slice/assets/asset-selectors'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useEffect, useRef, useState } from 'react'
import MultiSelectCheckboxTab from '@/components-v2/atoms/MultiSelectCheckboxTab'
import allChainsSvg from '@/public/svg/sample-token/All-tokens.svg'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import {
  selectBalancePerChainForOrg,
  selectTotalBalanceForOrg,
  selectTotalBalanceForOrgFilteredByChain,
  selectWalletsWithDescendingBalance
} from '@/slice/balances/balance-selectors'
import { useGetBalanceForWalletsGroupedByChainQuery, useGetBalancePerChainForOrgQuery } from '@/api-v2/balances-api'
import { useRouter } from 'next/router'
import { useGetChartOfAccountsMappingQuery } from '@/api-v2/chart-of-accounts-mapping'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import SAMPLE_BALANCE_DATA from '@/constants/dashboardBalanceSampleData'
// import SAMPLE_WALLETS_PROPS, { SAMPLE_SUPPORTED_CHAINS } from '@/constants/dashboardWalletsSampleData'
import SAMPLE_TRANSACTIONS_PROPS from '@/constants/dashboardTransactionsSampleData'
import SAMPLE_METRICS_DATA from '@/constants/dashboardMetricsSampleData'
import SAMPLE_CHARTS_DATA from '@/constants/dashboardChartsSampleData'
import MetricsCard from './components/MetricsCard'
import WalletOverview from './components/WalletOverview'
import PortfolioAnalysis from './components/PortfolioAnalysis'
import MonthlyTransaction from './components/MonthlyTransaction'
import PriceChart from './components/PriceChart'
import TokenValue from './components/TokenValue'
import { useGetLatestSolPriceQuery } from '@/api-v2/market-price-api'
import { SAMPLE_TOKEN_DATA } from '@/constants/dashboardTokenSampleData'

const DashboardV2 = () => {
  const orgId = useOrganizationId()
  const router = useRouter()
  const supportedChains = useAppSelector(supportedChainsSelector)
  // Build sample-based chains from token data for demo mode
  const supportedChainsFromSample = Array.from(
    new Map(
      SAMPLE_TOKEN_DATA.map((t) => [
        (t.tokenSymbol || '').toLowerCase(),
        { id: (t.tokenSymbol || '').toLowerCase(), name: t.tokenSymbol, imageUrl: t.tokenIcon }
      ])
    ).values()
  )
  // const supportedChainsDisplay = isFeatureEnabledForThisEnv ? supportedChainsFromSample : supportedChains
  const [filterChains, setFilterChains] = useState<string[]>([])
  const { refetch: balancePerChainForOrgRefetch } = useGetBalancePerChainForOrgQuery(
    { orgId, params: { groupBy: 'blockchainId' } },
    { skip: !orgId }
  )
  const { refetch: balanceForWalletsRefetch } = useGetBalanceForWalletsGroupedByChainQuery(
    { orgId, params: { groupBy: 'walletId', secondGroupBy: 'blockchainId' } },
    { skip: !orgId }
  )
  useGetWalletsQuery({ orgId }, { skip: !orgId })
  const { isLoading: isAssetsLoading, refetch: assetsRefetch } = useGetAssetsQuery({ orgId }, { skip: !orgId })
  const {
    data: walletData,
    isLoading: isWalletsLoading,
    refetch: walletRefetch
  } = useGetWalletsQuery({ orgId, params: { size: 999 } }, { skip: !orgId })

  const { data: txData, isLoading: isTxLoading } = useGetFinancialTransactionsQuery(
    { orgId, params: { blockchainIds: isFeatureEnabledForThisEnv && filterChains.length > 0 ? filterChains : [] } },
    { skip: !orgId }
  )
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { startWalletSync } = useWalletSync({
    organisationId: orgId
  })

  const { data: chartOfAccountsMapping } = useGetChartOfAccountsMappingQuery(
    { organizationId: orgId },
    { skip: !orgId }
  )

  const [areAllChainsSelected, setAreAllChainsSelected] = useState<boolean>(isFeatureEnabledForThisEnv) // Default to true once deployed to all envs
  const chainsSliderRef = useRef<HTMLDivElement | null>(null)
  const scrollChainsLeft = () => chainsSliderRef.current?.scrollBy({ left: -240, behavior: 'smooth' })
  const scrollChainsRight = () => chainsSliderRef.current?.scrollBy({ left: 240, behavior: 'smooth' })

  const { country, fiatCurrency } = useAppSelector(orgSettingsSelector)
  // @ts-ignore TS-2435
  const balancePerChainForOrg = useAppSelector(selectBalancePerChainForOrg)
  const totalBalanceFilteredByChain = useAppSelector((state) =>
    selectTotalBalanceForOrgFilteredByChain(state, [...filterChains])
  )
  const totalBalance = useAppSelector(selectTotalBalanceForOrg)
  const walletBalances = useAppSelector(selectWalletBalances)

  // @ts-ignore TS-2435
  const walletBalancesV2 = useAppSelector(selectWalletsWithDescendingBalance)
  const topFiveAssets = useAppSelector(selectTopFiveAssets)
  const topFiveAssetsV2 = useAppSelector((state) => selectTopFiveAssetsV2(state, [...filterChains]))
  const username = useAppSelector((state) => state?.accountV2?.account?.firstName)
  const { data: latestSolPriceData } = useGetLatestSolPriceQuery()
  const latestSolPrice = latestSolPriceData?.solana?.usd

  // Check if there are any wallets imported
  const hasWallets = walletData?.items && walletData.items.length > 0

  useEffect(() => {
    walletRefetch()
    assetsRefetch()
    balancePerChainForOrgRefetch()
    balanceForWalletsRefetch()
    setAreAllChainsSelected(true)
    setFilterChains([])
  }, [orgId])

  const handleAllChainSelect = () => {
    setAreAllChainsSelected(true)
    if (filterChains.length > 0) {
      setFilterChains([])
    }
  }

  const handleChainfilter = (chainIdSelected: string) => {
    const normalized = (chainIdSelected || '').toLowerCase()
    if (filterChains.includes(normalized)) {
      const applyFilterArray = filterChains.filter((chain) => chain !== normalized)
      setFilterChains(applyFilterArray)
      if (applyFilterArray.length === 0) {
        setAreAllChainsSelected(true)
      }
    } else {
      setFilterChains([...filterChains, normalized])
      setAreAllChainsSelected(false)
    }
  }

  useEffect(() => {
    if (
      router.query.syncWallets &&
      isFeatureEnabledForThisEnv &&
      walletBalancesV2.length > 0 &&
      !window.sessionStorage.getItem('wallets_synced')
    ) {
      startWalletSync()
      window.sessionStorage.setItem('wallets_synced', 'true')
    }
  }, [router.query.syncWallets, walletBalancesV2.length])

  useEffect(() => {
    if (
      router.query.syncWallets &&
      !isFeatureEnabledForThisEnv &&
      walletBalances.wallets.length > 0 &&
      !window.sessionStorage.getItem('wallets_synced')
    ) {
      startWalletSync()
      window.sessionStorage.setItem('wallets_synced', 'true')
    }
  }, [router.query.syncWallets, walletBalances.wallets.length])

  // Derive demo data from SAMPLE_TOKEN_DATA
  const tokenPalette = [
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#14B8A6',
    '#F97316',
    '#22C55E',
    '#A855F7',
    '#EAB308',
    '#F43F5E',
    '#0EA5E9',
    '#D946EF',
    '#16A34A',
    '#FB7185',
    '#64748B',
    '#60A5FA',
    '#34D399',
    '#F59E0B'
  ]
  const hashString = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i += 1) {
      hash = (hash * 31 + str.charCodeAt(i)) % 2147483647
    }
    return hash
  }
  const colorForSymbol = (symbol: string, index: number) => {
    const base = symbol ? Math.abs(hashString(symbol)) : index
    return tokenPalette[base % tokenPalette.length]
  }
  // Deterministic pseudo-random trend per token symbol, range [-12, 12], avoid 0
  const trendForSymbol = (symbol: string, index: number) => {
    const base = symbol ? Math.abs(hashString(symbol)) : index
    let val = (base % 25) - 12 // -12 .. 12
    if (val === 0) val = 1
    return val
  }
  const allTokens = [...SAMPLE_TOKEN_DATA]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .map((t, idx) => ({
      id: t.address,
      name: t.tokenName,
      symbol: t.tokenSymbol,
      amount: t.balance,
      value: t.value || 0,
      trend: trendForSymbol(t.tokenSymbol || String(idx), idx),
      color: colorForSymbol(t.tokenSymbol || String(idx), idx),
      icon: t.tokenIcon
    }))
  const topTokens = allTokens.slice(0, 10)
  const totalTokenValueAll = allTokens.reduce((sum, t) => sum + (t.value || 0), 0)
  const tokenSymbolToIcon: Record<string, string> = SAMPLE_TOKEN_DATA.reduce((acc, t) => {
    const key = (t.tokenSymbol || '').toLowerCase()
    return key && !acc[key] ? { ...acc, [key]: t.tokenIcon } : acc
  }, {} as Record<string, string>)
  const tokenSymbolToLabel: Record<string, string> = SAMPLE_TOKEN_DATA.reduce((acc, t) => {
    const key = (t.tokenSymbol || '').toLowerCase()
    return key && !acc[key] ? { ...acc, [key]: t.tokenSymbol } : acc
  }, {} as Record<string, string>)
  const tokenSymbolToColor: Record<string, string> = allTokens.reduce((acc, t) => {
    const key = (t.symbol || '').toLowerCase()
    return key && !acc[key] ? { ...acc, [key]: t.color } : acc
  }, {} as Record<string, string>)

  // DashboardBalance props from tokens
  const demoBalance = totalTokenValueAll
  const demoBalancePerChain: Record<string, number> = allTokens.reduce((acc, t) => {
    const key = t.symbol?.toLowerCase() || 'unknown'
    return { ...acc, [key]: (acc[key] || 0) + (t.value || 0) }
  }, {} as Record<string, number>)
  const demoTotalBalanceForOrg = totalTokenValueAll
  const demoNumberOfWallets = allTokens.length

  // PortfolioAnalysis: use top 3 tokens for sample data
  const portfolioTop3 = allTokens.slice(0, 3)
  const portfolioChartData = portfolioTop3.map((t, i) => ({
    date: t.symbol,
    token1: i === 0 ? t.value : 0,
    token2: i === 1 ? t.value : 0,
    token3: i === 2 ? t.value : 0
  }))
  const portfolioTokensMeta = portfolioTop3.map((t) => ({ name: t.symbol, color: t.color, icon: t.icon }))

  // TokenValue expects bar data; use each token symbol as period
  const tokenValueChartData = allTokens.map((t) => ({ period: t.symbol, value: t.value }))

  // console.log('balancePerChainForOrg', balancePerChainForOrg)
  // console.log('totalBalanceFilteredByChain', totalBalanceFilteredByChain)
  // console.log('totalBalance', totalBalance)
  // console.log('walletBalances', walletBalances)
  // console.log('walletBalancesV2', walletBalancesV2)
  // console.log('isFeatureEnabledForThisEnv', isFeatureEnabledForThisEnv)

  return (
    <View.Content>
      {/* Original Dashboard Sections */}
      {/* <div className="pt-6">
        <QuickActions username={username} />
      </div> */}
      {isFeatureEnabledForThisEnv && (
        <div className="flex items-center gap-x-2 mb-5 mt-5">
          {hasWallets && (
            <button type="button" onClick={scrollChainsLeft} className="px-2 py-1 rounded bg-[#F5F5F5]">
              ‹
            </button>
          )}
          <div ref={chainsSliderRef} className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-x-3 items-center min-w-max pr-2">
              {/* <MultiSelectCheckboxTab
                label="All Tokens"
                imageUrl={allChainsSvg}
                id="allChainsFilter"
                onChange={handleAllChainSelect}
                checked={areAllChainsSelected}
                checkboxGroupName="chainsFilter"
              />
              {hasWallets &&
                supportedChainsDisplay?.map((chain) => (
                  <MultiSelectCheckboxTab
                    label={chain.name}
                    imageUrl={chain.imageUrl}
                    checked={filterChains.includes((chain.id || '').toLowerCase()) && !areAllChainsSelected}
                    onChange={() => handleChainfilter(chain.id)}
                    checkboxGroupName="chainsFilter"
                    id={chain.id}
                    key={chain.id}
                  />
                ))} */}
              <MultiSelectCheckboxTab
                label="All Chains"
                imageUrl={allChainsSvg}
                id="allChainsFilter"
                onChange={handleAllChainSelect}
                checked={areAllChainsSelected}
                checkboxGroupName="chainsFilter"
              />
              {hasWallets &&
                supportedChains?.map((chain) => (
                  <MultiSelectCheckboxTab
                    label={chain.name}
                    imageUrl={chain.imageUrl}
                    checked={filterChains.includes(chain.id) && !areAllChainsSelected}
                    onChange={() => handleChainfilter(chain.id)}
                    checkboxGroupName="chainsFilter"
                    id={chain.id}
                    key={chain.id}
                  />
                ))}
            </div>
          </div>
          {hasWallets && (
            <button type="button" onClick={scrollChainsRight} className="px-2 py-1 rounded bg-[#F5F5F5]">
              ›
            </button>
          )}
        </div>
      )}
      <section>
        <DashboardBalance
          countrySetting={{ iso: country?.iso }}
          balancePerChain={isFeatureEnabledForThisEnv ? balancePerChainForOrg : {}}
          filterChains={isFeatureEnabledForThisEnv ? filterChains || [] : []}
          fiatCurrencySetting={{ symbol: fiatCurrency?.symbol, code: fiatCurrency?.code }}
          balance={isFeatureEnabledForThisEnv ? totalBalanceFilteredByChain : walletBalances.totalBalance}
          totalBalanceForOrg={isFeatureEnabledForThisEnv ? totalBalance : walletBalances.totalBalance}
          numberOfWallets={isFeatureEnabledForThisEnv ? walletBalancesV2.length : walletBalances.wallets.length}
          loading={isWalletsLoading || isAssetsLoading || isWalletSyncing} // May not need asset loading here
          hasWallets={hasWallets}
          customColors={tokenSymbolToColor}
        />
        {/* <DashboardBalance
          loading={false}
          balance={demoBalance}
          balancePerChain={demoBalancePerChain}
          filterChains={isFeatureEnabledForThisEnv ? filterChains : []}
          totalBalanceForOrg={demoTotalBalanceForOrg}
          fiatCurrencySetting={{
            symbol: (fiatCurrency && fiatCurrency.symbol) || '$',
            code: (fiatCurrency && fiatCurrency.code) || 'USD'
          }}
          countrySetting={{ iso: (country && country.iso) || 'US' }}
          numberOfWallets={demoNumberOfWallets}
          customIcons={tokenSymbolToIcon}
          customLabels={tokenSymbolToLabel}
          customColors={tokenSymbolToColor}
          hasWallets={hasWallets}
        /> */}
      </section>
      <section className="mt-6 flex flex-row gap-4 sm:flex-col">
        <div className="basis-2/3">
          {/* <DashboardTransactions {...SAMPLE_TRANSACTIONS_PROPS} /> */}
          <DashboardTransactions
            wallets={walletData?.items || []}
            transactions={txData?.items || []}
            loading={isTxLoading || isWalletsLoading || isWalletSyncing}
          />
        </div>
        <div className="basis-1/3">
          <DashboardWallets
            wallets={walletBalancesV2}
            chains={supportedChains}
            loading={isWalletsLoading || isWalletSyncing}
            isWalletsLoading={isWalletsLoading}
            isWalletSyncing={isWalletSyncing}
            fiatCurrencySetting={{
              symbol: (fiatCurrency && fiatCurrency.symbol) || '$',
              code: (fiatCurrency && fiatCurrency.code) || 'USD'
            }}
            countrySetting={{ iso: (country && country.iso) || 'US' }}
            filterChains={isFeatureEnabledForThisEnv ? filterChains || [] : []}
          />
        </div>
      </section>
      {/* Top Metrics Cards */}
      <div className="flex gap-4 sm:flex-col">
        <div className="basis-1/2">
          <section className="mt-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:grid-cols-1">
            <MetricsCard {...SAMPLE_METRICS_DATA.transactions} hasWallets={hasWallets} />
            <MetricsCard {...SAMPLE_METRICS_DATA.lastTransaction} hasWallets={hasWallets} />
            <MetricsCard
              label={SAMPLE_METRICS_DATA.btcPrice.label}
              value={
                latestSolPrice ? `$${Number(latestSolPrice).toLocaleString()}` : SAMPLE_METRICS_DATA.btcPrice.value
              }
              additionalInfo={SAMPLE_METRICS_DATA.btcPrice.additionalInfo}
              trend={SAMPLE_METRICS_DATA.btcPrice.trend}
              hasWallets={hasWallets}
            />
            <MetricsCard
              label={SAMPLE_METRICS_DATA.walletValue.label}
              value={`$${Number(totalBalance || walletBalances.totalBalance).toLocaleString()}`}
              additionalInfo={null}
              trend={null}
              hasWallets={hasWallets}
            />
          </section>

          {/* Wallet Overview and Portfolio Analysis */}
          <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:grid-cols-1">
            <WalletOverview
              totalValue={totalBalance || walletBalances.totalBalance}
              trend={31.5}
              tokens={allTokens}
              hasWallets={hasWallets}
            />
          </section>
          <section className="mt-4 grid grid-cols-2 lg:grid-cols-2 gap-4 sm:grid-cols-1">
            <MonthlyTransaction {...SAMPLE_CHARTS_DATA.monthlyTransaction} hasWallets={hasWallets} />
            <PriceChart {...SAMPLE_CHARTS_DATA.ethPrice} hasWallets={hasWallets} />
          </section>
        </div>

        {/* Bottom Charts Row */}
        <div className="basis-1/2">
          <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:grid-cols-1">
            <PortfolioAnalysis
              timeframes={['1W', '1M', '3M', '1Y']}
              selectedTimeframe="1M"
              chartData={portfolioChartData}
              tokens={portfolioTokensMeta}
              hasWallets={hasWallets}
            />
            <TokenValue selectedFilter="All Tokens" chartData={tokenValueChartData} hasWallets={hasWallets} />
          </section>
        </div>
      </div>
      {/* <DashboardAssets
          chains={supportedChains}
          wallets={walletBalances.wallets || []}
          assets={isFeatureEnabledForThisEnv ? topFiveAssetsV2 : topFiveAssets || []}
          loading={isAssetsLoading || isWalletSyncing}
        /> */}
    </View.Content>
  )
}

export default DashboardV2
