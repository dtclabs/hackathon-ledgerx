/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from '@/state'
import { setChain } from '@/slice/platform/platform-slice'

export const useWeb3Listener = () => {
  const { library, account, connector } = useWeb3React()
  const dispatch = useAppDispatch()

  const handleWeb3Updated = (payload) => {
    if (payload.chainId) {
      dispatch(setChain(String(parseInt(payload.chainId))))
    }
  }

  useEffect(() => {
    if (library && account && connector) {
      dispatch(setChain(String(parseInt(library.provider?.chainId))))
      connector.addListener('Web3ReactUpdate', handleWeb3Updated)

      return () => {
        connector.removeListener('Web3ReactUpdate', handleWeb3Updated)
      }
    }
    return undefined
  }, [library, account, dispatch, connector])
}

export default useWeb3Listener
