import { PUBLIC_PATH } from '@/components/RouterGuard/RouterGuard'
import { logOut } from '@/state/user/actions'
import { connectorLocalStorageKey, connectorsByName } from './web3React'

export const clearUserStates = (dispatch) => {
  // This localStorage key is set by @web3-react/walletconnect-connector
  dispatch(logOut())
  if (window.localStorage.getItem('walletconnect')) {
    window.localStorage.removeItem('walletconnect')
    connectorsByName.walletconnect.close()
    connectorsByName.walletconnect.deactivate()
    connectorsByName.walletconnect.walletConnectProvider = null
  }
  if (!PUBLIC_PATH.includes(window.location.pathname)) {
    window.localStorage.removeItem(connectorLocalStorageKey)
  }
}
