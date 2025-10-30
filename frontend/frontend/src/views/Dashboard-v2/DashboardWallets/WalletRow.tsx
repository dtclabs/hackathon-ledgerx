import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { ChainList } from '@/components-v2/molecules/ChainList/ChainList'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import ReactTooltip from 'react-tooltip'

const MAX_WALLET_LABEL_LENGTH = 32
const WALLET_MAPPING = {
  eth: 'EOA Wallet',
  gnosis: 'Safe'
}

export interface IWalletRow {
  name: string
  address: string
  balance: string
  distribution: string
  isWalletLoading?: boolean
  isWalletSyncing?: boolean
  chains: any
  type: string
  currency?: string
  fiatCurrencySetting?: {
    symbol: string
    code: string
  }
  countrySetting?: {
    iso: string
  }
  filterChains?: string[] // feature flag this - remove optional when removing feature flag
  perChainBalance: any // feature flag this - along with a better TS interface
}

const WalletRow: FC<IWalletRow> = (wallet) => {
  const getBalanceBasedOnFilteredChains = (walletObj) => {
    if (walletObj?.filterChains.length > 0) {
      const balancesForFilteredChains = walletObj.perChainBalance.filter((chainObj) =>
        walletObj.filterChains.includes(chainObj.blockchainId)
      )
      const totalForFilteredChains = balancesForFilteredChains.reduce((acc, cur) => acc + parseFloat(cur.total), 0)

      return totalForFilteredChains
    }

    return wallet?.balance
  }

  const chainList = wallet.chains.map((chain) =>
    wallet?.filterChains.length > 0 && !wallet.filterChains.includes(chain.id)
      ? { ...chain, isGrayedOut: true }
      : { ...chain }
  )

  return (
    <div
      className="flex flex-row justify-between items-center h-[80px] gap-1"
      style={{ borderBottom: '1px solid #F1F1EF' }}
    >
      <div className="basis-1/2 flex flex-col justify-between ">
        {wallet.isWalletLoading ? (
          <SkeletonLoader variant="rounded" height={14} width={80} />
        ) : (
          <>
            <Typography
              variant="body2"
              classNames="truncate font-bold"
              color="primary"
              data-tip="Tooltip content"
              data-for={wallet?.name}
            >
              {wallet?.name?.length > MAX_WALLET_LABEL_LENGTH ? `${wallet?.name.slice(0, 7)}...` : wallet?.name}
            </Typography>

            {wallet?.name?.length > MAX_WALLET_LABEL_LENGTH && (
              <ReactTooltip
                id={wallet?.name}
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
              >
                {wallet?.name}
              </ReactTooltip>
            )}
          </>
        )}
        {wallet.isWalletLoading ? (
          <SkeletonLoader variant="rounded" height={18} width={130} />
        ) : (
          <WalletAddress split={5} address={wallet.address}>
            <WalletAddress.Link address={wallet.address} options={wallet.chains} />
            <WalletAddress.Copy address={wallet.address} />
          </WalletAddress>
        )}
      </div>
      <div className="flex gap-1 flex-col justify-end">
        <div className="basis-2/6 flex items-center gap-1">
          <div className="flex justify-end gap-1">
            {wallet.isWalletSyncing ? (
              <SkeletonLoader variant="rounded" height={12} width={100} />
            ) : (
              <>
                {' '}
                <Typography variant="body2">
                  {wallet.fiatCurrencySetting?.symbol}
                  {isFeatureEnabledForThisEnv &&
                    toNearestDecimal(String(getBalanceBasedOnFilteredChains(wallet)), wallet.countrySetting?.iso, 2)}
                  {!isFeatureEnabledForThisEnv &&
                    toNearestDecimal(String(wallet.balance), wallet.countrySetting?.iso, 2)}
                </Typography>
                {/* <Typography variant="body2">{wallet.fiatCurrencySetting?.code}</Typography> */}
                <Typography variant="body2">USD</Typography>
              </>
            )}
          </div>
          <div className="flex justify-end">
            {wallet.isWalletSyncing ? (
              <SkeletonLoader variant="rounded" height={14} width={40} />
            ) : wallet.distribution !== null ? (
              <Typography
                variant="caption"
                classNames={`text-[#858585] ${
                  isFeatureEnabledForThisEnv && wallet.filterChains.length > 0 ? 'opacity-50' : ''
                }`}
              >
                ({wallet.distribution}%)
              </Typography>
            ) : null}
          </div>
        </div>
        <div className="basis-1/6 flex flex-col gap-[2px] items-end">
          {wallet.isWalletSyncing ? (
            <SkeletonLoader variant="rounded" height={18} width={40} />
          ) : (
            <ChainList chains={chainList.sort((chain) => (chain.isGrayedOut ? -1 : 1))} />
          )}
          {/* {wallet.isWalletSyncing ? (
            <SkeletonLoader variant="rounded" height={14} width={105} />
          ) : (
            <Typography variant="caption">{WALLET_MAPPING[wallet.type]}</Typography>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default WalletRow
