import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface UseDeviceTypeReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  width: number
}

const useDeviceType = (): UseDeviceTypeReturn => {
  const [deviceInfo, setDeviceInfo] = useState<UseDeviceTypeReturn>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    deviceType: 'desktop',
    width: 0
  })

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      let deviceType: DeviceType = 'desktop'
      if (isMobile) deviceType = 'mobile'
      else if (isTablet) deviceType = 'tablet'

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        width
      })
    }

    // Check on mount
    checkDeviceType()

    // Add event listener for window resize
    window.addEventListener('resize', checkDeviceType)

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', checkDeviceType)
    }
  }, [])

  return deviceInfo
}

export default useDeviceType
