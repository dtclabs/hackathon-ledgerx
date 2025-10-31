import type { Signer } from '@ethersproject/abstract-signer'
import { Contract } from '@ethersproject/contracts'

// ABI
// import type { Erc20 } from '@/config/abi/types'
import erc20Abi from '@/config/abi/erc20.json'
import disperse from '@/config/abi/disperse.json'

// Types

export const getContract = (abi: any, address: string, signer: Signer) => new Contract(address, abi, signer)

export const getErc20Contract = (address: string, signer: Signer) => getContract(erc20Abi, address, signer)

export const getDisperseContract = (address: string, signer: Signer) => getContract(disperse, address, signer)
