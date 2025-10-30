/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable react/no-array-index-key */
import { FC, useMemo, useState, useEffect } from 'react'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import DashboardCard from '../components/DashboardCard'
import MoneyIcon from '@/public/svg/icons/blue-icon-money.svg'
import WalletsLoading from './WalletsLoading'
import WalletRow, { IWalletRow } from './WalletRow'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'

interface IPropsWalletCard {
  wallets: any
  chains?: any
  loading?: boolean
  isWalletsLoading: boolean
  isWalletSyncing: boolean
  fiatCurrencySetting: {
    symbol: string
    code: string
  }
  countrySetting: {
    iso: string
  }
  filterChains?: string[] // feature flag this - remove optional when removing feature flag
}

const MAXIMUM_TOP_WALLETS = 5

const DashboardWallets: FC<IPropsWalletCard> = ({
  chains,
  wallets,
  loading,
  isWalletSyncing,
  isWalletsLoading,
  fiatCurrencySetting,
  countrySetting,
  filterChains
}) => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const handleOnClickImport = () => router.push(`/${organizationId}/wallets/import`)
  const handleOnClickViewAll = () => router.push(`/${organizationId}/wallets`)

  const walletRowData: IWalletRow[] | [] = useMemo(() => {
    const parsedData: IWalletRow[] = []
    if (wallets.length > 0) {
      wallets.forEach((wallet, index) => {
        const walletChains = isFeatureEnabledForThisEnv ? wallet?.supportedBlockchains : Object.keys(wallet.chainTotals)
        const walletsSupportedChainsData = chains?.filter((chain) => walletChains.includes(chain.id))
        if (index < MAXIMUM_TOP_WALLETS) {
          parsedData.push({
            name: wallet.name,
            address: wallet.address,
            balance: wallet.total,
            chains: walletsSupportedChainsData,
            distribution: wallet.distribution,
            type: wallet.type,
            perChainBalance: isFeatureEnabledForThisEnv ? wallet.perChainBalance : []
          })
        }
      })
    }
    return parsedData
  }, [wallets, chains])

  return (
    <DashboardCard>
      <div className="flex flex-row justify-between">
        <Typography variant="heading3" classNames="sm:text-base">
          Top Wallets
        </Typography>
        {wallets.length > 0 && (
          <Button
            onClick={handleOnClickViewAll}
            height={40}
            label="View All"
            variant="transparent"
            className="border-none text-sm text-[#2E2E2E]"
          />
        )}
      </div>
      {loading ? (
        <WalletsLoading />
      ) : wallets.length > 0 ? (
        <div>
          {walletRowData.map((wallet: IWalletRow, index) => (
            <WalletRow
              key={index}
              isWalletLoading={isWalletsLoading}
              isWalletSyncing={isWalletSyncing}
              fiatCurrencySetting={fiatCurrencySetting}
              countrySetting={countrySetting}
              filterChains={filterChains}
              {...wallet}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center h-full">
          <EmptyData>
            <EmptyData.Icon icon={MoneyIcon} />
            <EmptyData.Title>Import a wallet to view balances</EmptyData.Title>
            <EmptyData.CTA label="Import Wallet" onClick={handleOnClickImport} />
          </EmptyData>
        </div>
      )}
    </DashboardCard>
  )
}

export default DashboardWallets
