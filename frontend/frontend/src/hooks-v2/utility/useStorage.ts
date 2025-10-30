import { useCallback, useMemo } from 'react'
import StorageService, { AllowedStorageKeys } from '@/services/local-storage.service'

// You can allow specifying the storage type (local/session) through the hook parameters
const useStorage = (storageType: 'local' | 'session' = 'local') => {
  // Instantiating the StorageService
  const storageService = useMemo(() => new StorageService(storageType), [storageType])

  const setItem = useCallback(
    (key: AllowedStorageKeys, value: any) => {
      storageService.setItem(key, value)
    },
    [storageService]
  )

  const getItem = useCallback((key: AllowedStorageKeys): any => storageService.getItem(key), [storageService])

  const removeItem = useCallback(
    (key: AllowedStorageKeys) => {
      storageService.removeItem(key)
    },
    [storageService]
  )

  const clear = useCallback(() => {
    storageService.clear()
  }, [storageService])

  const hasItem = useCallback((key: AllowedStorageKeys): boolean => storageService.hasItem(key), [storageService])

  return { setItem, getItem, removeItem, clear, hasItem }
}

export default useStorage
