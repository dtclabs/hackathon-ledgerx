export type StorageType = 'local' | 'session'
export type AllowedStorageKeys =
  | 'organizationId'
  | 'wallet-provider'
  | 'isBuildbearEnabled'
  | 'integration-type'
  | 'rootfi-linkId-xero'
  | 'rootfi-linkId-quickbooks'
  | 'is-card-onboarding-acknowledged'

class StorageService {
  private storage: Storage

  constructor(type: StorageType = 'local') {
    this.storage = type === 'local' ? localStorage : sessionStorage
  }

  setItem(key: AllowedStorageKeys, value: any) {
    // Automatically convert objects to strings
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    this.storage.setItem(key, stringValue)
  }

  getItem(key: AllowedStorageKeys): any {
    const item = this.storage.getItem(key)
    if (item === null) {
      return null
    }
    try {
      // Attempt to parse JSON, if it fails return the original string
      return JSON.parse(item)
    } catch (e) {
      // Return the original string if JSON parsing fails
      return item
    }
  }

  removeItem(key: AllowedStorageKeys) {
    this.storage.removeItem(key)
  }

  clear() {
    this.storage.clear()
  }

  hasItem(key: AllowedStorageKeys): boolean {
    return this.getItem(key) !== null
  }
}

export default StorageService
