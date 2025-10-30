import { useEffect, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import EthersServiceV2 from '@/services/ether-service-v2'
import { Result } from '@/shared/types'
import { DISPERSE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'
import ERC20_ABI from '@/constants-v2/abi/erc20.json'
import { GenericError, WalletActionRejected } from '@/shared/error-types'

interface ICheckContractTokenAllowance {
  ownerAddress: string
  spenderAddress: string
}

interface ICheckBalance {
  walletAddress: string
}

export const useERC20Contact = () => {
  const { library, active } = useWeb3React()
  const ethersService = useRef<EthersServiceV2 | null>(null)
  const erc20Contract = useRef<any | null>(null)

  useEffect(() => {
    if (active && library) {
      try {
        const service = new EthersServiceV2(library.provider)
        ethersService.current = service
      } catch (err) {
        throw new GenericError('Sorry there was no active provider', 'Error initiating EthersService')
      }
    }
  }, [library, active])

  const setContract = async ({ tokenAddress }: { tokenAddress: string }) => {
    try {
      const signer = library.getSigner()
      const contract = await ethersService.current.getContract({
        contractAddress: tokenAddress,
        ERC20_ABI,
        library
      })
      erc20Contract.current = contract.connect(signer)
      return erc20Contract.current
    } catch (_error) {
      console.error('Error initializing contract:', _error)
      throw new GenericError('Error initializing contract')
    }
  }

  interface IGetContractWithSigner {
    tokenAddress: string
    erc20Abi?: any
  }

  const getContractWithSigner = async ({ tokenAddress, erc20Abi }: IGetContractWithSigner) => {
    try {
      const signer = library.getSigner()
      const contract = await ethersService.current.getContract({
        contractAddress: tokenAddress,
        ERC20_ABI: erc20Abi || ERC20_ABI,
        library
      })

      return contract.connect(signer)
    } catch (_error) {

      throw new GenericError('Error initializing contract')
    }
  }

  const checkContractAllowance = async ({
    ownerAddress,
    spenderAddress
  }: ICheckContractTokenAllowance): Promise<Result<string, any>> => {
    try {
      const decimals = await erc20Contract?.current?.decimals()
      const allowance = await erc20Contract?.current?.allowance(ownerAddress, spenderAddress)
      return {
        isSuccess: true,
        data: ethers.utils.formatUnits(allowance, decimals)
      }
    } catch (_error) {
      throw new GenericError('Error checking contract allowance')
    }
  }

  const checkBalance = async ({ walletAddress }: ICheckBalance): Promise<Result<string, any>> => {
    const decimals = await erc20Contract?.current?.decimals()
    try {
      const allowance = await erc20Contract?.current?.balanceOf(walletAddress)
      return {
        isSuccess: true,
        data: ethers.utils.formatUnits(allowance, decimals)
      }
    } catch (_error) {
      throw new GenericError('Error checking contract token balance')
    }
  }

  return { setContract, checkBalance, checkContractAllowance, contract: erc20Contract.current, getContractWithSigner }
}

export default useERC20Contact
