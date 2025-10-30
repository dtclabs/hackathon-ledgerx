import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useSyncBalanceMutation, useLazyGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { useTimeDistance } from '@/hooks/useTimeDistance'
import { useAppSelector } from '@/state'
import { setSyncing, setLastSyncedAt } from '@/slice/wallets/wallet-slice'
import { isEqual } from 'lodash'
import { log } from '@/utils-v2/logger'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'

interface IUseWalletSync {
  organisationId: string
}

export const useWalletSync = ({ organisationId }: IUseWalletSync) => {
  const dispatch = useDispatch()
  const isSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const lastSyncedAt = useAppSelector((state) => state.wallets.lastSyncedAt)
  // Temporarily disable sync
  const disableSync = true
  const [polling, setPolling] = useState(0)
  const [syncWalletTrigger, syncWalletTriggerResult] = useSyncBalanceMutation()
  const [getWalletsTrigger, { data: wallets, isFetching, isError: isLazyGetWalletsError, error: lazyGetWalletsError }] =
    useLazyGetWalletsQuery({ pollingInterval: polling })
  const walletsRef = useRef(wallets)

  if (!isEqual(walletsRef, wallets)) {
    walletsRef.current = wallets
  }

  // On mount fetch wallets - Check if syncing
  useEffect(() => {
    if (disableSync) return
    if (organisationId) {
      dispatch(setSyncing(true))
      getWalletsTrigger(
        {
          orgId: organisationId,
          params: {
            size: 999
          }
        },
        false
      )
    }
  }, [organisationId])

  useEffect(() => {
    if (syncWalletTriggerResult.isError) {
      dispatch(setSyncing(false))
      setPolling(0)
      log.error(
        `${syncWalletTriggerResult?.error?.status} API Error in useWalletSync hook while syncing wallets`,
        [`${syncWalletTriggerResult?.error?.status} API Error in useWalletSync hook while syncing wallets`],
        { actualErrorObject: JSON.stringify(syncWalletTriggerResult?.error) },
        `${window.location.pathname}`
      )
    }
  }, [syncWalletTriggerResult.isError])

  useEffect(() => {
    if (isLazyGetWalletsError) {
      log.error(
        `${lazyGetWalletsError?.status} API Error while fetching wallets data in useWalletSync hook`,
        [`${lazyGetWalletsError?.status} API Error while fetching wallets data in useWalletSync hook`],
        { actualErrorObject: JSON.stringify(lazyGetWalletsError) },
        `${window.location.pathname}`
      )
    }
  }, [isLazyGetWalletsError])

  // CURIOUSITY: THIS USEEFFECT SHOULD IDEALLY TRIGGER WHEN WALLET DATA CHANGES
  // BUT IT ONLY TRIGGERS WHEN WE ADD ISFETCHING TO THE DEPENDENCY ARRAY. NEED
  // TO FIND OUT WHY THAT IS HAPPENING
  useEffect(() => {
    if (wallets?.items.length > 0) {
      const isAnyWalletSyncing = wallets?.items?.find((wallet) => wallet.status === 'syncing')
      const isAnyWalletBalanceNull = wallets?.items?.find((wallet) => wallet.balance === null)

      if (isAnyWalletSyncing || (isAnyWalletBalanceNull && !isFeatureEnabledForThisEnv)) {
        // Temporarily disable sync
        // TODO: Remove this once backend is updated
        // dispatch(setSyncing(true))
        dispatch(setSyncing(false))
        setPolling(5000)
      } else {
        dispatch(setSyncing(false))
        setPolling(0)
      }

      const mostRecentWallet = wallets?.items.reduce((a, b) =>
        new Date(a?.lastSyncedAt) > new Date(b?.lastSyncedAt) ? a : b
      )
      dispatch(setLastSyncedAt(mostRecentWallet?.lastSyncedAt))
    } else {
      dispatch(setSyncing(false))
    }
  }, [walletsRef.current, isFetching])

  const time = useTimeDistance(lastSyncedAt)

  const checkWalletSync = () => {
    dispatch(setSyncing(true))
    getWalletsTrigger({
      orgId: organisationId,
      params: {
        size: 999
      }
    })

    setPolling(5000)
  }

  const startWalletSync = async () => {
    dispatch(setSyncing(true))
    syncWalletTrigger({ organisationId })
      .unwrap()
      .then(() => {
        getWalletsTrigger({
          orgId: organisationId,
          params: {
            size: 999
          }
        })
        setPolling(5000)
      })
  }

  return { lastUpdated: time, startWalletSync, checkWalletSync, isSyncing }
}
