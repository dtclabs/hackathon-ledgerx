import React from 'react'
import { usePhantomMobileWallet } from '@/hooks-v2/usePhantomMobileWallet'
import { Button } from '@/components/ui/button'
import { TypographyV2 } from '@/components-v2'

/**
 * Test component for Phantom Mobile Wallet integration
 * This component can be used to test the mobile wallet adapter functionality
 */
const PhantomMobileTest: React.FC = () => {
  const { connectPhantomMobile, isConnecting, error } = usePhantomMobileWallet()

  const handleTestConnection = async () => {
    console.log('Testing Phantom Mobile Wallet connection...')
    const result = await connectPhantomMobile()
    if (result) {
      console.log('Connection successful:', result)
    } else {
      console.log('Connection failed')
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <TypographyV2 variant="title2" className="mb-4">
        Phantom Mobile Wallet Test
      </TypographyV2>

      <Button onClick={handleTestConnection} disabled={isConnecting} className="mb-4">
        {isConnecting ? 'Connecting...' : 'Test Phantom Mobile Connection'}
      </Button>

      {error && <div className="text-red-500 text-sm">Error: {error}</div>}

      <div className="text-sm text-gray-600">
        <p>This test component verifies the Phantom Mobile Wallet integration.</p>
        <p>Make sure you have the Phantom mobile app installed on your device.</p>
      </div>
    </div>
  )
}

export default PhantomMobileTest
