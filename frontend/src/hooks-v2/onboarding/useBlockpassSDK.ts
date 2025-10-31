import { useEffect, useRef, useState } from 'react'

const useBlockpassSDK = () => {
  const refId = useRef('your_user_id') // Use useRef to manage refId

  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // Check if the script is already loaded
    // @ts-ignore
    if (window?.BlockpassKYCConnect) {
      setIsScriptLoaded(true)
    } else {
      // Listen for script load event
      const script = document.querySelector(
        'script[src="https://cdn.blockpass.org/widget/scripts/release/3.0.2/blockpass-kyc-connect.prod.js"]'
      )
      if (script) {
        script.addEventListener('load', () => setIsScriptLoaded(true))
      }
    }
  }, [])

  useEffect(() => {
    if (isScriptLoaded) {
      loadBlockpassWidget()
    }
  }, [isScriptLoaded])

  const loadBlockpassWidget = () => {
    // @ts-ignore
    const blockpass = new window.BlockpassKYCConnect(
      'hqxyz', // service client_id from the admin console
      {
        refId: refId.current // assign the local user_id of the connected user
      }
    )

    blockpass.startKYCConnect()
    blockpass.on('KYCConnectSuccess', (x) => {
      console.log('Blockpass KYC Connect success: ', x)
      // add code that will trigger when data has been sent
    })

    blockpass.on('KYCConnectClose', (x) => {
      console.log('Blockpass KYC Connect widget closed', x)
    })

    blockpass.on('KYCConnectCancel', () => setIsLoading(false))

    // blockpass.on('KYCConnectLoad', () => {
    //   console.log('Blockpass KYC Connect widget loaded')
    // })
  }

  const startBlockpassKYC = () => setIsLoading(true)
  return {
    startBlockpassKYC,
    isLoading
  }
}

export default useBlockpassSDK
