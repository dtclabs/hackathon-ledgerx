/* eslint-disable no-unneeded-ternary */
/* eslint-disable react/no-array-index-key */
import { FC, useMemo, useEffect, useState, useRef } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import PercentageBar from '@/components-v2/atoms/PercentageBar'
import { CHAIN_COLORS, CHAIN_SHORT_NAMES, isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { useAppSelector } from '@/state'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import Image from 'next/legacy/image'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'

interface IProps {
  loading?: boolean
  balance: number
  balancePerChain?: any // todo: turn it into a more descriptive type - feature flag this - remove optional when removing feature flag
  filterChains?: string[] // todo: feature flag this - remove optional when removing feature flag
  totalBalanceForOrg?: any // todo: feature flag this - remove optional when removing feature flag
  fiatCurrencySetting: {
    symbol: string
    code: string
  }
  countrySetting: {
    iso: string
  }
  numberOfWallets?: number // todo: remove optional when removing feature flag
  // Optional maps to override default chain icon/label with token-specific values
  customIcons?: Record<string, string>
  customLabels?: Record<string, string>
  // Optional colors per token/chain key
  customColors?: Record<string, string>
  hasWallets?: boolean
}

const DashboardBalance: FC<IProps> = ({
  loading = true,
  balance,
  totalBalanceForOrg,
  balancePerChain,
  filterChains,
  fiatCurrencySetting,
  countrySetting,
  numberOfWallets,
  customIcons,
  customLabels,
  customColors,
  hasWallets = false
}) => {
  const [fakeLoader, setFakeLoader] = useState(balance ? false : true)
  const tokensSliderRef = useRef<HTMLDivElement | null>(null)
  const scrollTokensLeft = () => tokensSliderRef.current?.scrollBy({ left: -240, behavior: 'smooth' })
  const scrollTokensRight = () => tokensSliderRef.current?.scrollBy({ left: 240, behavior: 'smooth' })
  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLoader(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])
  const chainIcons = useAppSelector(selectChainIcons)
  const supportedChains = useAppSelector(supportedChainsSelector)

  const transformedBalanceObject = useMemo(() => {
    const result = {}
    const keys = Object.keys(balancePerChain || {})
    const filteredKeys = filterChains && filterChains.length > 0 ? keys.filter((k) => filterChains.includes(k)) : keys
    const filteredTotal = filteredKeys.reduce((sum, k) => sum + (balancePerChain[k] || 0), 0)
    filteredKeys
      .sort((chainA, chainB) => balancePerChain[chainB] - balancePerChain[chainA])
      .forEach((chain) => {
        result[chain] = {
          value: balancePerChain[chain],
          ratio: filteredTotal !== 0 ? (balancePerChain[chain] / filteredTotal) * 100 : 0
        }
      })

    return result
  }, [filterChains, balancePerChain])

  const emptyChainsObject = useMemo(() => {
    const result = {}
    supportedChains.forEach((chain) => {
      result[chain.id] = {
        value: 0,
        ratio: 0
      }
    })

    return result
  }, [supportedChains])

  const getFormattedTooltip = (chainData, chainId) => (
    <div>
      <div className="flex gap-2">
        <Image src={chainIcons[chainId]} width={14} height={14} className="rounded" />
        <Typography variant="overline">{CHAIN_SHORT_NAMES[chainId]}</Typography>
      </div>
      <Typography variant="caption">{`Balance: ${fiatCurrencySetting?.symbol}${toNearestDecimal(
        String(chainData.value),
        countrySetting?.iso,
        2
      )}`}</Typography>
      <Typography variant="caption">{`Ratio: ${fiatCurrencySetting?.symbol}${chainData.ratio.toFixed(2)}%`}</Typography>
    </div>
  )

  const dataForPercentageBar = useMemo(() => {
    const result = []
    Object.keys(transformedBalanceObject)
      .sort((chainA, chainB) => balancePerChain[chainB] - balancePerChain[chainA])
      .forEach((chain) => {
        result.push({
          ratioInPercentage: transformedBalanceObject[chain].ratio,
          color:
            filterChains.length > 0 && !filterChains.includes(chain)
              ? '#E2E2E0'
              : (customColors && customColors[chain]) || CHAIN_COLORS[chain] || '#3B82F6',
          tooltipId: `${chain}-balance`,
          tooltip: getFormattedTooltip(transformedBalanceObject[chain], chain)
        })
      })

    return result
  }, [filterChains, transformedBalanceObject])

  return (
    <div
      className="rounded-lg p-4 h-[124px] sm:h-[auto] bg-white"
      // style={{ boxShadow: '0px 16px 48px -16px rgba(0, 0, 0, 0.02), 0px 0px 80px rgba(0, 0, 0, 0.05)' }}
    >
      {fakeLoader || loading ? (
        <SkeletonLoaderRow />
      ) : (
        <div className="flex sm:flex-col">
          <div className={`pr-5 ${isFeatureEnabledForThisEnv && balance !== 0 ? 'border-r sm:border-none' : ''}`}>
            <Typography variant="overline" color="secondary">
              TOTAL BALANCE
            </Typography>
            <Typography variant="heading1">
              {hasWallets
                ? `${fiatCurrencySetting?.symbol}${toNearestDecimal(String(balance), countrySetting?.iso, 2)} ${
                    // fiatCurrencySetting?.code
                    'USD'
                  }`
                : '$0.00'}
            </Typography>
          </div>

          {isFeatureEnabledForThisEnv && hasWallets ? (
            <div className="grow pl-5 sm:pl-0 overflow-hidden flex-1">
              {balance !== 0 && (
                <div className="max-w-full overflow-hidden">
                  <PercentageBar inputs={dataForPercentageBar} />
                </div>
              )}
              {balance === 0 && Object.keys(transformedBalanceObject).length > 0 && (
                <div className="rounded w-full bg-grey-200 h-[6px]" />
              )}
              {numberOfWallets > 0 && totalBalanceForOrg === '0' && (
                <>
                  <div className="rounded w-full bg-grey-200 h-[6px]" />
                  <div className="flex mt-4 justify-between">
                    {Object.keys(emptyChainsObject).map((key) => (
                      <div
                        key={`${key}-data`}
                        className={`${filterChains.length > 0 && !filterChains.includes(key) && 'grayscale'} ${
                          filterChains.length > 0 && !filterChains.includes(key) && 'opacity-70'
                        }`}
                      >
                        <div className="flex gap-2">
                          <Image src={chainIcons[key]} width={14} height={14} className="rounded" />
                          <Typography variant="overline" color="secondary">
                            {CHAIN_SHORT_NAMES[key]}
                          </Typography>
                        </div>
                        <Typography variant="subtitle1">{`${fiatCurrencySetting?.symbol}0 ${'USD'}`}</Typography>
                        <Typography variant="caption">0%</Typography>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 mt-6 w-full overflow-hidden">
                <button type="button" onClick={scrollTokensLeft} className="px-2 py-1 rounded bg-grey-200">
                  ‹
                </button>
                <div ref={tokensSliderRef} className="flex-1 overflow-x-auto no-scrollbar max-w-full">
                  <div className="inline-flex gap-6 items-start whitespace-nowrap pr-2">
                    {Object.keys(transformedBalanceObject).map((key) => (
                      <div
                        key={`${key}-data`}
                        className={` ${filterChains.length > 0 && !filterChains.includes(key) && 'grayscale'} ${
                          filterChains.length > 0 && !filterChains.includes(key) && 'opacity-70'
                        }`}
                      >
                        <div className="flex gap-2">
                          <Image src={chainIcons[key]} width={14} height={14} className="rounded" />
                          <Typography variant="overline" color="secondary">
                            {key}
                          </Typography>
                        </div>
                        <Typography variant="subtitle1">{`${fiatCurrencySetting?.symbol}${toNearestDecimal(
                          String(transformedBalanceObject[key].value),
                          countrySetting?.iso,
                          2
                        )} ${'USD'}`}</Typography>
                        <Typography variant="caption">{`${
                          transformedBalanceObject[key].ratio !== 0 ? transformedBalanceObject[key].ratio.toFixed(2) : 0
                        }%`}</Typography>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={scrollTokensRight} className="px-2 py-1 rounded bg-grey-200">
                  ›
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <SkeletonLoader variant="rounded" height={8} width="100%" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SkeletonLoaderRow = () => (
  <div className="mt-4">
    {[...Array(1).keys()].map((item, index) => (
      <div key={index} className="flex flex-row gap-6 h-[80px] items-center">
        <div className="flex flex-row basis-1/3">
          <div className="basis-4/5 flex flex-col gap-1 ">
            <SkeletonLoader variant="rounded" height={8} width={100} />
            <SkeletonLoader variant="rounded" height={28} width={130} />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default DashboardBalance
