import { useRef, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers, BigNumber } from 'ethers'
import EthersServiceV2 from '@/services/ether-service-v2'
import ERC20_ABI from '@/constants-v2/abi/erc20.json'
import { Result } from '@/shared/types'
import { IGenericError, IWalletActionRejected } from '@/shared/error-types'

interface ISetAllowance {
  spenderAddress: string
  amount?: string | BigNumber
}

type ISetNewAllowanceErrors = IGenericError | IWalletActionRejected

export const useErc20Approval = () => {
  const { library } = useWeb3React()

  const erc20Contract = useRef<any | null>(null)
  const [error, setError] = useState<string | null>(null) // TODO - Add this so can also work with side effects
  const [isApprovalLoading, setIsApprovalLoading] = useState(false)
  const [isApprovalSuccess, setIsApprovalSuccess] = useState(false)

  const setContract = async ({ tokenAddress }: { tokenAddress: string }): Promise<Result<boolean, any>> => {
    try {
      const signer = library.getSigner()
      const ethersService = new EthersServiceV2(library.provider)
      const contract = await ethersService.getContract({
        contractAddress: tokenAddress,
        ERC20_ABI,
        library
      })
      erc20Contract.current = contract.connect(signer)
      return {
        isSuccess: true,
        data: true
      }
    } catch (_error) {
      return {
        isSuccess: false,
        error: 'ERC2OContractApprovalError'
      }
    }
  }

  const setNewAllowance = async ({
    spenderAddress,
    amount
  }: ISetAllowance): Promise<Result<string, ISetNewAllowanceErrors>> => {
    try {
      setIsApprovalSuccess(false)
      setIsApprovalLoading(true)
      const decimals = await erc20Contract.current.decimals()
      let _allowanceAmount = ethers.constants.MaxUint256
      if (amount) {
        // TODO - Add checks for amount
        _allowanceAmount = ethers.utils.parseUnits(String(amount), decimals)
      }
      const transactionResponse = await erc20Contract.current.approve(spenderAddress, _allowanceAmount)
      const transactionReceipt = await transactionResponse.wait()
      setIsApprovalLoading(false)
      setIsApprovalSuccess(true)

      return {
        isSuccess: true,
        data: transactionReceipt
      }
    } catch (_err: any) {
      console.log(_err)
      setIsApprovalLoading(false)
      setIsApprovalSuccess(false)
      if (_err.code === 'ACTION_REJECTED') {
        return {
          isSuccess: false,
          error: {
            type: 'WalletActionRejected',
            message: 'Disperse contract approval rejected',
            systemMessage: 'Disperse contract approval rejected'
          }
        }
      }
      return {
        isSuccess: false,
        error: {
          type: 'GenericError',
          message: 'Error attempting to increase allowance',
          systemMessage: 'Error Interacting with contract'
        }
      }
    }
  }

  return {
    error,
    setContract,
    setNewAllowance,
    isApprovalLoading,
    isApprovalSuccess
  }
}

export default useErc20Approval
