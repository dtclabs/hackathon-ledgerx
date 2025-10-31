import { useEffect, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import EthersServiceV2 from '@/services/ether-service-v2'
import { DISPERSE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'
import DISPERSE_ABI from '@/constants-v2/abi/disperse.json'
import { GenericError, WalletActionRejected } from '@/shared/error-types'

interface ITransactionResponse {
  blockHash: string
  blockNumber: number
  byzantium: boolean
  confirmations: number
  contractAddress: string | null
  cumulativeGasUsed: BigNumber
  effectiveGasPrice: BigNumber
  events: any[] // Might want to define a proper type for events
  from: string
  gasUsed: BigNumber
  logs: any[] // Might want to define a proper type for logs
  logsBloom: string
  status: number
  to: string
  transactionHash: string
  transactionIndex: number
  type: number
}

interface BigNumber {
  _hex: string
  _isBigNumber: boolean
  // Add more properties if necessary
}
export interface IDisperseAlloweanceParams {
  spenderAddress: string
  tokenAddress: string
  meta: {
    decimals: number
  }
}

export interface ISendNativeCoinTransfer {
  recipients: string[]
  amounts: string[]
  payableAmount: string
  meta: {
    decimals: number
  }
}

export interface ISendTokenTransfer {
  tokenAddress: string
  recipients: string[]
  amounts: string[]
  payableAmount: string
  meta: {
    decimals: number
  }
}

export const useDisperseContract = () => {
  const { library, active } = useWeb3React()
  const ethersService = useRef<EthersServiceV2 | null>(null)
  const disperseContract = useRef<any | null>(null)

  useEffect(() => {
    if (active && library) {
      try {
        const service = new EthersServiceV2(library.provider)
        ethersService.current = service
      } catch (err) {
        throw new Error('Issue with setting EthersService')
      }
    }
  }, [library, active])

  const setContract = async ({ chainName }: { chainName: string }) => {
    if (library && chainName && ethersService.current) {
      const disperseContractAddress = DISPERSE_CONTRACT_MAP[chainName]
      if (!disperseContractAddress) {
        throw new Error('Disperse contract address not found')
      }
      const signer = library.getSigner()
      const contract = await ethersService.current.getContract({
        contractAddress: disperseContractAddress,
        ERC20_ABI: DISPERSE_ABI,
        library
      })
      disperseContract.current = contract.connect(signer)

      console.log('Disperse Contract Initiated', disperseContract.current)
    }
  }

  const executeNativeCoinTransfer = async ({
    recipients,
    amounts,
    payableAmount,
    meta
  }: ISendNativeCoinTransfer): Promise<{
    transactionHash: string
    wait: () => Promise<ITransactionResponse>
  }> => {
    if (disperseContract.current) {
      try {
        const parsedAmounts = amounts.map((amount) => parseUnits(amount, meta?.decimals))
        const transaction = await disperseContract.current.disperseEther(recipients, parsedAmounts, {
          value: parseEther(payableAmount).toString()
        })
        return {
          transactionHash: transaction.hash,
          wait: async () => transaction.wait()
        }
      } catch (error: any) {
        if (error.code === 'ACTION_REJECTED') {
          throw new WalletActionRejected('Transaction rejected by user', 'Disperse native transfer rejected')
        }
        throw new GenericError('Error executing disperse native transfer', 'Disperse native transfer error')
      }
    }
    return null
  }

  const executeBatchTokenTransfer = async ({
    tokenAddress,
    recipients,
    amounts,
    meta
  }: ISendTokenTransfer): Promise<{
    transactionHash: string
    wait: () => Promise<ITransactionResponse>
  }> => {
    if (disperseContract.current) {
      try {
        const parsedAmounts = amounts.map((amount) => parseUnits(amount, meta?.decimals))
        const transaction = await disperseContract.current.disperseToken(tokenAddress, recipients, parsedAmounts)

        return {
          transactionHash: transaction.hash,
          wait: async () => transaction.wait()
        }
      } catch (error: any) {
        if (error.code === 'ACTION_REJECTED') {
          throw new WalletActionRejected('Transaction rejected by user', 'Disperse token transfer rejected')
        }
        throw new GenericError('Error executing disperse token transfer')
      }
    }
    return null
  }

  const estimateNativeCoinTransferGas = async ({
    recipients,
    amounts,
    payableAmount,
    meta
  }: ISendNativeCoinTransfer) => {
    try {
      if (parseFloat(payableAmount) <= 0) {
        throw new GenericError('Payable amount should be greater than 0')
      }

      const parsedAmounts = amounts.map((amount) => parseUnits(amount, meta?.decimals))

      const transaction = await disperseContract.current.estimateGas.disperseEther(recipients, parsedAmounts, {
        value: parseEther(payableAmount).toString()
      })
      return {
        wei: transaction.toString(),
        eth: ethers.utils.formatEther(transaction)
      }
      // return transaction
    } catch (error) {
      throw new GenericError('Error estimating native coin transfer gas')
    }
  }

  return { setContract, executeNativeCoinTransfer, estimateNativeCoinTransferGas, executeBatchTokenTransfer }
}

export default useDisperseContract
