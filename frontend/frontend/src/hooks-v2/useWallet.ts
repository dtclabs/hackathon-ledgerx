import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { captureException as sentryCaptureException } from '@sentry/nextjs'


export const useWalletAuth = () => {
  const { account, activate, deactivate, chainId, active, connector, error, library } = useWeb3React()

  const connectMetamaskWallet = async () => {
    const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 5] })
    try {
      await activate(injectedConnector)
    } catch (err) {
      sentryCaptureException(err)
      console.log('ERR: ', err)
    }
  }

  const connectWalletConnect = async () => {
    throw new Error('Not implemented')
    // const injectedConnector = new CustomWalletConnectConnector({
    //   supportedChainIds: [1, 5],
    //   rpcMap: { 1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' }
    // })
    // try {
    //   await activate(injectedConnector)
    // } catch (err) {
    //   sentryCaptureException(err)
    //   console.log('ERR: ', err)
    // }
  }

  return { account, library, connectMetamaskWallet, connectWalletConnect }
}
