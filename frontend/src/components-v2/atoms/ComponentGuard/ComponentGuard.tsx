import { ReactNode } from 'react'
import { usePermissions } from '@/hooks-v2/usePermissions'

interface IProps {
  requiredPermission: string
  children: any
  fallback?: ReactNode
}

const ComponentGuard = ({ requiredPermission, children, fallback }: IProps) => {
  const { hasPermission } = usePermissions()

  if (!hasPermission(requiredPermission)) {
    if (fallback) {
      return fallback
    }
    return null
  }
  return children
}

export default ComponentGuard
