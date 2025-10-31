import { useWeb3React } from '@web3-react/core'
import { useAppDispatch, useAppSelector } from '@/state'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import { setChain, selectedChainSelector } from '@/slice/platform/platform-slice'
import { ethers } from 'ethers'
import { supportNetwork } from './data'
import { CHAINID } from '@/constants/chains'
import { captureException as sentryCaptureException } from '@sentry/nextjs'


const useSwitchNetworkController = () => {
    const { account, chainId: connectedChainId } = useWeb3React()
    const { data: supportedChains } = useGetChainsQuery({})
    const dispatch = useAppDispatch()
    const selectedChain = useAppSelector(selectedChainSelector)


    const handleChangeNetwork = async (chain: any) => {
        try {
            dispatch(setChain(chain.chainId))

            // TODO - Remove Local Storage Stuff
            window.localStorage.setItem(CHAINID, chain.chainId)
            window.localStorage.setItem('CURRENT_NETWORK', chain.name)

            if (account) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${chain.chainId}` }]
                })
            }
        } catch (switchError: any) {
            sentryCaptureException(switchError)
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        ...supportNetwork[chain.name]
                    }
                ]
            })
        }
    }
    return {}
}

export default useSwitchNetworkController