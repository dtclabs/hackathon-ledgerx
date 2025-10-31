import React from 'react'
import { formatNumber } from '@/utils/formatNumber'
import { ITaxLot } from '../TaxLots'
import { format } from 'date-fns'
import { toShort } from '@/utils/toShort'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import { selectedChainSelector } from '@/slice/platform/platform-slice'

interface ITaxLotRow {
  taxLot: ITaxLot
  lastRow?: boolean
  asset: string
}

const TaxLotRow: React.FC<ITaxLotRow> = ({ taxLot, lastRow, asset }) => {
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { fiatCurrency: fiatCurrencySetting } = useAppSelector(orgSettingsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)

  return (
    <div
      className={`flex items-center text-xs leading-[18px] font-medium py-3 ${
        !lastRow && 'border-b-[1px] border-dashboard-border'
      }`}
    >
      <div className="pl-6 w-[8%] min-w-[92px] truncate">{toShort(taxLot.id, 4, 4)}</div>
      <div className="pl-6 w-[12%] min-w-[160px]">
        <div className="mb-1">{format(new Date(taxLot.purchasedAt), 'dd/MM/yyyy, hh:mm a')}</div>
        {taxLot.cryptocurrency.addresses.find((item) => item.blockchainId === selectedChain?.id).address && (
          <WalletAddress
            address={taxLot.cryptocurrency.addresses.find((item) => item.blockchainId === selectedChain?.id).address}
            noAvatar
            useAddress
            noColor
            showFirst={5}
            showLast={4}
            className="text-xs text-grey-700"
            addressClassName="w-[90px]"
            addressWidth="w-[90%]"
          />
        )}
      </div>
      {isWalletSyncing ? (
        <div className="pl-1 w-[12%] min-w-[140px] truncate">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <div className="pl-6 w-[12%] min-w-[140px] truncate">
          {formatNumber(taxLot.amountTotal)} {asset}
        </div>
      )}
      {isWalletSyncing ? (
        <div className="pl-1 w-[12%] min-w-[140px] truncate">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <div className="pl-6 w-[12%] min-w-[140px] truncate">{`${fiatCurrencySetting?.symbol}${formatNumber(
          taxLot.costBasisPerUnit,
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }
        )} ${taxLot.costBasisFiatCurrency.toUpperCase()} / ${asset}`}</div>
      )}
      {isWalletSyncing ? (
        <div className="pl-1 w-[12%] min-w-[140px] truncate">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <div className="pl-6 w-[12%] min-w-[140px] truncate">{`${fiatCurrencySetting?.symbol}${formatNumber(
          taxLot.costBasisAmount,
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }
        )} ${taxLot.costBasisFiatCurrency.toUpperCase()}`}</div>
      )}
      <div className="pl-6 w-[10%] min-w-[100px] truncate">{format(new Date(taxLot.updatedAt), 'dd/MM/yyyy')}</div>
      <div className="pl-6 w-[12%] min-w-[120px] truncate">{taxLot?.wallet?.name}</div>
      <div className="px-6 w-[22%] min-w-[220px]">
        {isWalletSyncing ? (
          <div className="pl-1 w-[12%] min-w-[140px] truncate">
            <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
          </div>
        ) : (
          <>
            <div className="mb-2">{`${formatNumber(taxLot.amountAvailable)} ${asset} / ${formatNumber(
              taxLot.amountTotal
            )} ${asset}`}</div>
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
      </div>
    </div>
  )
}

export default TaxLotRow
