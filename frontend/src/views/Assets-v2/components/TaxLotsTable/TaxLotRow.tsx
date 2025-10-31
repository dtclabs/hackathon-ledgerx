import React from 'react'
import { formatNumber } from '@/utils/formatNumber'
import { ITaxLot } from '../TaxLots'
import { format } from 'date-fns'
import { toShort } from '@/utils/toShort'
import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useRouter } from 'next/router'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import Typography from '@/components-v2/atoms/Typography'

interface ITaxLotRow {
  taxLot: ITaxLot
  lastRow?: boolean
  asset: string
}

const TaxLotRow: React.FC<ITaxLotRow> = ({ taxLot, lastRow, asset }) => {
  const router = useRouter()
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const selectedChain = useAppSelector(selectedChainSelector)
  const { fiatCurrency: fiatCurrencySetting } = useAppSelector(orgSettingsSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const { address } = taxLot?.cryptocurrency?.addresses
    ? taxLot.cryptocurrency.addresses.find((item) => item.blockchainId === router.query?.blockchainId)
    : { address: null }

  return (
    <div
      className={`flex items-center text-xs leading-[18px] font-medium py-3 ${
        !lastRow && 'border-b-[1px] border-dashboard-border'
      }`}
    >
      <Typography variant="caption" classNames="pl-6 w-[8%] min-w-[92px] truncate">
        {toShort(taxLot.id, 4, 4)}
      </Typography>
      <div className="pl-6 w-[12%] min-w-[160px]">
        <Typography variant="caption" classNames="mb-1">
          {format(new Date(taxLot.purchasedAt), 'dd/MM/yyyy, hh:mm a')}
        </Typography>
        {address && (
          <WalletAddress split={5} address={address} variant="caption">
            <WalletAddress.Link
              address={address}
              isMultiple={false}
              blockExplorer={
                supportedChains.find((chain) => chain.id.toLowerCase() === router.query?.blockchainId)?.blockExplorer
              }
            />
            <WalletAddress.Copy address={address} />
          </WalletAddress>
        )}
      </div>
      {isWalletSyncing ? (
        <div className="pl-1 w-[12%] min-w-[140px] truncate">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <Typography variant="caption" classNames="pl-6 w-[12%] min-w-[140px] truncate">
          {formatNumber(taxLot.amountTotal)} {asset}
        </Typography>
      )}
      {isWalletSyncing ? (
        <div className="pl-1 w-[12%] min-w-[140px] truncate">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <Typography variant="caption" classNames="pl-6 w-[12%] min-w-[140px] truncate">
          {`${fiatCurrencySetting?.symbol}${formatNumber(taxLot.costBasisPerUnit, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })} ${taxLot.costBasisFiatCurrency.toUpperCase()} / ${asset}`}
        </Typography>
      )}
      {isWalletSyncing ? (
        <div className="pl-1 w-[12%] min-w-[140px] truncate">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <Typography variant="caption" classNames="pl-6 w-[12%] min-w-[140px] truncate">
          {`${fiatCurrencySetting?.symbol}${formatNumber(taxLot.costBasisAmount, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })} ${taxLot.costBasisFiatCurrency.toUpperCase()}`}
        </Typography>
      )}
      <Typography variant="caption" classNames="pl-6 w-[10%] min-w-[100px] truncate">
        {format(new Date(taxLot.updatedAt), 'dd/MM/yyyy')}
      </Typography>
      <Typography variant="caption" classNames="pl-6 w-[12%] min-w-[120px] truncate">
        {taxLot?.wallet?.name}
      </Typography>
      <Typography variant="caption" classNames="px-6 w-[22%] min-w-[220px]">
        {isWalletSyncing ? (
          <div className="pl-1 w-[12%] min-w-[140px] truncate">
            <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
          </div>
        ) : (
          <>
            <Typography variant="caption" classNames="mb-2">
              {`${formatNumber(taxLot.amountAvailable)} ${asset} / ${formatNumber(taxLot.amountTotal)} ${asset}`}
            </Typography>
            <div className="flex items-center mb-3">
              <div className="w-full bg-grey-200 rounded-2xl h-1">
                <div
                  className="bg-grey-800 h-1 rounded-2xl"
                  style={{ width: `${(+taxLot.amountAvailable / +taxLot.amountTotal) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}
      </Typography>
    </div>
  )
}

export default TaxLotRow
