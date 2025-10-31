/* eslint-disable react/no-array-index-key */
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import AssetsIcon from '@/public/svg/icons/blue-icon-assets.svg'
import AssetsLoading from './AssetsLoading'
import { PieChart, Pie, Tooltip } from 'recharts'
import AssetRow from './AssetRow'
import { useRouter } from 'next/router'
import Button from '@/components-v2/atoms/Button'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useAppSelector } from '@/state'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import DashboardCard from '../components/DashboardCard'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import Image from 'next/legacy/image'
import { EmptyData } from '@/components-v2/molecules/EmptyData'

interface IPropsAssets {
  assets: any
  loading?: boolean
  chains: any
  wallets: any
}

const COLORS = ['#003962', '#0D37A0', '#186FBF', '#27AEC0', '#70D1BA']
const COLORS_CLASSNAME = [
  'checked:!bg-[#003962] checked:!border-[#003962]',
  'checked:!bg-[#0D37A0] checked:!border-[#0D37A0]',
  'checked:!bg-[#186FBF] checked:!border-[#186FBF]',
  'checked:!bg-[#27AEC0] checked:!border-[#27AEC0]',
  'checked:!bg-[#70D1BA] checked:!border-[#70D1BA]'
]

const DashboardAssets: FC<IPropsAssets> = ({ assets, loading, chains, wallets }) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const locale = useAppSelector(orgSettingsSelector)
  const [removedCryptocurrencies, setRemovedCryptocurrencies] = useState({})
  // const assetColorRef = useRef({})
  const [colorMap, setColorMap] = useState({})
  const [disabledCheckbox, setDisableChecked] = useState<boolean>(false)

  useEffect(() => {
    const tempMap = {}
    assets.forEach((asset, index) => {
      tempMap[asset.currency] = { color: COLORS[index], className: COLORS_CLASSNAME[index] }
    })
    setColorMap(tempMap)
  }, [assets])

  const handleOnClickViewAll = () => {
    router.push(`/${organizationId}/assets`)
  }
  const handleOnClickImport = () => {
    router.push(`/${organizationId}/wallets/import`)
  }

  const handleOnClickCheckbox = (_data) => (e) => {
    e.stopPropagation()
    setRemovedCryptocurrencies({
      ...removedCryptocurrencies,
      [_data]: !removedCryptocurrencies[_data] ?? false
    })
  }

  const filteredChartData = useMemo(() => {
    const filterAssets = assets?.filter((asset) => !removedCryptocurrencies[asset.currency])
    if (filterAssets.length === 1) {
      setDisableChecked(true)
    } else {
      setDisableChecked(false)
    }
    const totalValue = filterAssets.reduce((total, asset) => total + asset.totalFiatAmount, 0)

    return filterAssets.map((asset, index) => ({
      name: asset.currency,
      value: asset.totalFiatAmount,
      fill: colorMap[asset.currency]?.color,
      ratio: totalValue > 0 ? Math.round((asset.totalFiatAmount / totalValue) * 100) : 0,
      checked: !removedCryptocurrencies[asset.currency]
    }))
  }, [removedCryptocurrencies, assets, colorMap])

  return (
    <DashboardCard>
      <div className="flex flex-row justify-between">
        <Typography variant="heading3">Top Assets</Typography>
        {wallets?.length > 0 && assets?.length > 0 ? (
          <Button onClick={handleOnClickViewAll} height={40} variant="whiteWithBlackBorder" label="View All" />
        ) : null}
      </div>

      {loading ? (
        <AssetsLoading />
      ) : wallets.length > 0 ? (
        assets.length > 0 ? (
          <div className="flex flex-row">
            <section id="graph" className="basis-1/4 flex justify-center">
              <PieChart width={400} height={400}>
                <Pie
                  data={filteredChartData}
                  innerRadius={60}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                />

                <Tooltip
                  content={
                    <CustomTooltip
                      chains={chains}
                      assets={assets}
                      iso={locale?.country?.iso}
                      assetColorRef={colorMap}
                      fiatCurrencySymbol={locale?.fiatCurrency?.symbol}
                    />
                  }
                />
              </PieChart>
            </section>
            <section id="asset-rows" className="basis-3/4 h-[400px] overflow-y-auto scrollbar mt-4">
              {assets?.map((asset, index) => (
                <AssetRow
                  key={index}
                  assetColorRef={colorMap}
                  selectedAssets={removedCryptocurrencies}
                  onClickCheckbox={handleOnClickCheckbox}
                  locale={locale}
                  asset={asset}
                  chains={chains}
                  disabled={disabledCheckbox}
                />
              ))}
            </section>
          </div>
        ) : (
          <div className="flex justify-center h-full">
            <EmptyData>
              <EmptyData.Icon icon={AssetsIcon} />
              <EmptyData.Title>No Asset Found</EmptyData.Title>
            </EmptyData>
          </div>
        )
      ) : (
        <div className="flex justify-center h-full">
          <EmptyData>
            <EmptyData.Icon icon={AssetsIcon} />
            <EmptyData.Title>Import a wallet to view assets</EmptyData.Title>
            <EmptyData.CTA label="Import Wallet" onClick={handleOnClickImport} />
          </EmptyData>
        </div>
      )}
    </DashboardCard>
  )
}

const CustomTooltip = ({ active, payload, label, ...rest }: any) => {
  const currentAsset = rest?.assets.find((asset) => asset?.currency === payload?.[0]?.name)

  if (active && payload && payload.length) {
    return (
      <div className="p-6 rounded-2xl" style={{ border: '1px solid #E2E2E0', backgroundColor: 'white', width: 180 }}>
        <div className="flex flex-row items-center gap-2">
          <div
            className="rounded"
            style={{ backgroundColor: rest?.assetColorRef[payload?.[0]?.name], height: 20, width: 20 }}
          />
          <Image src={currentAsset?.image?.small} alt={payload?.[0]?.name} height={20} width={20} />
          <Typography variant="caption">{payload?.[0]?.name}</Typography>
        </div>
        <div className="flex flex-row gap-2 mt-2">
          <Typography variant="caption">Units: </Typography>
          <Typography variant="caption">
            {toNearestDecimal(String(currentAsset?.totalTokenAmount), rest?.iso, 2)}
          </Typography>
        </div>
        <div className="flex flex-row gap-2 mt-2">
          <Typography variant="caption">Value: </Typography>
          <Typography variant="caption">
            {rest.fiatCurrencySymbol}
            {toNearestDecimal(String(currentAsset?.totalFiatAmount), rest?.iso, 2)}
          </Typography>
        </div>
        {payload[0]?.payload?.ratio && (
          <div className="flex flex-row gap-2 mt-2">
            <Typography variant="caption">Ratio: </Typography>
            <Typography variant="caption">{payload[0]?.payload?.ratio}%</Typography>
          </div>
        )}
        <div className="flex flex-row items-center gap-2 mt-2">
          <Typography variant="caption">Chains: </Typography>
          <ChainList
            chains={rest?.chains?.filter((chain) =>
              currentAsset?.supportedChains?.find((item) => item.id === chain.id)
            )}
          />
        </div>
      </div>
    )
  }

  return null
}

export default DashboardAssets
