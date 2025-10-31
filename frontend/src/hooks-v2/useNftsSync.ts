import { useLazyGetLatestNftSyncQuery, useSyncNftDataMutation } from '@/api-v2/nft/nfts-api'
import { NftSyncStatus } from '@/api-v2/nft/nfts.type'
import { useTimeDistance } from '@/hooks/useTimeDistance'
import { log } from '@/utils-v2/logger'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'

interface IUseNftSync {
  organizationId: string
  onSyncSuccess?: () => void
}

export const useNftSync = ({ organizationId, onSyncSuccess }: IUseNftSync) => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState('')
  const [polling, setPolling] = useState(0)

  const [latestNftSync, syncNftTriggerResult] = useSyncNftDataMutation()
  const [
    getLatestNftSyncTrigger,
    { data: latestNft, isFetching, isError: isLazyGetLatestNftError, error: lazyGetLatestNftError }
  ] = useLazyGetLatestNftSyncQuery({ pollingInterval: polling })

  useEffect(() => {
    if (organizationId) {
      setIsSyncing(true)
      getLatestNftSyncTrigger(
        {
          organizationId
        },
        false
      )
    }
  }, [organizationId])

  useEffect(() => {
    if (syncNftTriggerResult.isError) {
      setIsSyncing(false)
      setPolling(0)
      log.error(
        `${syncNftTriggerResult?.error?.status} API Error in useNftSync hook while syncing nfts`,
        [`${syncNftTriggerResult?.error?.status} API Error in useNftSync hook while syncing nfts`],
        { actualErrorObject: JSON.stringify(syncNftTriggerResult?.error) },
        `${window.location.pathname}`
      )
    }
  }, [syncNftTriggerResult.isError])

  useEffect(() => {
    if (isLazyGetLatestNftError) {
      log.error(
        `${lazyGetLatestNftError?.status} API Error while fetching nfts data in useNftSync hook`,
        [`${lazyGetLatestNftError?.status} API Error while fetching nfts data in useNftSync hook`],
        { actualErrorObject: JSON.stringify(lazyGetLatestNftError) },
        `${window.location.pathname}`
      )
      setLastSyncedAt(null)
    }
  }, [isLazyGetLatestNftError])

  useEffect(() => {
    if (!isEmpty(latestNft)) {
      if (latestNft?.status === NftSyncStatus.RUNNING) {
        setIsSyncing(true)
        setPolling(5000)
      } else if ([NftSyncStatus.COMPLETED, NftSyncStatus.FAILED].includes(latestNft?.status)) {
        setIsSyncing(false)
        setPolling(0)
        onSyncSuccess()
      }
      setLastSyncedAt(latestNft?.createdAt?.toString())
    } else {
      setIsSyncing(false)
    }
  }, [isFetching])

  const time = useTimeDistance(lastSyncedAt || '')

  const startNftSync = async () => {
    setIsSyncing(true)
    latestNftSync({ organizationId })
      .unwrap()
      .then(() => {
        getLatestNftSyncTrigger({
          organizationId
        })
        setPolling(5000)
      })
  }

  return {
    lastUpdated: lastSyncedAt === null ? 'Never' : time,
    startNftSync,
    isSyncing,
    hasSyncedBefore: lastSyncedAt !== null
  }
}
