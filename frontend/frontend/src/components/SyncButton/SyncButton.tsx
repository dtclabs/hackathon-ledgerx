import { useSyncBalanceMutation } from '@/slice/wallets/wallet-api'
import { useTimeDistance } from '@/hooks/useTimeDistance'
import { useAppDispatch, useAppSelector } from '@/state'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo } from 'react'

interface ISyncButton {
  wrapperClassName?: string
  width?: number
  height?: number
  wallets?: any
}

const SyncButton: React.FC<ISyncButton> = ({ wrapperClassName, height, width, wallets }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const sources = useAppSelector(walletsSelector)

  const [syncBalance, syncBalanceResult] = useSyncBalanceMutation()

  const handleSync = useCallback(() => {
    syncBalance({ orgId: organizationId })
  }, [dispatch, organizationId])

  const isSyncing = useMemo(() => syncBalanceResult.isLoading, [syncBalanceResult.isLoading])

  const lastUpdate = useMemo(() => {
    if (
      wallets &&
      wallets.items &&
      wallets.items[wallets.items.length - 1] &&
      wallets.items[wallets.items.length - 1].balance?.lastSyncedAt
    ) {
      return wallets.items[wallets.items.length - 1].balance?.lastSyncedAt
    }
    if (sources && sources[sources.length - 1] && sources[sources.length - 1].balance?.lastSyncedAt) {
      return sources[sources.length - 1].balance?.lastSyncedAt
    }
    return undefined
  }, [sources, wallets])

  const time = useTimeDistance(lastUpdate)

  useEffect(() => {
    if (router && router.pathname === '/[organizationId]/transactions') {
      handleSync()
    }
  }, [handleSync, router])

  return (
    <div
      className={`flex items-center justify-end gap-2 text-dashboard-sub whitespace-nowrap py-1 ${
        isSyncing ? 'bg-warning-50 text-warning-500 rounded px-2' : ''
      } ${wrapperClassName}`}
    >
      {isSyncing ? 'Syncing data' : `Last updated: ${time}`}
      <button disabled={isSyncing} onClick={handleSync} type="button" className="flex items-center rounded  text-white">
        {isSyncing ? (
          <img
            src="/svg/SyncButtonOrange.svg"
            alt="greenLoader"
            width={width}
            height={height}
            className="animate-spin"
          />
        ) : (
          <img src="/svg/SyncButton.svg" alt="greenLoader" width={width} height={height} />
        )}
      </button>
    </div>
  )
}

export default SyncButton
