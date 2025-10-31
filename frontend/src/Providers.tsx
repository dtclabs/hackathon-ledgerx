import React from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { Provider } from 'react-redux'
import { Web3Provider } from '@ethersproject/providers'
import { Store } from '@reduxjs/toolkit'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'

export const getLibrary = (provider): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 1000 // Recommended interval in docs for account / network changes
  return library
}

const Providers: React.FC<{ children; store: Store }> = ({ children, store }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <Provider store={store}>
      <MobileMenuProvider>{children}</MobileMenuProvider>
    </Provider>
  </Web3ReactProvider>
)

export default Providers
