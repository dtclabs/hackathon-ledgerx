/* eslint-disable class-methods-use-this */
import { ethers, Contract, BigNumber } from 'ethers'

export type IBalanceMeta = {
  decimals: number
}

class EthersService {
  provider: ethers.providers.JsonRpcProvider

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  }

  async checkBalance(walletAddress: string, contractAddress?: string, meta?: IBalanceMeta): Promise<string> {
    try {
      if (contractAddress) {
        // If contract address is provided, fetch token balance
        const contract: Contract = new ethers.Contract(
          contractAddress,
          ['function balanceOf(address) view returns (uint)'],
          this.provider
        )
        const balance: ethers.BigNumber = await contract.balanceOf(walletAddress)
        return ethers.utils.formatUnits(balance, meta.decimals ?? 'ether')
      }
      // If no contract address is provided, fetch native coin balance
      const balance: ethers.BigNumber = await this.provider.getBalance(walletAddress)
      return ethers.utils.formatEther(balance)
    } catch (error) {
      console.error('Error checking balance:', error)
      throw error
    }
  }

  async checkContractTokenAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    meta: IBalanceMeta
  ): Promise<string> {
    const tokenContract: Contract = new ethers.Contract(
      tokenAddress,
      ['function allowance(address owner, address spender) view returns (uint256)'],
      this.provider
    )

    try {
      const allowance: BigNumber = await tokenContract.allowance(ownerAddress, spenderAddress)
      return ethers.utils.formatUnits(allowance, meta.decimals ?? 'ether')
    } catch (error) {
      console.error('Error checking contract token allowance:', error)
      throw error
    }
  }

  async checkTokenAllowance(walletAddress: string, tokenAddress: string): Promise<string> {
    const contract: Contract = new ethers.Contract(
      tokenAddress,
      ['function allowance(address owner, address spender) view returns (uint256)'],
      this.provider
    )

    try {
      const allowance: BigNumber = await contract.allowance(walletAddress, tokenAddress)
      return ethers.utils.formatUnits(allowance, 'ether')
    } catch (error) {
      console.error('Error checking token allowance:', error)
      throw error
    }
  }

  async setTokenApproval(
    contractAddress: string,
    spenderAddress: string,
    amount: string | BigNumber,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const contract = new ethers.Contract(
      contractAddress,
      ['function approve(address spender, uint256 amount) public returns (bool)'],
      signer
    )

    try {
      const transaction = await contract.approve(spenderAddress, ethers.utils.parseUnits(String(amount), 'ether'))
      await transaction.wait()
      return transaction
    } catch (error) {
      console.error('Error setting token approval:', error)
      throw error
    }
  }
}

export default EthersService
