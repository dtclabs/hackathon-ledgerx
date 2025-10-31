/* eslint-disable no-else-return */
import { useAppSelector } from '@/state'
import { userOrganizationPermissionSelector } from '@/slice/account/account-slice'

const intersectionExists = (userPermissions, requiredPermissions) => {
  // Convert the second array to a Set for faster lookup
  const permissionSet = new Set(requiredPermissions)
  for (const permission of userPermissions) {
    if (permissionSet.has(permission)) {
      return true
    }
  }
  return false
}

export const usePermissions = () => {
  const permissions = useAppSelector(userOrganizationPermissionSelector)

  const hasPermission = (permissionName) => {
    if (typeof permissionName === 'string') {
      return permissions?.includes(permissionName)
    } else if (Array.isArray(permissionName)) {
      return intersectionExists(permissionName, permissions)
    } else {
      throw new Error('Only strings or Array is allowed')
    }
  }
  return { hasPermission }
}
